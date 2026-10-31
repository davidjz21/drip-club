/* ==========================================================================
   DRIP CLUB · LOGIN DEL MODAL → POST /api/auth/login
   Se carga en index.html con:  <script src="assets/scripts/auth-login.js"></script>

   Intercepta (fase de captura) el submit del formulario de login del modal
   antes que el script inline existente, que llamaba a /api/usuarios/login.
   El formulario de registro NO se toca.
   ========================================================================== */
(function () {
  'use strict';

  // true  → solo ADMIN puede entrar por el modal (requerimiento del equipo).
  // false → ADMIN va al panel y los clientes siguen entrando a Mi cuenta como antes.
  const LOGIN_SOLO_ADMIN = false;

  const K_SESION = 'dripclub_sesion_iniciada';
  const K_USUARIO = 'dripclub_usuario';
  const URL_PANEL_ADMIN = '/admin/index.html';
  const URL_CUENTA = 'assets/pages/cuenta.html';

  function mostrarError(form, mensaje) {
    let aviso = form.querySelector('.aviso-sesion');
    if (!aviso) {
      aviso = document.createElement('div');
      aviso.className = 'alert alert-danger py-2 aviso-sesion';
      form.prepend(aviso);
    }
    aviso.textContent = mensaje;
  }

  /** Errores de validación llegan como { campo: mensaje }; el resto como { mensaje }. */
  function extraerMensaje(cuerpo, porDefecto) {
    if (cuerpo && typeof cuerpo === 'object') {
      const textos = Object.values(cuerpo).filter((v) => typeof v === 'string');
      if (textos.length) return textos.join(' · ');
    }
    return porDefecto;
  }

  document.addEventListener('submit', async function (e) {
    const form = e.target;
    if (!(form instanceof HTMLFormElement)) return;
    if (form.closest('#registroView')) return;                 // registro: lo maneja el script existente
    if (!form.closest('#loginView, #modalCuentaNav')) return;  // otro formulario de la página

    e.preventDefault();
    e.stopImmediatePropagation();                              // evita el handler antiguo de login

    form.querySelector('.aviso-sesion')?.remove();

    const correo = form.querySelector('input[type="email"]').value.trim().toLowerCase();
    const contrasena = form.querySelector('input[type="password"]').value;
    if (!correo || !contrasena) return mostrarError(form, 'Ingresa correo y contraseña.');

    const boton = form.querySelector('button[type="submit"]');
    if (boton) boton.disabled = true;

    try {
      const url = LOGIN_SOLO_ADMIN ? '/api/auth/login' : '/api/usuarios/login';
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, contrasena })
      });

      let cuerpo = null;
      try { cuerpo = await resp.json(); } catch (err) { /* sin cuerpo JSON */ }

      if (!resp.ok) {
        // 400 validación · 401 credenciales · 403 no es ADMIN → se muestra en el modal y no se avanza
        return mostrarError(form, extraerMensaje(cuerpo, 'No se pudo iniciar sesión.'));
      }
      if (!cuerpo || cuerpo.idUsuario == null) {
        return mostrarError(form, 'La respuesta del servidor no es válida.');
      }

      const esAdmin = String(cuerpo.rol).toUpperCase() === 'ADMIN';
      localStorage.setItem(K_SESION, 'true');
      localStorage.setItem(K_USUARIO, JSON.stringify({
        idUsuario: cuerpo.idUsuario,
        nombre: cuerpo.nombre,
        correo: cuerpo.correo,
        rol: cuerpo.rol
      }));
      window.location.href = esAdmin ? (cuerpo.redirectUrl || URL_PANEL_ADMIN) : URL_CUENTA;
    } catch (err) {
      mostrarError(form, 'No se pudo conectar con el servidor.');
    } finally {
      if (boton) boton.disabled = false;
    }
  }, true);
})();
