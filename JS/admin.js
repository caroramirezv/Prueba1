document.addEventListener("DOMContentLoaded", () => {
    const tipoUsuarioActual = localStorage.getItem("tipoUsuario");
    if (tipoUsuarioActual !== "Administrador" && tipoUsuarioActual !== "Vendedor") {
        window.location.href = "InicioSesion.html";
        return;
    }

    renderizarTablaProductos();
    renderizarTablaUsuarios();
    inicializarRegiones();


    if (tipoUsuarioActual === "Vendedor") {
        const liUsuarios = document.getElementById("li-tab-usuarios");
        if (liUsuarios) liUsuarios.classList.add("d-none");

        const btnNuevoProducto = document.getElementById("btn-nuevo-producto");
        if (btnNuevoProducto) btnNuevoProducto.classList.add("d-none");
    }

    const formProducto = document.getElementById("form-producto");
    if (formProducto) {
        formProducto.addEventListener("submit", guardarProducto);
    }

    const formUsuario = document.getElementById("form-usuario");
    if (formUsuario) {
        formUsuario.addEventListener("submit", guardarUsuario);
    }

    const selectRegion = document.getElementById("usr-region");
    if (selectRegion) {
        selectRegion.addEventListener("change", (e) => {
            cargarComunas(e.target.value);
        });
    }
});

function cambiarSeccion(seccion) {
    const secProd = document.getElementById("seccion-productos");
    const secUsr = document.getElementById("seccion-usuarios");
    const tabProd = document.getElementById("tab-productos");
    const tabUsr = document.getElementById("tab-usuarios");

    if (seccion === "productos") {
        secProd.classList.remove("d-none");
        secUsr.classList.add("d-none");
        tabProd.classList.add("active");
        tabUsr.classList.remove("active");
    } else {
        secUsr.classList.remove("d-none");
        secProd.classList.add("d-none");
        tabUsr.classList.add("active");
        tabProd.classList.remove("active");
    }
}

function renderizarTablaProductos() {
    const tbody = document.getElementById("tabla-admin-productos");
    if (!tbody) return;

    const productos = JSON.parse(localStorage.getItem("catalogoProductos")) || [];
    tbody.innerHTML = "";

    if (productos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-muted">No hay productos registrados.</td></tr>`;
        return;
    }

    productos.forEach(prod => {
        const esCritico = prod.stockCritico !== null && prod.stock <= prod.stockCritico;
        const badgeStock = esCritico 
            ? `<span class="badge bg-danger">Crítico: ${prod.stock}</span>` 
            : `<span class="badge bg-success">${prod.stock}</span>`;

        const esVendedor = localStorage.getItem("tipoUsuario") === "Vendedor";
        const botonesAccion = esVendedor ? "" : `
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="editarProducto('${prod.id}')">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="eliminarProducto('${prod.id}')">
                        <i class="fa-solid fa-trash"></i>
                    </button>`;

        tbody.innerHTML += `
            <tr>
                <td><img src="${prod.imagen}" width="40" height="40" class="rounded object-fit-cover"></td>
                <td class="fw-bold">${prod.id}</td>
                <td>${prod.nombre}</td>
                <td><span class="badge bg-secondary">${prod.categoria}</span></td>
                <td>$${parseFloat(prod.precio).toLocaleString("es-CL")}</td>
                <td>${badgeStock}</td>
                <td class="text-end pe-4">${botonesAccion}</td>
            </tr>
        `;
    });
}

function prepararCreacionProducto() {
    document.getElementById("form-producto").reset();
    document.getElementById("prod-es-edicion").value = "false";
    document.getElementById("prod-codigo").disabled = false;
    document.getElementById("modalProductoTitle").textContent = "Nuevo Producto";
    
    const modalElement = document.getElementById("modalProducto");
    const modal = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
    modal.show();
}

function editarProducto(codigo) {
    const productos = JSON.parse(localStorage.getItem("catalogoProductos")) || [];
    const prod = productos.find(p => p.id === codigo);

    if (prod) {
        document.getElementById("prod-es-edicion").value = "true";
        document.getElementById("prod-codigo").value = prod.id;
        document.getElementById("prod-codigo").disabled = true;
        document.getElementById("prod-nombre").value = prod.nombre;
        document.getElementById("prod-descripcion").value = prod.descripcion || "";
        document.getElementById("prod-precio").value = prod.precio;
        document.getElementById("prod-stock").value = prod.stock;
        document.getElementById("prod-stock-critico").value = prod.stockCritico !== null ? prod.stockCritico : "";
        document.getElementById("prod-categoria").value = prod.categoria;
        document.getElementById("prod-imagen").value = prod.imagen;

        document.getElementById("modalProductoTitle").textContent = "Editar Producto";
        const modalElement = document.getElementById("modalProducto");
        const modal = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
        modal.show();
    }
}

function guardarProducto(e) {
    e.preventDefault();

    if (localStorage.getItem("tipoUsuario") === "Vendedor") {
        Swal.fire("Acceso restringido", "El rol Vendedor no puede crear ni modificar productos.", "error");
        return;
    }

    const codigo = document.getElementById("prod-codigo").value.trim();
    const nombre = document.getElementById("prod-nombre").value.trim();
    const descripcion = document.getElementById("prod-descripcion").value.trim();
    const precio = parseFloat(document.getElementById("prod-precio").value);
    const stock = parseInt(document.getElementById("prod-stock").value);
    const stockCriticoInput = document.getElementById("prod-stock-critico").value;
    const stockCritico = stockCriticoInput !== "" ? parseInt(stockCriticoInput) : null;
    const categoria = document.getElementById("prod-categoria").value;
    const imagen = document.getElementById("prod-imagen").value.trim() || "img/default.jpg";
    const esEdicion = document.getElementById("prod-es-edicion").value === "true";

    if (codigo.length < 3) {
        Swal.fire("Error", "El código del producto debe tener al menos 3 caracteres.", "error");
        return;
    }
    if (isNaN(precio) || precio < 0) {
        Swal.fire("Error", "El precio debe ser un número mayor o igual a 0.", "error");
        return;
    }
    if (isNaN(stock) || stock < 0) {
        Swal.fire("Error", "El stock debe ser un número entero mayor o igual a 0.", "error");
        return;
    }

    let productos = JSON.parse(localStorage.getItem("catalogoProductos")) || [];

    if (!esEdicion && productos.some(p => p.id === codigo)) {
        Swal.fire("Error", "Ya existe un producto registrado con este código.", "error");
        return;
    }

    const nuevoProd = { id: codigo, nombre, descripcion, precio, stock, stockCritico, categoria, imagen };

    if (esEdicion) {
        const idx = productos.findIndex(p => p.id === codigo);
        if (idx !== -1) productos[idx] = nuevoProd;
    } else {
        productos.push(nuevoProd);
    }

    localStorage.setItem("catalogoProductos", JSON.stringify(productos));
    renderizarTablaProductos();

    const modalElement = document.getElementById("modalProducto");
    const modal = bootstrap.Modal.getInstance(modalElement);
    if (modal) modal.hide();

    if (stockCritico !== null && stock <= stockCritico) {
        Swal.fire("Alerta de Stock Crítico", `Producto guardado. Su stock (${stock}) está igual o por debajo del stock crítico (${stockCritico}).`, "warning");
    } else {
        Swal.fire("¡Éxito!", "Producto procesado correctamente.", "success");
    }
}

function eliminarProducto(codigo) {
    Swal.fire({
        title: "¿Eliminar producto?",
        text: "Esta acción no se puede deshacer.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        confirmButtonText: "Sí, eliminar"
    }).then((result) => {
        if (result.isConfirmed) {
            let productos = JSON.parse(localStorage.getItem("catalogoProductos")) || [];
            productos = productos.filter(p => p.id !== codigo);
            localStorage.setItem("catalogoProductos", JSON.stringify(productos));
            renderizarTablaProductos();
            Swal.fire("Eliminado", "El producto fue removido.", "success");
        }
    });
}


function validarRUN(run) {
    const regex = /^[0-9]{7,8}[0-9kK]{1}$/;
    if (!regex.test(run)) return false;

    const cuerpo = run.slice(0, -1);
    let dv = run.slice(-1).toUpperCase();

    let suma = 0;
    let multiplicador = 2;

    for (let i = cuerpo.length - 1; i >= 0; i--) {
        suma += parseInt(cuerpo.charAt(i)) * multiplicador;
        multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
    }

    let dvEsperado = 11 - (suma % 11);
    if (dvEsperado === 11) dvEsperado = "0";
    else if (dvEsperado === 10) dvEsperado = "K";
    else dvEsperado = dvEsperado.toString();

    return dv === dvEsperado;
}

function validarCorreoDominio(correo) {
    const dominios = ["@duoc.cl", "@profesor.duoc.cl", "@gmail.com"];
    return dominios.some(dom => correo.toLowerCase().endsWith(dom));
}

function renderizarTablaUsuarios() {
    const tbody = document.getElementById("tabla-admin-usuarios");
    if (!tbody) return;

    const usuarios = JSON.parse(localStorage.getItem("usuarios_clstore")) || [];
    tbody.innerHTML = "";

    if (usuarios.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">No hay usuarios registrados.</td></tr>`;
        return;
    }

    usuarios.forEach(usr => {
        tbody.innerHTML += `
            <tr>
                <td class="fw-bold">${usr.run}</td>
                <td>${usr.nombre} ${usr.apellidos}</td>
                <td>${usr.correo}</td>
                <td><span class="badge bg-primary">${usr.tipo}</span></td>
                <td><small>${usr.comuna || ''}${usr.region ? ', ' + usr.region : ''}</small></td>
                <td class="text-end pe-4">
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="editarUsuario('${usr.run}')">
                        <i class="fa-solid fa-user-pen"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="eliminarUsuario('${usr.run}')">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
}

function prepararCreacionUsuario() {
    document.getElementById("form-usuario").reset();
    document.getElementById("usr-es-edicion").value = "false";
    document.getElementById("usr-run").disabled = false;

    const selectComuna = document.getElementById("usr-comuna");
    if (selectComuna) selectComuna.disabled = true;

    const inputPass = document.getElementById("usr-password");
    if (inputPass) inputPass.required = true;

    const hintPass = document.getElementById("usr-password-hint");
    if (hintPass) hintPass.textContent = "Requerida (entre 4 y 10 caracteres).";

    document.getElementById("modalUsuarioTitle").textContent = "Nuevo Usuario";

    const modalElement = document.getElementById("modalUsuario");
    const modal = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
    modal.show();
}

function editarUsuario(run) {
    const usuarios = JSON.parse(localStorage.getItem("usuarios_clstore")) || [];
    const usr = usuarios.find(u => u.run === run);

    if (usr) {
        document.getElementById("usr-es-edicion").value = "true";
        document.getElementById("usr-run").value = usr.run;
        document.getElementById("usr-run").disabled = true;
        document.getElementById("usr-nombre").value = usr.nombre;
        document.getElementById("usr-apellidos").value = usr.apellidos;
        document.getElementById("usr-correo").value = usr.correo;
        document.getElementById("usr-fecha-nacimiento").value = usr.fechaNacimiento || "";

        const inputPass = document.getElementById("usr-password");
        if (inputPass) {
            inputPass.value = "";
            inputPass.required = false;
        }

        const hintPass = document.getElementById("usr-password-hint");
        if (hintPass) hintPass.textContent = "Dejar vacío para no cambiarla.";

        document.getElementById("usr-tipo").value = usr.tipo;
        document.getElementById("usr-region").value = usr.region || "";

        cargarComunas(usr.region);
        document.getElementById("usr-comuna").value = usr.comuna || "";
        document.getElementById("usr-direccion").value = usr.direccion || "";

        document.getElementById("modalUsuarioTitle").textContent = "Editar Usuario";

        const modalElement = document.getElementById("modalUsuario");
        const modal = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
        modal.show();
    }
}

function guardarUsuario(e) {
    e.preventDefault();

    const run = document.getElementById("usr-run").value.trim().toUpperCase();
    const nombre = document.getElementById("usr-nombre").value.trim();
    const apellidos = document.getElementById("usr-apellidos").value.trim();
    const correo = document.getElementById("usr-correo").value.trim();
    const fechaNacimiento = document.getElementById("usr-fecha-nacimiento").value;
    const inputPass = document.getElementById("usr-password");
    const password = inputPass ? inputPass.value.trim() : "";
    const tipo = document.getElementById("usr-tipo").value;
    const region = document.getElementById("usr-region").value;
    const comuna = document.getElementById("usr-comuna").value;
    const direccion = document.getElementById("usr-direccion").value.trim();
    const esEdicion = document.getElementById("usr-es-edicion").value === "true";

    // Validaciones
    if (!validarRUN(run)) {
        Swal.fire("RUN Inválido", "El RUN ingresado no es válido. Escríbelo sin puntos ni guión.", "error");
        return;
    }

    if (!validarCorreoDominio(correo)) {
        Swal.fire("Correo No Permitido", "El correo debe finalizar en @duoc.cl, @profesor.duoc.cl o @gmail.com", "error");
        return;
    }

    if (!esEdicion && inputPass && (password.length < 4 || password.length > 10)) {
        Swal.fire("Contraseña Inválida", "La contraseña es obligatoria al crear un usuario y debe tener entre 4 y 10 caracteres.", "error");
        return;
    }

    if (password && (password.length < 4 || password.length > 10)) {
        Swal.fire("Contraseña Inválida", "La contraseña debe tener entre 4 y 10 caracteres.", "error");
        return;
    }

    let usuarios = JSON.parse(localStorage.getItem("usuarios_clstore")) || [];

    if (!esEdicion && usuarios.some(u => u.run === run)) {
        Swal.fire("Error", "Ya existe un usuario con este RUN.", "error");
        return;
    }

    if (!esEdicion && usuarios.some(u => u.correo && u.correo.toLowerCase() === correo.toLowerCase())) {
        Swal.fire("Error", "Ya existe un usuario con este correo.", "error");
        return;
    }

    const nuevoUsr = { run, nombre, apellidos, correo, fechaNacimiento, tipo, region, comuna, direccion };

    if (esEdicion) {
        const idx = usuarios.findIndex(u => u.run === run);
        if (idx !== -1) {
            nuevoUsr.password = password ? password : usuarios[idx].password;
            usuarios[idx] = nuevoUsr;
        }
    } else {
        nuevoUsr.password = password;
        usuarios.push(nuevoUsr);
    }

    localStorage.setItem("usuarios_clstore", JSON.stringify(usuarios));
    renderizarTablaUsuarios();

    const modalElement = document.getElementById("modalUsuario");
    const modal = bootstrap.Modal.getInstance(modalElement);
    if (modal) modal.hide();

    document.getElementById("form-usuario").reset();

    Swal.fire("¡Éxito!", "Usuario registrado/modificado correctamente.", "success");
}

function eliminarUsuario(run) {
    Swal.fire({
        title: "¿Eliminar usuario?",
        text: "Se quitará la cuenta del sistema.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        confirmButtonText: "Sí, eliminar"
    }).then((result) => {
        if (result.isConfirmed) {
            let usuarios = JSON.parse(localStorage.getItem("usuarios_clstore")) || [];
            usuarios = usuarios.filter(u => u.run !== run);
            localStorage.setItem("usuarios_clstore", JSON.stringify(usuarios));
            renderizarTablaUsuarios();
            Swal.fire("Eliminado", "El usuario fue borrado.", "success");
        }
    });
}


function inicializarRegiones() {
    const selectRegion = document.getElementById("usr-region");
    if (!selectRegion) return;

    selectRegion.innerHTML = `<option value="">Seleccione Región</option>`;
    REGIONES_Y_COMUNAS.forEach(item => {
        selectRegion.innerHTML += `<option value="${item.region}">${item.region}</option>`;
    });
}

function cargarComunas(regionNombre) {
    const selectComuna = document.getElementById("usr-comuna");
    if (!selectComuna) return;

    selectComuna.innerHTML = `<option value="">Seleccione Comuna</option>`;
    const regionEncontrada = REGIONES_Y_COMUNAS.find(r => r.region === regionNombre);

    if (regionEncontrada) {
        selectComuna.disabled = false;
        regionEncontrada.comunas.forEach(comuna => {
            selectComuna.innerHTML += `<option value="${comuna}">${comuna}</option>`;
        });
    } else {
        selectComuna.disabled = true;
    }
}
