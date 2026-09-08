
document.addEventListener('DOMContentLoaded', function() {

    const loginForm = document.getElementById('loginForm');

    function validarDominioCorreo(correo) {
        const dominiosValidos = ['@duoc.cl', '@profesor.duoc.cl', '@gmail.com'];
        return dominiosValidos.some(dominio => correo.toLowerCase().endsWith(dominio));
    }

    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const correo = document.getElementById('correoInput').value.trim();
            const password = document.getElementById('passwordInput').value.trim();

    // Validaciones pedidas para Inicio de sesión
            if (!correo || !password) {
                alert('Debes ingresar tu correo y tu contraseña.');
                return;
            }

            if (correo.length > 100) {
                alert('El correo no puede superar los 100 caracteres.');
                return;
            }

            if (!validarDominioCorreo(correo)) {
                alert('El correo solo puede ser @duoc.cl, @profesor.duoc.cl o @gmail.com.');
                return;
            }

            if (password.length < 4 || password.length > 10) {
                alert('La contraseña debe tener entre 4 y 10 caracteres.');
                return;
            }

            const usuariosRegistrados = JSON.parse(localStorage.getItem('usuarios_clstore')) || [];

            const usuarioEncontrado = usuariosRegistrados.find(u =>
                u.correo && u.correo.toLowerCase() === correo.toLowerCase()
                && u.password === password
            );

            if (!usuarioEncontrado) {
                alert('Correo o contraseña incorrectos.');
                return;
            }

            localStorage.setItem('nombreUsuario', usuarioEncontrado.nombre);
            localStorage.setItem('tipoUsuario', usuarioEncontrado.tipo);

            if (usuarioEncontrado.tipo === 'Administrador' || usuarioEncontrado.tipo === 'Vendedor') {
                window.location.href = 'vistaAdministrador.html';
            } else {
                window.location.href = 'Home.html';
            }
        });
    }

});
