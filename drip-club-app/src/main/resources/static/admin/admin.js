/* ==========================================================================
   DRIP CLUB - PANEL DE ADMINISTRACION (SPA)
   JavaScript nativo (fetch + async/await). Sin dependencias salvo Bootstrap.

   Endpoints consumidos (rutas relativas al mismo origen de Spring Boot):
     /api/productos - /api/categorias - /api/subcategorias - /api/usuarios

   Nota: en el backend DELETE realiza una ELIMINACION LOGICA (activo = false),
   por eso las tablas siguen mostrando los registros con estado "Inactivo".
   ========================================================================== */
'use strict';

(() => {

  /* ------------------------------------------------------------------------
     1. CONFIGURACION Y ESTADO
     ------------------------------------------------------------------------ */
  const API = {
    productos: '/api/productos',
    categorias: '/api/categorias',
    subcategorias: '/api/subcategorias',
    usuarios: '/api/usuarios',
    pedidos: '/api/pedidos'
  };

  const K_USUARIO = 'dripclub_usuario'; // misma clave que usa la tienda (cuenta.html)

  const state = {
    vista: 'productos',
    datos: { productos: [], categorias: [], subcategorias: [], usuarios: [], pedidos: [] },
    cargado: { productos: false, categorias: false, subcategorias: false, usuarios: false, pedidos: false }
  };

  // Configuracion de cada modulo: titulo del header, tbody, n de columnas y render.
  const MODULOS = {
    productos: { titulo: 'Productos', tbody: 'tbodyProductos', columnas: 8, render: renderProductos },
    categorias: { titulo: 'Categorias', tbody: 'tbodyCategorias', columnas: 4, render: renderCategorias },
    subcategorias: { titulo: 'Subcategorias', tbody: 'tbodySubcategorias', columnas: 5, render: renderSubcategorias },
    usuarios: { titulo: 'Usuarios', tbody: 'tbodyUsuarios', columnas: 7, render: renderUsuarios },
    pedidos: { titulo: 'Pedidos', tbody: 'tbodyPedidos', columnas: 7, render: renderPedidos }
  };

  // Textos para el modal de confirmacion de cada eliminacion.
  const TEXTOS_ELIMINAR = {
    productos: { etiqueta: 'producto', nombre: (x) => x.nombre },
    categorias: { etiqueta: 'categoria', nombre: (x) => x.nombre },
    subcategorias: { etiqueta: 'subcategoria', nombre: (x) => x.nombre },
    usuarios: { etiqueta: 'usuario', nombre: (x) => x.nombre }
  };

  const $ = (selector, raiz = document) => raiz.querySelector(selector);
  const $$ = (selector, raiz = document) => Array.from(raiz.querySelectorAll(selector));

  /* ------------------------------------------------------------------------
     2. UTILIDADES
     ------------------------------------------------------------------------ */
  function escaparHTML(valor) {
    return String(valor ?? '').replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  function formatearPrecio(valor) {
    return `S/ ${Number(valor || 0).toFixed(2)}`;
  }

  /**
   * Replica la logica de la tienda (resolverRutaImagen) pero desde /admin/.
   * "assets/image/x.jpg" -> "../assets/image/x.jpg"
   */
  function resolverImagen(ruta) {
    if (!ruta) return '';
    if (/^(https?:)?\/\//.test(ruta) || ruta.startsWith('data:')) return ruta;
    const limpia = ruta.replace(/^(\.\.?\/)+/, '').replace(/^\/+/, '');
    if (limpia.startsWith('assets/')) return '../' + limpia;
    if (limpia.startsWith('image/')) return '../assets/' + limpia;
    return '../assets/image/' + limpia.split('/').pop();
  }

  function obtenerIdUsuarioActual() {
    try {
      const u = JSON.parse(localStorage.getItem(K_USUARIO) || 'null');
      return u && u.idUsuario != null ? Number(u.idUsuario) : null;
    } catch (err) {
      return null;
    }
  }

  function ordenarPorId(lista, campoId) {
    return [...lista].sort((a, b) => (a[campoId] ?? 0) - (b[campoId] ?? 0));
  }

  /* ------------------------------------------------------------------------
     3. CAPA DE RED (fetch con manejo uniforme de errores)
     ------------------------------------------------------------------------ */
  class ApiError extends Error {
    constructor(mensaje, status = 0) {
      super(mensaje);
      this.name = 'ApiError';
      this.status = status;
    }
  }

  /** Convierte las respuestas de error de Spring (GlobalExceptionHandler) en texto legible. */
  async function leerMensajeError(resp) {
    try {
      const cuerpo = await resp.json();
      if (cuerpo && typeof cuerpo === 'object') {
        const partes = Object.values(cuerpo).filter((v) => typeof v === 'string');
        if (partes.length) return partes.join(' - ');
      }
    } catch (err) { /* cuerpo vacio o no JSON */ }
    if (resp.status === 404) return 'El registro ya no existe (404).';
    if (resp.status >= 500) return `Error interno del servidor (${resp.status}).`;
    return `La API respondio con estado ${resp.status}.`;
  }

  async function apiFetch(url, { method = 'GET', body } = {}) {
    let resp;
    try {
      resp = await fetch(url, {
        method,
        headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
        body: body !== undefined ? JSON.stringify(body) : undefined
      });
    } catch (err) {
      throw new ApiError('No se pudo conectar con el servidor. Verifica que la aplicacion este en ejecucion.');
    }

    if (!resp.ok) throw new ApiError(await leerMensajeError(resp), resp.status);
    if (resp.status === 204) return null;

    try {
      return await resp.json();
    } catch (err) {
      throw new ApiError('La API devolvio una respuesta que no es JSON valido.', resp.status);
    }
  }

  /** Fetch que envia texto plano (para endpoints que reciben String en el body). */
  async function apiFetchPlain(url, { method = 'PUT', body = '' } = {}) {
    let resp;
    try {
      resp = await fetch(url, {
        method,
        headers: { 'Content-Type': 'text/plain' },
        body: String(body)
      });
    } catch (err) {
      throw new ApiError('No se pudo conectar con el servidor.');
    }
    if (!resp.ok) throw new ApiError(await leerMensajeError(resp), resp.status);
    if (resp.status === 204) return null;
    try { return await resp.json(); } catch (err) { return null; }
  }

  async function apiGetLista(url) {
    const datos = await apiFetch(url);
    if (!Array.isArray(datos)) throw new ApiError(`La respuesta de ${url} no es una lista.`);
    return datos;
  }

  /* ------------------------------------------------------------------------
     4. COMPONENTES UI: toasts y confirmacion
     ------------------------------------------------------------------------ */
  function mostrarToast(mensaje, tipo = 'success') {
    const contenedor = $('#toastContenedor');
    const el = document.createElement('div');
    el.className = `toast align-items-center text-bg-${tipo} border-0`;
    el.setAttribute('role', 'alert');
    el.innerHTML = `
      <div class="d-flex">
        <div class="toast-body"></div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Cerrar"></button>
      </div>`;
    $('.toast-body', el).textContent = mensaje;
    contenedor.appendChild(el);
    const toast = new bootstrap.Toast(el, { delay: tipo === 'danger' ? 6000 : 3000 });
    el.addEventListener('hidden.bs.toast', () => el.remove());
    toast.show();
  }

  /** Modal de confirmacion reutilizable. Devuelve Promise<boolean>. */
  function confirmar({ titulo, mensaje, textoBoton = 'Confirmar' }) {
    return new Promise((resolve) => {
      const el = $('#modalConfirmar');
      const btn = $('#btnConfirmarAccion');
      const modal = bootstrap.Modal.getOrCreateInstance(el);
      let aceptado = false;

      $('#confirmarTitulo').textContent = titulo;
      $('#confirmarMensaje').textContent = mensaje;
      btn.textContent = textoBoton;

      const alAceptar = () => { aceptado = true; modal.hide(); };
      btn.addEventListener('click', alAceptar, { once: true });
      el.addEventListener('hidden.bs.modal', () => {
        btn.removeEventListener('click', alAceptar);
        resolve(aceptado);
      }, { once: true });

      modal.show();
    });
  }

  /* ------------------------------------------------------------------------
     5. NAVEGACION SPA (d-none + hash)
     ------------------------------------------------------------------------ */
  function activarVista(nombre) {
    if (!MODULOS[nombre]) nombre = 'productos';
    state.vista = nombre;

    $$('[data-module]').forEach((s) => s.classList.toggle('d-none', s.dataset.module !== nombre));
    $$('.sidebar-link[data-view]').forEach((a) => a.classList.toggle('active', a.dataset.view === nombre));
    $('#headerTitulo').textContent = MODULOS[nombre].titulo;
    document.title = `${MODULOS[nombre].titulo} | Admin Drip Club`;
    cerrarSidebarMovil();

    if (!state.cargado[nombre]) cargarModulo(nombre);
  }

  function vistaDesdeHash() {
    return (location.hash || '').replace('#', '') || 'productos';
  }

  function abrirSidebarMovil() {
    $('#adminSidebar').classList.add('open');
    $('#sidebarBackdrop').classList.add('show');
  }

  function cerrarSidebarMovil() {
    $('#adminSidebar').classList.remove('open');
    $('#sidebarBackdrop').classList.remove('show');
  }

  /* ------------------------------------------------------------------------
     6. CARGA DE DATOS Y ESTADOS DE TABLA
     ------------------------------------------------------------------------ */
  function pintarEstadoTabla(nombre, tipo, mensaje = '') {
    const { tbody, columnas } = MODULOS[nombre];
    const filas = {
      carga: `<tr><td colspan="${columnas}" class="estado-carga">
                <span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>Cargando...</td></tr>`,
      vacio: `<tr><td colspan="${columnas}" class="estado-vacio">No hay registros para mostrar.</td></tr>`,
      error: `<tr><td colspan="${columnas}" class="estado-error">
                <i class="fa-solid fa-triangle-exclamation me-2"></i>${escaparHTML(mensaje)}
                <div class="mt-2"><button type="button" class="btn btn-sm btn-outline-dark" data-action="recargar">
                  <i class="fa-solid fa-rotate me-1"></i>Reintentar</button></div></td></tr>`
    };
    document.getElementById(tbody).innerHTML = filas[tipo];
  }

  async function cargarModulo(nombre) {
    pintarEstadoTabla(nombre, 'carga');
    try {
      state.datos[nombre] = await apiGetLista(API[nombre]);
      state.cargado[nombre] = true;
      MODULOS[nombre].render();
    } catch (err) {
      state.cargado[nombre] = false;
      pintarEstadoTabla(nombre, 'error', err.message);
    }
  }

  /* ------------------------------------------------------------------------
     7. RENDER DE TABLAS
     ------------------------------------------------------------------------ */
  function badgeEstado(activo) {
    return activo
      ? '<span class="badge badge-activo">Activo</span>'
      : '<span class="badge badge-inactivo">Inactivo</span>';
  }

  function botonDesactivar(modulo, id, activo, deshabilitarExtra = false, titulo = 'Desactivar') {
    const disabled = !activo || deshabilitarExtra ? 'disabled' : '';
    return `<button type="button" class="btn btn-sm btn-outline-danger" data-action="eliminar"
              data-modulo="${modulo}" data-id="${id}" title="${titulo}" ${disabled}>
              <i class="fa-solid fa-trash"></i></button>`;
  }

  function renderProductos() {
    const lista = ordenarPorId(state.datos.productos, 'idProducto');
    if (!lista.length) return pintarEstadoTabla('productos', 'vacio');

    $('#tbodyProductos').innerHTML = lista.map((p) => {
      const src = resolverImagen(p.imagen);
      const miniatura = src
        ? `<img src="${escaparHTML(src)}" class="thumb" alt="${escaparHTML(p.nombre)}" loading="lazy" data-fallback="1">`
        : '<span class="thumb thumb-placeholder"><i class="fa-regular fa-image"></i></span>';

      const tieneOferta = p.precioOferta != null && Number(p.precioOferta) > 0;
      const precio = tieneOferta
        ? `<span class="precio-tachado">${formatearPrecio(p.precio)}</span>`
        : formatearPrecio(p.precio);
      const oferta = tieneOferta
        ? `<span class="precio-oferta">${formatearPrecio(p.precioOferta)}</span>`
        : '<span class="text-muted">-</span>';

      const stock = Number(p.stock) === 0
        ? '<span class="badge text-bg-danger">0 - Agotado</span>'
        : `<span class="badge text-bg-light border">${Number(p.stock)}</span>`;

      const sub = p.subcategoria
        ? `${escaparHTML(p.subcategoria.categoria?.nombre ?? '-')} > ${escaparHTML(p.subcategoria.nombre)}`
        : '<span class="text-muted">-</span>';

      return `
        <tr>
          <td>${miniatura}</td>
          <td><div class="fw-semibold">${escaparHTML(p.nombre)}</div>
              <small class="text-muted">ID ${p.idProducto}</small></td>
          <td><small>${sub}</small></td>
          <td class="text-end">${precio}</td>
          <td class="text-end">${oferta}</td>
          <td class="text-center">${stock}</td>
          <td class="text-center">${badgeEstado(p.activo)}</td>
          <td class="text-end text-nowrap">
            <button type="button" class="btn btn-sm btn-outline-dark me-1" data-action="editar-producto"
                    data-id="${p.idProducto}" title="Editar"><i class="fa-solid fa-pen"></i></button>
            ${botonDesactivar('productos', p.idProducto, p.activo)}
          </td>
        </tr>`;
    }).join('');
  }

  function renderCategorias() {
    const lista = ordenarPorId(state.datos.categorias, 'idCategoria');
    if (!lista.length) return pintarEstadoTabla('categorias', 'vacio');

    $('#tbodyCategorias').innerHTML = lista.map((c) => `
      <tr>
        <td>${c.idCategoria}</td>
        <td class="fw-semibold">${escaparHTML(c.nombre)}</td>
        <td class="text-center">${badgeEstado(c.activo)}</td>
        <td class="text-end">${botonDesactivar('categorias', c.idCategoria, c.activo)}</td>
      </tr>`).join('');
  }

  function renderSubcategorias() {
    const lista = ordenarPorId(state.datos.subcategorias, 'idSubcategoria');
    if (!lista.length) return pintarEstadoTabla('subcategorias', 'vacio');

    $('#tbodySubcategorias').innerHTML = lista.map((s) => `
      <tr>
        <td>${s.idSubcategoria}</td>
        <td class="fw-semibold">${escaparHTML(s.nombre)}</td>
        <td>${s.categoria ? escaparHTML(s.categoria.nombre) : '<span class="text-muted">-</span>'}</td>
        <td class="text-center">${badgeEstado(s.activo)}</td>
        <td class="text-end">${botonDesactivar('subcategorias', s.idSubcategoria, s.activo)}</td>
      </tr>`).join('');
  }

  function renderUsuarios() {
    const lista = ordenarPorId(state.datos.usuarios, 'idUsuario');
    if (!lista.length) return pintarEstadoTabla('usuarios', 'vacio');
    const idActual = obtenerIdUsuarioActual();

    $('#tbodyUsuarios').innerHTML = lista.map((u) => {
      const esMismo = idActual !== null && u.idUsuario === idActual;
      const rol = String(u.rol || '').toUpperCase();
      const rolActual = ['CLIENTE', 'EMPLEADO', 'ADMIN'].includes(rol) ? rol : 'CLIENTE';

      const selectRol = `
        <select class="form-select form-select-sm" data-action="cambiar-rol" data-id="${u.idUsuario}"
                style="min-width:110px" ${esMismo ? 'disabled title="No puedes cambiar tu propio rol"' : ''}>
          <option value="CLIENTE" ${rolActual === 'CLIENTE' ? 'selected' : ''}>CLIENTE</option>
          <option value="EMPLEADO" ${rolActual === 'EMPLEADO' ? 'selected' : ''}>EMPLEADO</option>
          <option value="ADMIN" ${rolActual === 'ADMIN' ? 'selected' : ''}>ADMIN</option>
        </select>`;

      const textoToggle = u.activo ? 'Desactivar' : 'Reactivar';
      const claseToggle = u.activo ? 'btn-outline-danger' : 'btn-outline-success';
      const iconoToggle = u.activo ? 'fa-ban' : 'fa-circle-check';
      const btnToggle = `
        <button type="button" class="btn btn-sm ${claseToggle}" data-action="toggle-activo"
                data-id="${u.idUsuario}" data-activo="${u.activo}"
                title="${textoToggle}" ${esMismo ? 'disabled title="No puedes desactivar tu propia sesion"' : ''}>
          <i class="fa-solid ${iconoToggle}"></i>
        </button>`;

      return `
        <tr>
          <td>${u.idUsuario}</td>
          <td class="fw-semibold">${escaparHTML(u.nombre)}${esMismo ? ' <span class="badge text-bg-warning">Tu</span>' : ''}</td>
          <td>${escaparHTML(u.correo)}</td>
          <td>${u.telefono ? escaparHTML(u.telefono) : '<span class="text-muted">-</span>'}</td>
          <td class="text-center">${selectRol}</td>
          <td class="text-center">${badgeEstado(u.activo)}</td>
          <td class="text-end">${btnToggle}</td>
        </tr>`;
    }).join('');
  }

  const CLASE_ESTADO_PEDIDO = {
    PENDIENTE: 'warning', PAGADO: 'info', ENVIADO: 'primary', ENTREGADO: 'success', CANCELADO: 'danger'
  };

  function badgePedido(estado) {
    const clase = CLASE_ESTADO_PEDIDO[String(estado).toUpperCase()] || 'secondary';
    return `<span class="badge text-bg-${clase}">${escaparHTML(estado)}</span>`;
  }

  function formatearFecha(iso) {
    const d = new Date(iso);
    return isNaN(d) ? '-' : d.toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' });
  }

  // La API ya entrega los pedidos ordenados por fecha descendente.
  function renderPedidos() {
    const lista = state.datos.pedidos;
    if (!lista.length) return pintarEstadoTabla('pedidos', 'vacio');

    $('#tbodyPedidos').innerHTML = lista.map((p) => `
      <tr>
        <td class="fw-semibold">#${p.idPedido}</td>
        <td>${formatearFecha(p.fecha)}</td>
        <td><div class="fw-semibold">${escaparHTML(p.cliente)}</div>
            <small class="text-muted">${escaparHTML(p.clienteCorreo)}</small></td>
        <td>${escaparHTML(p.metodoPago)}</td>
        <td class="text-end fw-semibold">${formatearPrecio(p.total)}</td>
        <td class="text-center">${badgePedido(p.estado)}</td>
        <td class="text-end">
          <button type="button" class="btn btn-sm btn-outline-dark" data-action="ver-pedido"
                  data-id="${p.idPedido}" title="Ver detalle"><i class="fa-solid fa-eye"></i></button>
        </td>
      </tr>`).join('');
  }

  async function verPedido(id) {
    const cont = $('#pedidoDetalleContenido');
    $('#modalPedidoTitulo').textContent = `Pedido #${id}`;
    cont.innerHTML = '<div class="text-center text-muted py-4"><span class="spinner-border spinner-border-sm me-2"></span>Cargando...</div>';
    bootstrap.Modal.getOrCreateInstance($('#modalPedido')).show();

    try {
      const p = await apiFetch(`${API.pedidos}/${id}`);
      const filas = (p.items || []).map((i) => `
        <tr>
          <td>${escaparHTML(i.producto)}</td>
          <td class="text-center">${i.cantidad}</td>
          <td class="text-end">${formatearPrecio(i.precioUnitario)}</td>
          <td class="text-end">${formatearPrecio(i.subtotal)}</td>
        </tr>`).join('');

      const ESTADOS_PEDIDO = ['PENDIENTE', 'PAGADO', 'ENVIADO', 'ENTREGADO'];
      const opcionesEstado = ESTADOS_PEDIDO.map((e) =>
        `<option value="${e}" ${e === p.estado ? 'selected' : ''}>${e}</option>`
      ).join('');

      cont.innerHTML = `
        <div class="row g-3 mb-3">
          <div class="col-md-6"><small class="text-muted d-block">Cliente</small>
            ${escaparHTML(p.cliente)}<br><small>${escaparHTML(p.clienteDocumento)} - ${escaparHTML(p.clienteTelefono)}</small><br>
            <small>${escaparHTML(p.clienteCorreo)}</small></div>
          <div class="col-md-6"><small class="text-muted d-block">Entrega</small>
            ${escaparHTML(p.entregaDireccion)}<br>
            <small>${escaparHTML(p.entregaCiudad)}, ${escaparHTML(p.entregaDepartamento)}</small>
            ${p.entregaReferencia ? `<br><small class="text-muted">Ref.: ${escaparHTML(p.entregaReferencia)}</small>` : ''}</div>
          <div class="col-md-6"><small class="text-muted d-block">Fecha</small>${formatearFecha(p.fecha)}</div>
          <div class="col-md-3"><small class="text-muted d-block">Pago</small>${escaparHTML(p.metodoPago)}</div>
          <div class="col-md-3"><small class="text-muted d-block">Estado</small>${badgePedido(p.estado)}</div>
        </div>
        <div class="table-responsive mb-3">
          <table class="table table-sm align-middle mb-0">
            <thead><tr><th>Producto</th><th class="text-center">Cant.</th>
              <th class="text-end">P. unit.</th><th class="text-end">Subtotal</th></tr></thead>
            <tbody>${filas || '<tr><td colspan="4" class="text-center text-muted">Sin items.</td></tr>'}</tbody>
            <tfoot><tr><th colspan="3" class="text-end">Total</th>
              <th class="text-end">${formatearPrecio(p.total)}</th></tr></tfoot>
          </table>
        </div>
        <div class="border-top pt-3">
          <div id="pedidoEstadoAlerta" class="alert d-none mb-2"></div>
          <div class="d-flex align-items-center gap-2">
            <label class="form-label mb-0 me-1 text-nowrap fw-semibold">Cambiar estado:</label>
            <select class="form-select form-select-sm" id="selectEstadoPedido" style="max-width:160px">
              ${opcionesEstado}
            </select>
            <button type="button" class="btn btn-sm btn-accent" id="btnGuardarEstadoPedido"
                    data-pedido-id="${p.idPedido}">Guardar estado</button>
          </div>
        </div>`;

      $('#btnGuardarEstadoPedido').addEventListener('click', async (e) => {
        const pedidoId = e.currentTarget.dataset.pedidoId;
        const nuevoEstado = $('#selectEstadoPedido').value;
        const alerta = $('#pedidoEstadoAlerta');
        alerta.className = 'alert d-none mb-2';
        alerta.textContent = '';
        try {
          await apiFetchPlain(`${API.pedidos}/${pedidoId}/estado`, { body: nuevoEstado });
          bootstrap.Modal.getInstance($('#modalPedido'))?.hide();
          mostrarToast(`Estado del pedido #${pedidoId} actualizado a ${nuevoEstado}.`);
          await cargarModulo('pedidos');
        } catch (err) {
          alerta.className = 'alert alert-danger mb-2';
          alerta.textContent = err.message;
        }
      });

    } catch (err) {
      cont.innerHTML = `<div class="alert alert-danger mb-0">${escaparHTML(err.message)}</div>`;
    }
  }

  function cerrarSesion() {
    try {
      localStorage.removeItem('dripclub_sesion_iniciada');
      localStorage.removeItem(K_USUARIO);
    } catch (err) { /* almacenamiento no disponible */ }
    location.replace('../index.html');
  }

  /* ------------------------------------------------------------------------
     8. ELIMINACION (DELETE) GENERICA
     ------------------------------------------------------------------------ */
  const CAMPO_ID = {
    productos: 'idProducto',
    categorias: 'idCategoria',
    subcategorias: 'idSubcategoria',
    usuarios: 'idUsuario'
  };

  async function eliminarRegistro(modulo, id) {
    const registro = state.datos[modulo].find((x) => String(x[CAMPO_ID[modulo]]) === String(id));
    if (!registro) return;
    const t = TEXTOS_ELIMINAR[modulo];

    const ok = await confirmar({
      titulo: `Desactivar ${t.etiqueta}`,
      mensaje: `Desactivar ${t.etiqueta} "${t.nombre(registro)}"? Se marcara como inactivo (eliminacion logica); no se borra de la base de datos.`,
      textoBoton: 'Desactivar'
    });
    if (!ok) return;

    try {
      await apiFetch(`${API[modulo]}/${id}`, { method: 'DELETE' });
      mostrarToast(`${t.etiqueta[0].toUpperCase()}${t.etiqueta.slice(1)} desactivado correctamente.`);
      await cargarModulo(modulo);
    } catch (err) {
      mostrarToast(`No se pudo desactivar: ${err.message}`, 'danger');
    }
  }

  /* ------------------------------------------------------------------------
     8b. ACCIONES DE USUARIOS: rol y activo/inactivo
     ------------------------------------------------------------------------ */
  async function cambiarRolUsuario(id, nuevoRol) {
    try {
      await apiFetchPlain(`${API.usuarios}/${id}/rol`, { body: nuevoRol });
      mostrarToast(`Rol actualizado a ${nuevoRol}.`);
      // Actualiza en memoria sin recargar toda la tabla
      const u = state.datos.usuarios.find((x) => String(x.idUsuario) === String(id));
      if (u) u.rol = nuevoRol;
    } catch (err) {
      mostrarToast(`No se pudo cambiar el rol: ${err.message}`, 'danger');
      // Restaura el select al valor guardado en memoria
      renderUsuarios();
    }
  }

  async function toggleActivoUsuario(id, activoActual) {
    const nuevoActivo = !activoActual;
    const accion = nuevoActivo ? 'reactivar' : 'desactivar';
    const ok = await confirmar({
      titulo: nuevoActivo ? 'Reactivar usuario' : 'Desactivar usuario',
      mensaje: `Se va a ${accion} este usuario. Confirma para continuar.`,
      textoBoton: nuevoActivo ? 'Reactivar' : 'Desactivar'
    });
    if (!ok) return;

    try {
      await apiFetchPlain(`${API.usuarios}/${id}/activo`, { body: String(nuevoActivo) });
      mostrarToast(`Usuario ${nuevoActivo ? 'reactivado' : 'desactivado'} correctamente.`);
      await cargarModulo('usuarios');
    } catch (err) {
      mostrarToast(`No se pudo ${accion}: ${err.message}`, 'danger');
    }
  }

  /* ------------------------------------------------------------------------
     9. MODULO PRODUCTOS: modal de creacion / edicion
     ------------------------------------------------------------------------ */
  const form = () => $('#formProducto');

  function alertaProducto(mensaje) {
    const el = $('#productoAlerta');
    el.textContent = mensaje || '';
    el.classList.toggle('d-none', !mensaje);
  }

  function actualizarPreviewImagen() {
    const img = $('#prodImagenPreview');
    const src = resolverImagen($('#prodImagen').value.trim());
    if (!src) { img.classList.add('d-none'); return; }
    img.onload = () => img.classList.remove('d-none');
    img.onerror = () => img.classList.add('d-none');
    img.src = src;
  }

  /** Puebla el <select> consultando GET /api/subcategorias, agrupado por categoria. */
  async function poblarSubcategorias(seleccionada = null) {
    const sel = $('#prodSubcategoria');
    sel.disabled = true;
    sel.innerHTML = '<option value="">Cargando...</option>';

    try {
      const subs = await apiGetLista(API.subcategorias);
      state.datos.subcategorias = subs;

      // Solo activas, salvo la que ya tiene asignada el producto que se edita.
      const visibles = subs.filter((s) => s.activo || s.idSubcategoria === seleccionada);
      const grupos = new Map();
      visibles.forEach((s) => {
        const cat = s.categoria?.nombre ?? 'Sin categoria';
        if (!grupos.has(cat)) grupos.set(cat, []);
        grupos.get(cat).push(s);
      });

      let html = '<option value="">Selecciona una subcategoria...</option>';
      grupos.forEach((items, categoria) => {
        html += `<optgroup label="${escaparHTML(categoria)}">` +
          items.map((s) => `<option value="${s.idSubcategoria}">${escaparHTML(s.nombre)}${s.activo ? '' : ' (inactiva)'}</option>`).join('') +
          '</optgroup>';
      });
      sel.innerHTML = html;
      sel.value = seleccionada != null ? String(seleccionada) : '';
      sel.disabled = false;
    } catch (err) {
      sel.innerHTML = '<option value="">No se pudieron cargar</option>';
      alertaProducto(`No se pudieron cargar las subcategorias: ${err.message}`);
    }
  }

  async function abrirModalProducto(id = null) {
    const f = form();
    f.reset();
    f.classList.remove('was-validated');
    $('#prodOferta').setCustomValidity('');
    alertaProducto('');

    const producto = id != null
      ? state.datos.productos.find((p) => String(p.idProducto) === String(id))
      : null;

    $('#modalProductoTitulo').textContent = producto ? `Editar producto #${producto.idProducto}` : 'Nuevo producto';
    $('#prodId').value = producto ? producto.idProducto : '';
    $('#prodNombre').value = producto?.nombre ?? '';
    $('#prodDescripcion').value = producto?.descripcion ?? '';
    $('#prodPrecio').value = producto?.precio ?? '';
    $('#prodOferta').value = producto?.precioOferta ?? '';
    $('#prodStock').value = producto?.stock ?? 0;
    $('#prodImagen').value = producto?.imagen ?? '';
    $('#prodActivo').checked = producto ? !!producto.activo : true;
    actualizarPreviewImagen();

    bootstrap.Modal.getOrCreateInstance($('#modalProducto')).show();
    await poblarSubcategorias(producto?.subcategoria?.idSubcategoria ?? null);
  }

  function validarProducto() {
    const oferta = $('#prodOferta');
    const precio = parseFloat($('#prodPrecio').value);
    const valorOferta = oferta.value.trim();

    oferta.setCustomValidity('');
    if (valorOferta !== '' && !(parseFloat(valorOferta) < precio)) {
      oferta.setCustomValidity('La oferta debe ser menor al precio.');
    }
    form().classList.add('was-validated');
    return form().checkValidity();
  }

  function construirPayloadProducto() {
    const texto = (id) => $(id).value.trim();
    const oferta = texto('#prodOferta');
    return {
      nombre: texto('#prodNombre'),
      descripcion: texto('#prodDescripcion') || null,
      precio: parseFloat($('#prodPrecio').value),
      precioOferta: oferta === '' ? null : parseFloat(oferta),
      imagen: texto('#prodImagen') || null,
      stock: parseInt($('#prodStock').value, 10),
      activo: $('#prodActivo').checked,
      subcategoria: { idSubcategoria: Number($('#prodSubcategoria').value) }
    };
  }

  async function guardarProducto(evento) {
    evento.preventDefault();
    alertaProducto('');
    if (!validarProducto()) return;

    const id = $('#prodId').value;
    const btn = $('#btnGuardarProducto');
    const spinner = $('.spinner-border', btn);
    btn.disabled = true;
    spinner.classList.remove('d-none');

    try {
      await apiFetch(id ? `${API.productos}/${id}` : API.productos, {
        method: id ? 'PUT' : 'POST',
        body: construirPayloadProducto()
      });
      bootstrap.Modal.getInstance($('#modalProducto'))?.hide();
      mostrarToast(id ? 'Producto actualizado correctamente.' : 'Producto creado correctamente.');
      await cargarModulo('productos');
    } catch (err) {
      alertaProducto(err.message);
    } finally {
      btn.disabled = false;
      spinner.classList.add('d-none');
    }
  }

  /* ------------------------------------------------------------------------
     10. EVENTOS
     ------------------------------------------------------------------------ */
  function registrarEventos() {
    // Delegacion de eventos para las acciones de las tablas.
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn || btn.disabled) return;

      switch (btn.dataset.action) {
        case 'editar-producto': abrirModalProducto(btn.dataset.id); break;
        case 'eliminar': eliminarRegistro(btn.dataset.modulo, btn.dataset.id); break;
        case 'ver-pedido': verPedido(btn.dataset.id); break;
        case 'recargar': cargarModulo(state.vista); break;
        case 'toggle-activo':
          toggleActivoUsuario(btn.dataset.id, btn.dataset.activo === 'true');
          break;
      }
    });

    // Delegacion de eventos para selects (cambio de rol)
    document.addEventListener('change', (e) => {
      const sel = e.target.closest('[data-action="cambiar-rol"]');
      if (!sel) return;
      cambiarRolUsuario(sel.dataset.id, sel.value);
    });

    // Imagen rota en miniaturas: se reemplaza por un placeholder (error no burbujea -> captura).
    document.addEventListener('error', (e) => {
      const img = e.target;
      if (img.tagName === 'IMG' && img.dataset.fallback) {
        const ph = document.createElement('span');
        ph.className = 'thumb thumb-placeholder';
        ph.innerHTML = '<i class="fa-regular fa-image"></i>';
        img.replaceWith(ph);
      }
    }, true);

    $('#btnNuevoProducto').addEventListener('click', () => abrirModalProducto());
    $('#btnCerrarSesion').addEventListener('click', (e) => { e.preventDefault(); cerrarSesion(); });
    $('#btnRecargar').addEventListener('click', () => cargarModulo(state.vista));
    $('#formProducto').addEventListener('submit', guardarProducto);
    $('#prodImagen').addEventListener('input', actualizarPreviewImagen);
    $('#prodPrecio').addEventListener('input', () => $('#prodOferta').setCustomValidity(''));
    $('#prodOferta').addEventListener('input', (e) => e.target.setCustomValidity(''));

    $('#btnToggleSidebar').addEventListener('click', abrirSidebarMovil);
    $('#sidebarBackdrop').addEventListener('click', cerrarSidebarMovil);
    window.addEventListener('hashchange', () => activarVista(vistaDesdeHash()));
  }

  /* ------------------------------------------------------------------------
     11. ARRANQUE
     ------------------------------------------------------------------------ */
  document.addEventListener('DOMContentLoaded', () => {
    registrarEventos();
    activarVista(vistaDesdeHash());
  });

})();
