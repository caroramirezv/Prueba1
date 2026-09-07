//Inicio logica carrito
document.addEventListener("DOMContentLoaded", () => {
    // Carga el carrito desde el LocalStorage
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

    // Referencias
    const tablaCarrito = document.getElementById("cart-items");
    const subtotalEl = document.getElementById("summary-subtotal");
    const totalEl = document.getElementById("summary-total");
    //Boton agregar conectado con la funcion de agregar al carrito
    document.querySelectorAll(".btn-agregar").forEach(boton => {
        boton.addEventListener("click", (e) => {
            const btn = e.currentTarget;
            const id = btn.dataset.id;

            const existe = carrito.find(p => p.id === id);

            if (existe) {
                existe.cantidad++;
            } else {
                carrito.push({
                    id: id,
                    nombre: btn.dataset.nombre,
                    precio: parseFloat(btn.dataset.precio),
                    imagen: btn.dataset.imagen,
                    cantidad: 1
                });
            }

    // Guardar el producto en localStorage
            localStorage.setItem("carrito", JSON.stringify(carrito));

    //Alerta visual al agregar
                Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: 'Producto añadido',
                showConfirmButton: false,
                timer: 1500
            });
        });
    });

    //Funcion para mostrar los productos en el carrito
    function renderizarCarrito() {
        if (!tablaCarrito) return;

        tablaCarrito.innerHTML = "";
        let total = 0;

        carrito.forEach((prod, index) => {
            const subtotal = prod.precio * prod.cantidad;
            total += subtotal;

            tablaCarrito.innerHTML += `
                <tr>
                    <td>
                        <img src="${prod.imagen}" width="40"> ${prod.nombre}
                    </td>
                    <td>$${prod.precio}</td>
                    <td>
                        <button onclick="cambiarCantidad(${index}, -1)">-</button>
                        ${prod.cantidad}
                        <button onclick="cambiarCantidad(${index}, 1)">+</button>
                    </td>
                    <td>$${subtotal}</td>
                    <td>
                        <button onclick="eliminarProducto(${index})">X</button>
                    </td>
                </tr>
            `;
        });

        if (subtotalEl) subtotalEl.textContent = `$${total}`;
        if (totalEl) totalEl.textContent = `$${total}`;
    }

    // Funciones globales para actualizar o borrar
    window.cambiarCantidad = (index, cambio) => {
        carrito[index].cantidad += cambio;
        if (carrito[index].cantidad <= 0) carrito.splice(index, 1);
        guardar();
    };

    window.eliminarProducto = (index) => {
        carrito.splice(index, 1);
        guardar();
    };

    function guardar() {
        localStorage.setItem("carrito", JSON.stringify(carrito));
        renderizarCarrito();
    }

// Carga la tabla al entrar a la página
    renderizarCarrito();
});

//Procesa la compra
function realizarCompra() {
    //Alerta visual de que se completo la compra
    Swal.fire({
        title: '¡Compra completada!',
        text: 'Gracias por tu compra en CLstore.',
        icon: 'success',
        confirmButtonText: 'Genial',
        confirmButtonColor: '#0d6efd'
    }).then(() => {
        localStorage.removeItem('clstore_cart');
        renderCart();
    });
}
//Fin logica carrito


//Filtros en la pagina Productos
document.addEventListener("DOMContentLoaded", () => {
// Referencias a los botones de filtros y buscador
    const inputSearch = document.getElementById("input-search");
    const filterButtons = document.querySelectorAll(".btn-filter");
    const productItems = document.querySelectorAll(".product-item");

    let activeFilter = "all";
    let searchText = "";

//Filtrado y busqueda
    function filterProducts() {
        productItems.forEach(item => {
            const category = item.getAttribute("data-category");
            const name = item.getAttribute("data-name").toLowerCase();

            // Verificar coincidencia de categoría
            const matchesCategory = activeFilter === "all" || category === activeFilter;
            
            // Verificar coincidencia de texto
            const matchesSearch = name.includes(searchText);

            // Ocultar o mostrar productos segun su coincidencia con el criterio
            if (matchesCategory && matchesSearch) {
                item.style.display = "block";
            } else {
                item.style.display = "none";
            }
        });
    }

// Evento al escribir en la barra de búsqueda
    if (inputSearch) {
        inputSearch.addEventListener("input", (e) => {
            searchText = e.target.value.toLowerCase().trim();
            filterProducts();
        });
    }

//Efecto visual al clickear botones de categoria
    filterButtons.forEach(btn => {
        btn.addEventListener("click", () => {
        // Cambiar estilos de los botones (apartado visual)
            filterButtons.forEach(b => {
                b.classList.remove("btn-primary", "active");
                b.classList.add("btn-outline-secondary");
            });

            btn.classList.remove("btn-outline-secondary");
            btn.classList.add("btn-primary", "active");

        // Actualizar filtro de categoría
            activeFilter = btn.getAttribute("data-filter");
            filterProducts();
        });
    });
});