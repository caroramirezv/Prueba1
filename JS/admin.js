// Arreglo de Regiones y Comunas
const regionesYComunas = [
    {
        region: "Región Metropolitana de Santiago",
        comunas: ["Santiago", "Puente Alto", "Maipú", "La Florida", "San Bernardo", "El Bosque"]
    },
    {
        region: "Región de Valparaíso",
        comunas: ["Valparaíso", "Viña del Mar", "Concón", "Quilpué", "Villa Alemana"]
    },
    {
        region: "Región del Biobío",
        comunas: ["Concepción", "Talcahuano", "San Pedro de la Paz", "Chiguayante"]
    }
];

document.addEventListener("DOMContentLoaded", () => {
    inicializarDatosDemo();
    renderizarTablaProductos();
    renderizarTablaUsuarios();
    inicializarRegiones();

// Eventos al guardar 
    document.getElementById("form-producto").addEventListener("submit", guardarProducto);
    document.getElementById("form-usuario").addEventListener("submit", guardarUsuario);

// Cambio dinámico de comuna al seleccionar región
    document.getElementById("usr-region").addEventListener("change", (e) => {
        cargarComunas(e.target.value);
    });
});

//Navegacion entre secciones
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

//Validacion de productos
function renderizarTablaProductos() {
    const tbody = document.getElementById("tabla-admin-productos");
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

        tbody.innerHTML += `
            <tr>
                <td><img src="${prod.imagen}" width="40" height="40" class="rounded object-fit-cover"></td>
                <td class="fw-bold">${prod.id}</td>
                <td>${prod.nombre}</td>
                <td><span class="badge bg-secondary">${prod.categoria}</span></td>
                <td>$${parseFloat(prod.precio).toLocaleString("es-CL")}</td>
                <td>${badgeStock}</td>
                <td class="text-end pe-4">
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="editarProducto('${prod.id}')">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="eliminarProducto('${prod.id}')">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
}

function prepararCreacionProducto() {
    document.getElementById("form-producto").reset();
    document.getElementById("prod-es-edicion").value = "false";
    document.getElementById("prod-codigo").disabled = false;
    document.getElementById("modalProductoTitle").textContent = "Nuevo Producto";
    
    const modal = new bootstrap.Modal(document.getElementById("modalProducto"));
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
        const modal = new bootstrap.Modal(document.getElementById("modalProducto"));
        modal.show();
    }
}

function guardarProducto(e) {
    e.preventDefault();

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

// Validaciones de Producto
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

    const modal = bootstrap.Modal.getInstance(document.getElementById("modalProducto"));
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

//Validaciones de usuario
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
    const usuarios = JSON.parse(localStorage.getItem("usuariosSistema")) || [];

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
                <td><small>${usr.comuna}, ${usr.region}</small></td>
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
    document.getElementById("usr-comuna").disabled = true;
    document.getElementById("modalUsuarioTitle").textContent = "Nuevo Usuario";

    const modal = new bootstrap.Modal(document.getElementById("modalUsuario"));
    modal.show();
}

function editarUsuario(run) {
    const usuarios = JSON.parse(localStorage.getItem("usuariosSistema")) || [];
    const usr = usuarios.find(u => u.run === run);

    if (usr) {
        document.getElementById("usr-es-edicion").value = "true";
        document.getElementById("usr-run").value = usr.run;
        document.getElementById("usr-run").disabled = true;
        document.getElementById("usr-nombre").value = usr.nombre;
        document.getElementById("usr-apellidos").value = usr.apellidos;
        document.getElementById("usr-correo").value = usr.correo;
        document.getElementById("usr-fecha-nacimiento").value = usr.fechaNac || "";
        document.getElementById("usr-tipo").value = usr.tipo;
        document.getElementById("usr-region").value = usr.region;
        
        cargarComunas(usr.region);
        document.getElementById("usr-comuna").value = usr.comuna;
        document.getElementById("usr-direccion").value = usr.direccion;

        document.getElementById("modalUsuarioTitle").textContent = "Editar Usuario";
        const modal = new bootstrap.Modal(document.getElementById("modalUsuario"));
        modal.show();
    }
}

function guardarUsuario(e) {
    e.preventDefault();

    const run = document.getElementById("usr-run").value.trim().toUpperCase();
    const nombre = document.getElementById("usr-nombre").value.trim();
    const apellidos = document.getElementById("usr-apellidos").value.trim();
    const correo = document.getElementById("usr-correo").value.trim();
    const fechaNac = document.getElementById("usr-fecha-nacimiento").value;
    const tipo = document.getElementById("usr-tipo").value;
    const region = document.getElementById("usr-region").value;
    const comuna = document.getElementById("usr-comuna").value;
    const direccion = document.getElementById("usr-direccion").value.trim();
    const esEdicion = document.getElementById("usr-es-edicion").value === "true";

// Validaciones de Usuario
    if (!validarRUN(run)) {
        Swal.fire("RUN Inválido", "El RUN ingresado no es válido. Escríbelo sin puntos ni guión.", "error");
        return;
    }

    if (!validarCorreoDominio(correo)) {
        Swal.fire("Correo No Permitido", "El correo debe finalizar en @duoc.cl, @profesor.duoc.cl o @gmail.com", "error");
        return;
    }

    let usuarios = JSON.parse(localStorage.getItem("usuariosSistema")) || [];

    if (!esEdicion && usuarios.some(u => u.run === run)) {
        Swal.fire("Error", "Ya existe un usuario con este RUN.", "error");
        return;
    }

    const nuevoUsr = { run, nombre, apellidos, correo, fechaNac, tipo, region, comuna, direccion };

    if (esEdicion) {
        const idx = usuarios.findIndex(u => u.run === run);
        if (idx !== -1) usuarios[idx] = nuevoUsr;
    } else {
        usuarios.push(nuevoUsr);
    }

    localStorage.setItem("usuariosSistema", JSON.stringify(usuarios));
    renderizarTablaUsuarios();

    const modal = bootstrap.Modal.getInstance(document.getElementById("modalUsuario"));
    if (modal) modal.hide();

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
            let usuarios = JSON.parse(localStorage.getItem("usuariosSistema")) || [];
            usuarios = usuarios.filter(u => u.run !== run);
            localStorage.setItem("usuariosSistema", JSON.stringify(usuarios));
            renderizarTablaUsuarios();
            Swal.fire("Eliminado", "El usuario fue borrado.", "success");
        }
    });
}

function inicializarRegiones() {
    const selectRegion = document.getElementById("usr-region");
    if (!selectRegion) return;

    selectRegion.innerHTML = `<option value="">Seleccione Región</option>`;
    regionesYComunas.forEach(item => {
        selectRegion.innerHTML += `<option value="${item.region}">${item.region}</option>`;
    });
}

function cargarComunas(regionNombre) {
    const selectComuna = document.getElementById("usr-comuna");
    selectComuna.innerHTML = `<option value="">Seleccione Comuna</option>`;

    const regionEncontrada = regionesYComunas.find(r => r.region === regionNombre);

    if (regionEncontrada) {
        selectComuna.disabled = false;
        regionEncontrada.comunas.forEach(comuna => {
            selectComuna.innerHTML += `<option value="${comuna}">${comuna}</option>`;
        });
    } else {
        selectComuna.disabled = true;
    }
}

// Datos iniciales para demostracion
function inicializarDatosDemo() {
    if (!localStorage.getItem("catalogoProductos")) {
        const demoProductos = [
            { id: "PROD01", nombre: "NVIDIA RTX 3080", descripcion: "Tarjeta gráfica de alta gama", precio: 450000, stock: 10, stockCritico: 2, categoria: "Componentes", imagen: "img/rtx3080.jpg" }
        ];
        localStorage.setItem("catalogoProductos", JSON.stringify(demoProductos));
    }

    if (!localStorage.getItem("usuariosSistema")) {
        const demoUsuarios = [
            { run: "19011022K", nombre: "Admin", apellidos: "Sistema", correo: "admin@duoc.cl", fechaNac: "1995-05-10", tipo: "Administrador", region: "Región Metropolitana de Santiago", comuna: "Santiago", direccion: "Av. España 8" }
        ];
        localStorage.setItem("usuariosSistema", JSON.stringify(demoUsuarios));
    }
}