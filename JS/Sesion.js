document.addEventListener('DOMContentLoaded', function() {
    
    const loginForm = document.getElementById('loginForm');

    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault(); 
            
            const loginInput = document.getElementById('nombreInput').value.trim();
            const password = document.getElementById('passwordInput').value.trim();

            //Si los datos son de Administrador
            if (loginInput === "admin" && password === "admin") {
                localStorage.setItem('nombreUsuario', 'Administrador');
                window.location.href = 'vistaAdministrador.html';
                return;
            }

            //Traer la lista de usuarios guardados desde el Registro
            const usuariosRegistrados = JSON.parse(localStorage.getItem('usuarios_clstore')) || [];

            //Buscar coincidencia por Nombre
            const usuarioEncontrado = usuariosRegistrados.find(u => 
                (u.nombre && u.nombre.toLowerCase() === loginInput.toLowerCase())
                && u.password === password
            );

            // Redireccionar o lanzar alerta
            if (usuarioEncontrado) {
                localStorage.setItem('nombreUsuario', usuarioEncontrado.nombre);
                window.location.href = 'Home.html';
            } else {
                alert("Usuario, correo o contraseña incorrectos.");
            }
        });
    }

});