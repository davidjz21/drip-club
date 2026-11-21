/* ==========================================================================
   DRIP CLUB - LOGIN DEL MODAL - POST /api/auth/login
   JavaScript nativo para autenticación contra Spring Security
   ========================================================================== */
(function () {
  'use strict';

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

  function extraerMensaje(cuerpo, porDefecto) {
    if (cuerpo && typeof cuerpo === 'object') {
      const textos = Object.values(cuerpo).filter((v) => typeof v === 'string');
      if (textos.length) return textos.join(' - ');
    }
    return porDefecto;
  }

  document.addEventListener('submit', async function (e) {
    const form = e.target;
    if (!(form instanceof HTMLFormElement)) return;
    if (form.closest('#registroView')) return;
    if (!form.closest('#loginView, #modalCuentaNav')) return;

    e.preventDefault();
    e.stopImmediatePropagation();

    form.querySelector('.aviso-sesion')?.remove();

    const correoInput = form.querySelector('input[type="email"]');
    const passInput = form.querySelector('input[type="password"]');
    const correo = correoInput ? correoInput.value.trim().toLowerCase() : '';
    const contrasena = passInput ? passInput.value : '';
    if (!correo || !contrasena) return mostrarError(form, 'Ingresa correo y contraseña.');

    const boton = form.querySelector('button[type="submit"]');
    if (boton) boton.disabled = true;

    try {
      const resp = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, contrasena })
      });

      let cuerpo = null;
      try { cuerpo = await resp.json(); } catch (err) { }

      if (!resp.ok) {
        return mostrarError(form, extraerMensaje(cuerpo, 'Correo o contraseña incorrectos.'));
      }
      if (!cuerpo || cuerpo.idUsuario == null) {
        return mostrarError(form, 'La respuesta del servidor no es válida.');
      }

      localStorage.setItem(K_SESION, 'true');
      localStorage.setItem(K_USUARIO, JSON.stringify({
        idUsuario: cuerpo.idUsuario,
        nombre: cuerpo.nombre,
        correo: cuerpo.correo,
        rol: cuerpo.rol
      }));
      window.location.href = cuerpo.redirectUrl || (String(cuerpo.rol).toUpperCase() === 'CLIENTE' ? URL_CUENTA : URL_PANEL_ADMIN);
    } catch (err) {
      mostrarError(form, 'No se pudo conectar con el servidor.');
    } finally {
      if (boton) boton.disabled = false;
    }
  }, true);
})();
