/* ==========================================================================
   DRIP CLUB · PANEL DE ADMINISTRACIÓN (SPA)
   JavaScript nativo (fetch + async/await). Sin dependencias salvo Bootstrap.

   Endpoints consumidos (rutas relativas al mismo origen de Spring Boot):
     /api/productos · /api/categorias · /api/subcategorias · /api/usuarios

   Nota: en el backend DELETE realiza una ELIMINACIÓN LÓGICA (activo = false),
   por eso las tablas siguen mostrando los registros con estado "Inactivo".
   ========================================================================== */
'use strict';

(() => {

  /* ------------------------------------------------------------------------
     1. CONFIGURACIÓN Y ESTADO
     ------------------------------------------------------------------------ */
  const API = {
    productos: '/api/productos',
    categorias: '/api/categorias',
    subcategorias: '/api/subcategorias',
    usuarios: '/api/usuarios'
  };

  const K_USUARIO = 'dripclub_usuario'; // misma clave que usa la tienda (cuenta.html)

  const state = {
    vista: 'productos',
    datos: { productos: [], categorias: [], subcategorias: [], usuarios: [] },
    cargado: { productos: false, categorias: false, subcategorias: false, usuarios: false }
  };

  // Configuración de cada módulo: título del header, tbody, nº de columnas y render.
  const MODULOS = {
    productos: { titulo: 'Productos', tbody: 'tbodyProductos', columnas: 8, render: renderProductos },
    categorias: { titulo: 'Categorías', tbody: 'tbodyCategorias', columnas: 4, render: renderCategorias },
    subcategorias: { titulo: 'Subcategorías', tbody: 'tbodySubcategorias', columnas: 5, render: renderSubcategorias },
    usuarios: { titulo: 'Usuarios', tbody: 'tbodyUsuarios', columnas: 7, render: renderUsuarios }
  };

  // Textos para el modal de confirmación de cada eliminación.
  const TEXTOS_ELIMINAR = {
    productos: { etiqueta: 'producto', nombre: (x) => x.nombre },
    categorias: { etiqueta: 'categoría', nombre: (x) => x.nombre },
    subcategorias: { etiqueta: 'subcategoría', nombre: (x) => x.nombre },
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
   * Replica la lógica de la tienda (resolverRutaImagen) pero desde /admin/.
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
        if (partes.length) return partes.join(' · ');
      }
    } catch (err) { /* cuerpo vacío o no JSON */ }
    if (resp.status === 404) return 'El registro ya no existe (404).';
    if (resp.status >= 500) return `Error interno del servidor (${resp.status}).`;
    return `La API respondió con estado ${resp.status}.`;
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
      throw new ApiError('No se pudo conectar con el servidor. Verifica que la aplicación esté en ejecución.');
    }

    if (!resp.ok) throw new ApiError(await leerMensajeError(resp), resp.status);
    if (resp.status === 204) return null;

    try {
      return await resp.json();
    } catch (err) {
      throw new ApiError('La API devolvió una respuesta que no es JSON válido.', resp.status);
    }
  }

  async function apiGetLista(url) {
    const datos = await apiFetch(url);
    if (!Array.isArray(datos)) throw new ApiError(`La respuesta de ${url} no es una lista.`);
    return datos;
  }

  /* ------------------------------------------------------------------------
     4. COMPONENTES UI: toasts y confirmación
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

  /** Modal de confirmación reutilizable. Devuelve Promise<boolean>. */
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
     5. NAVEGACIÓN SPA (d-none + hash)
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
        : '<span class="text-muted">—</span>';

      const stock = Number(p.stock) === 0
        ? '<span class="badge text-bg-danger">0 · Agotado</span>'
        : `<span class="badge text-bg-light border">${Number(p.stock)}</span>`;

      const sub = p.subcategoria
        ? `${escaparHTML(p.subcategoria.categoria?.nombre ?? '—')} › ${escaparHTML(p.subcategoria.nombre)}`
        : '<span class="text-muted">—</span>';

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
        <td>${s.categoria ? escaparHTML(s.categoria.nombre) : '<span class="text-muted">—</span>'}</td>
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
      return `
        <tr>
          <td>${u.idUsuario}</td>
          <td class="fw-semibold">${escaparHTML(u.nombre)}${esMismo ? ' <span class="badge text-bg-warning">Tú</span>' : ''}</td>
          <td>${escaparHTML(u.correo)}</td>
          <td>${u.telefono ? escaparHTML(u.telefono) : '<span class="text-muted">—</span>'}</td>
          <td class="text-center"><span class="badge badge-rol ${rol === 'CLIENTE' ? 'rol-cliente' : ''}">${escaparHTML(rol || '—')}</span></td>
          <td class="text-center">${badgeEstado(u.activo)}</td>
          <td class="text-end">${botonDesactivar('usuarios', u.idUsuario, u.activo, esMismo,
            esMismo ? 'No puedes desactivar tu propia sesión' : 'Desactivar')}</td>
        </tr>`;
    }).join('');
  }

  /* ------------------------------------------------------------------------
     8. ELIMINACIÓN (DELETE) GENÉRICA
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
      mensaje: `¿Desactivar ${t.etiqueta} "${t.nombre(registro)}"? Se marcará como inactivo (eliminación lógica); no se borra de la base de datos.`,
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
     9. MÓDULO PRODUCTOS: modal de creación / edición
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

  /** Puebla el <select> consultando GET /api/subcategorias, agrupado por categoría. */
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
        const cat = s.categoria?.nombre ?? 'Sin categoría';
        if (!grupos.has(cat)) grupos.set(cat, []);
        grupos.get(cat).push(s);
      });

      let html = '<option value="">Selecciona una subcategoría...</option>';
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
      alertaProducto(`No se pudieron cargar las subcategorías: ${err.message}`);
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
    // Delegación de eventos para las acciones de las tablas.
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn || btn.disabled) return;

      switch (btn.dataset.action) {
        case 'editar-producto': abrirModalProducto(btn.dataset.id); break;
        case 'eliminar': eliminarRegistro(btn.dataset.modulo, btn.dataset.id); break;
        case 'recargar': cargarModulo(state.vista); break;
      }
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
