//Funcion que nos sirve para insertar el usuario admin sin importar la pagina que se cargue primero, por lo se puede usar al ingresar al inicio de sesion

if (!localStorage.getItem("usuarios_clstore")) {
    const demoUsuarios = [
        { run: "19011022K", nombre: "Admin", apellidos: "Sistema", correo: "admin@duoc.cl", fechaNacimiento: "1995-05-10", password: "admin", tipo: "Administrador", region: "Región Metropolitana de Santiago", comuna: "Santiago", direccion: "Av. España 8" }
    ];
    localStorage.setItem("usuarios_clstore", JSON.stringify(demoUsuarios));
}
