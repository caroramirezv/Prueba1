document.addEventListener('DOMContentLoaded', function() {
  const comunasPorRegion = {
    "RM": ["Providencia", "Las Condes", "Santiago Centro", "La Florida", "Maipú"],
    "Araucania": ["Temuco", "Villarrica", "Pucón", "Angol"],
    "Nuble": ["Chillán", "San Carlos", "Bulnes"],
    "Maule": ["Linares", "Longaví", "Talca", "Curicó"],
    "Biobio": ["Concepción", "Talcahuano", "Los Ángeles"]
  };

  const selectRegion = document.getElementById('selectRegion');
  const selectComuna = document.getElementById('selectComuna');
  const btnRegistrar = document.getElementById('btnRegistrar');

  const modalElement = document.getElementById('mensajeModal');
  const mensajeModal = new bootstrap.Modal(modalElement);
  let callbackAlCerrar = null;

  function mostrarNotificacion(titulo, mensaje, esError = false, alCerrar = null) {
    const icono = document.getElementById('modalIcono');
    const tituloEl = document.getElementById('modalTitulo');
    const mensajeEl = document.getElementById('modalMensaje');

    if (esError) {
      icono.innerHTML = `<div class="rounded-circle d-flex align-items-center justify-content-center bg-danger bg-opacity-10 text-danger" style="width: 70px; height: 70px; font-size: 2rem; font-weight: bold;">✕</div>`;
    } else {
      icono.innerHTML = `<div class="rounded-circle d-flex align-items-center justify-content-center bg-success bg-opacity-10 text-success" style="width: 70px; height: 70px; font-size: 2rem; font-weight: bold;">✓</div>`;
    }

    tituloEl.textContent = titulo;
    mensajeEl.textContent = mensaje;
    callbackAlCerrar = alCerrar;
    mensajeModal.show();
  }

  modalElement.addEventListener('hidden.bs.modal', function () {
    if (typeof callbackAlCerrar === 'function') {
      callbackAlCerrar();
      callbackAlCerrar = null;
    }
  });

  // Validar RUN chileno con Módulo 11 (Limpia puntos, guiones y espacios)
  function validarRunChileno(run) {
    const runLimpio = run.replace(/[\.\-\s]/g, '').toUpperCase();
    if (runLimpio.length < 7 || runLimpio.length > 9) return false;

    const cuerpo = runLimpio.slice(0, -1);
    const dvIngresado = runLimpio.slice(-1);

    if (!/^\d+$/.test(cuerpo)) return false;

    let suma = 0;
    let multiplicador = 2;

    for (let i = cuerpo.length - 1; i >= 0; i--) {
      suma += parseInt(cuerpo.charAt(i)) * multiplicador;
      multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
    }

    let dvEsperado = 11 - (suma % 11);
    if (dvEsperado === 11) dvEsperado = '0';
    else if (dvEsperado === 10) dvEsperado = 'K';
    else dvEsperado = dvEsperado.toString();

    return dvIngresado === dvEsperado;
  }

  function validarDominioCorreo(correo) {
    const dominiosValidos = ['@duoc.cl', '@profesor.duoc.cl', '@gmail.com'];
    return dominiosValidos.some(dominio => correo.toLowerCase().endsWith(dominio));
  }

  selectRegion.addEventListener('change', function() {
    const region = this.value;
    selectComuna.innerHTML = '<option value="" disabled selected>-- Seleccione comuna --</option>';
    
    if (comunasPorRegion[region]) {
      comunasPorRegion[region].forEach(comuna => {
        const opt = document.createElement('option');
        opt.value = comuna;
        opt.textContent = comuna;
        selectComuna.appendChild(opt);
      });
      selectComuna.disabled = false;
    } else {
      selectComuna.disabled = true;
    }
  });

  btnRegistrar.addEventListener('click', function() {
    const run = document.getElementById('runInput').value.trim();
    const nombre = document.getElementById('nombreInput').value.trim();
    const apellidos = document.getElementById('apellidosInput').value.trim();
    const correo = document.getElementById('correo').value.trim();
    const confirmarCorreo = document.getElementById('confirmarCorreo').value.trim();
    const fechaNacimiento = document.getElementById('fechaNacimiento').value;
    const password = document.getElementById('passwordInput').value.trim();
    const confirmarPassword = document.getElementById('confirmarPassword').value.trim();
    const region = selectRegion.value;
    const comuna = selectComuna.value;

    if (!run || !nombre || !apellidos || !correo || !confirmarCorreo || !password || !confirmarPassword || !region || !comuna) {
      mostrarNotificacion('Campos Incompletos', 'Por favor, completa todos los campos requeridos para continuar.', true);
      return;
    }

    if (!validarRunChileno(run)) {
      mostrarNotificacion('RUN Inválido', 'El RUN ingresado no es válido. Ingrésalo sin puntos ni guion (Ej: 190110222 o 10000013K).', true);
      return;
    }

    if (nombre.length > 50) {
      mostrarNotificacion('Nombre muy largo', 'El nombre no puede superar los 50 caracteres.', true);
      return;
    }

    if (apellidos.length > 100) {
      mostrarNotificacion('Apellidos muy largos', 'Los apellidos no pueden superar los 100 caracteres.', true);
      return;
    }

    if (correo.length > 100) {
      mostrarNotificacion('Correo muy largo', 'El correo no puede superar los 100 caracteres.', true);
      return;
    }

    if (!validarDominioCorreo(correo)) {
      mostrarNotificacion('Correo no permitido', 'El correo solo puede ser @duoc.cl, @profesor.duoc.cl o @gmail.com.', true);
      return;
    }

    if (correo.toLowerCase() !== confirmarCorreo.toLowerCase()) {
      mostrarNotificacion('Error de Correo', 'Los correos electrónicos ingresados no coinciden.', true);
      return;
    }

    if (password !== confirmarPassword) {
      mostrarNotificacion('Error de Contraseña', 'Las contraseñas ingresadas no coinciden.', true);
      return;
    }

    let usuarios = JSON.parse(localStorage.getItem('usuarios_clstore')) || [];

    const existeCorreo = usuarios.some(u => u.correo && u.correo.toLowerCase() === correo.toLowerCase());
    if (existeCorreo) {
      mostrarNotificacion('Usuario Existente', 'Este correo electrónico ya se encuentra registrado.', true);
      return;
    }

    const runFormateado = run.replace(/[\.\-\s]/g, '').toUpperCase();
    const existeRun = usuarios.some(u => u.run && u.run.toUpperCase() === runFormateado);
    if (existeRun) {
      mostrarNotificacion('RUN Registrado', 'Este RUN ya está asociado a una cuenta existente.', true);
      return;
    }

    usuarios.push({
      id: Date.now(),
      run: runFormateado,
      nombre,
      apellidos,
      correo,
      fechaNacimiento: fechaNacimiento || null,
      password,
      region,
      comuna
    });

    localStorage.setItem('usuarios_clstore', JSON.stringify(usuarios));

    mostrarNotificacion('¡Registro Exitoso!', 'Tu cuenta se ha creado correctamente. Redirigiendo...', false, function() {
      window.location.href = 'InicioSesion.html';
    });
  });
});