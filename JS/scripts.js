//Codigo logia Carrito, falta revisarlo:
document.addEventListener("DOMContentLoaded", () => {
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    const botonesAgregar = document.querySelectorAll(".btn-agregar");

    botonesAgregar.forEach((boton) => {
        boton.addEventListener("click", (e) => {
            const btn = e.currentTarget;
            
// Obtener datos desde los atributos data
            const producto = {
                id: btn.dataset.id,
                nombre: btn.dataset.nombre,
                precio: parseFloat(btn.dataset.precio),
                imagen: btn.dataset.imagen,
                cantidad: 1
            };

// Verifica si el producto ya está en el carrito
            const existeIndex = carrito.findIndex(item => item.id === producto.id);

            if (existeIndex !== -1) {
                carrito[existeIndex].cantidad += 1;
            } else {
                carrito.push(producto);
            }

// Guardar PRODUCTO en localStorage
            localStorage.setItem("carrito", JSON.stringify(carrito));

// Alerta visual al agregar al carrito
            if (typeof Swal !== "undefined") {
                Swal.fire({
                    title: "¡Agregado!",
                    text: `${producto.nombre} se añadió al carrito.`,
                    icon: "success",
                    timer: 1500,
                    showConfirmButton: false
                });
            }
        });
    });

    function actualizarTotales() {
        const subtotalEl = document.getElementById("summary-subtotal");
        const totalEl = document.getElementById("summary-total");

        if (!subtotalEl || !totalEl) return;

        const total = carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
        
        subtotalEl.textContent = `$${total.toLocaleString("es-CL")}`;
        totalEl.textContent = `$${total.toLocaleString("es-CL")}`;
    }

    function asignarEventosControles() {
// Incrementar cantidad
        document.querySelectorAll(".btn-sumar").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const idx = e.target.dataset.index;
                carrito[idx].cantidad++;
                guardarYRenderizar();
            });
        });

// Decrementar cantidad
        document.querySelectorAll(".btn-restar").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const idx = e.target.dataset.index;
                if (carrito[idx].cantidad > 1) {
                    carrito[idx].cantidad--;
                } else {
                    carrito.splice(idx, 1);
                }
                guardarYRenderizar();
            });
        });

// Eliminar producto
        document.querySelectorAll(".btn-eliminar").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const idx = e.currentTarget.dataset.index;
                carrito.splice(idx, 1);
                guardarYRenderizar();
            });
        });
    }

    function guardarYRenderizar() {
        localStorage.setItem("carrito", JSON.stringify(carrito));
        renderizarCarrito();
    }

// Inicializar la tabla si se encuentra en la página de carrito
    renderizarCarrito();
});

// Función de Compra
function realizarCompra() {
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    
    if (carrito.length === 0) {
        Swal.fire("Carrito vacío", "Añade productos antes de pagar.", "warning");
        return;
    }

    Swal.fire({
        title: "¡Gracias por tu compra!",
        text: "Tu pedido ha sido procesado con éxito.",
        icon: "success"
    }).then(() => {
        localStorage.removeItem("carrito");
        window.location.href = "Home.html";
    });
}

// Filtro de categorías y buscador
function inicializarFiltrosYBuscador() {
    const searchInput = document.getElementById("input-search");
    const filterButtons = document.querySelectorAll(".btn-filter");
    const productItems = document.querySelectorAll(".product-item");

    if (!searchInput && filterButtons.length === 0) return;

    let activeFilter = "all";

    function filterProducts() {
        const query = searchInput ? searchInput.value.toLowerCase() : "";

        productItems.forEach((item) => {
            const category = item.dataset.category;
            const name = item.dataset.name.toLowerCase();

            const matchesCategory = activeFilter === "all" || category === activeFilter;
            const matchesSearch = name.includes(query);

            if (matchesCategory && matchesSearch) {
                item.style.display = "block";
            } else {
                item.style.display = "none";
            }
        });
    }

    filterButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            filterButtons.forEach((b) => b.classList.replace("btn-primary", "btn-outline-secondary"));
            btn.classList.replace("btn-outline-secondary", "btn-primary");
            activeFilter = btn.dataset.filter;
            filterProducts();
        });
    });

    if (searchInput) {
        searchInput.addEventListener("input", filterProducts);
    }
}

//FIN LOGICA CARRITO
