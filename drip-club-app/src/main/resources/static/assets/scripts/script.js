/**
 * Función para navegar desde el carrusel directamente a una categoría específica
 * @param {string} categoriaId - 'hombres', 'mujeres' o 'infantil'
 */
function irACategoria(categoriaId) {
  // 1. Buscar el botón de la categoría principal y simular un clic de Bootstrap
  const botonCategoria = document.querySelector(`button[data-bs-target="#${categoriaId}"]`);
  if (botonCategoria) {
    const tabBootstrap = new bootstrap.Tab(botonCategoria);
    tabBootstrap.show();
  }

  // 2. Activar la primera subcategoría disponible de esa categoría.
  // Los botones se generan dinámicamente según lo que devuelve la API.
  const panelCategoria = document.getElementById(categoriaId);
  const subcategoriaBoton = panelCategoria
    ? panelCategoria.querySelector('[data-bs-toggle="pill"][data-bs-target]')
    : null;

  if (subcategoriaBoton) {
    bootstrap.Tab.getOrCreateInstance(subcategoriaBoton).show();
  }

  // 3. Desplazamiento suave hacia el catálogo
  const seccionCatalogo = document.getElementById('catalogo');
  if (seccionCatalogo) {
    seccionCatalogo.scrollIntoView({ behavior: 'smooth' });
  }
}

/**
 * Temporizador de cuenta regresiva en vivo para el banner promocional
 * y eventos de scroll solo para los botones de categorías principales
 */
document.addEventListener('DOMContentLoaded', () => {
  // Conectar SOLO los 4 botones de categorías principales (debajo del carrusel)
  const botonesCategoriasPrincipales = document.querySelectorAll('#categorias button[data-bs-toggle="pill"]');
  botonesCategoriasPrincipales.forEach(boton => {
    boton.addEventListener('click', () => {
      const targetId = boton.getAttribute('data-bs-target');
      // Garantizar que ningún otro tab-pane principal quede visible al mismo tiempo
      document.querySelectorAll('.tab-pane#hombres, .tab-pane#mujeres, .tab-pane#infantil, .tab-pane#accesorios').forEach(pane => {
        if (`#${pane.id}` !== targetId) {
          pane.classList.remove('show', 'active');
        }
      });

      const seccionCatalogo = document.getElementById('catalogo');
      if (seccionCatalogo) {
        seccionCatalogo.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
  // Fecha límite: 3 días a partir de hoy (para que siempre tenga tiempo)
  const fechaLimite = new Date();
  fechaLimite.setDate(fechaLimite.getDate() + 3);

  function actualizarCuentaRegresiva() {
    const ahora = new Date().getTime();
    const distancia = fechaLimite.getTime() - ahora;

    if (distancia > 0) {
      const dias = Math.floor(distancia / (1000 * 60 * 60 * 24));
      const horas = Math.floor((distancia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutos = Math.floor((distancia % (1000 * 60 * 60)) / (1000 * 60));
      const segundos = Math.floor((distancia % (1000 * 60)) / 1000);

      const elDias = document.getElementById('cuentaDias');
      const elHoras = document.getElementById('cuentaHoras');
      const elMin = document.getElementById('cuentaMinutos');
      const elSeg = document.getElementById('cuentaSegundos');

      if (elDias && elHoras && elMin && elSeg) {
        elDias.textContent = dias < 10 ? '0' + dias : dias;
        elHoras.textContent = horas < 10 ? '0' + horas : horas;
        elMin.textContent = minutos < 10 ? '0' + minutos : minutos;
        elSeg.textContent = segundos < 10 ? '0' + segundos : segundos;
      }
    }
  }

  // Ejecutar inmediatamente y luego cada 1 segundo
  actualizarCuentaRegresiva();
  setInterval(actualizarCuentaRegresiva, 1000);
});



// SECCIÓN DE OFERTAS
const navOfertas = document.getElementById('navOfertas');
const seccionOfertas = document.getElementById('ofertas');
const productosOfertas = document.getElementById('productosOfertas');

if (navOfertas && productosOfertas && seccionOfertas) {
  navOfertas.addEventListener('click', function () {

    // Limpiar las ofertas antes de volver a generarlas
    productosOfertas.innerHTML = '';

    // Buscar todos los productos marcados como oferta
    const productosConOferta =
      document.querySelectorAll('[data-oferta="true"]');

    productosConOferta.forEach(producto => {

      // Crear una copia del producto
      const copia = producto.cloneNode(true);

      // Buscar el precio original
      const precioElemento =
        copia.querySelector('.fw-bold.mb-3');

      if (!precioElemento) return;

      // Convertir "S/ 159.90" en el número 159.90
      const precioNormal = parseFloat(
        precioElemento.textContent.replace('S/', '').trim()
      );

      // Obtener el precio de oferta
      const precioOferta =
        parseFloat(producto.dataset.precioOferta);

      // Calcular porcentaje de descuento
      const descuento = Math.round(
        ((precioNormal - precioOferta) / precioNormal) * 100
      );

      // Mostrar precio anterior + precio nuevo + porcentaje
      precioElemento.innerHTML = `
        <span class="text-muted text-decoration-line-through me-2">
          S/ ${precioNormal.toFixed(2)}
        </span>

        <span class="text-danger fs-5">
          S/ ${precioOferta.toFixed(2)}
        </span>

        <span class="badge bg-danger ms-2">
          -${descuento}%
        </span>
      `;

      // Colocar la copia dentro de Ofertas
      productosOfertas.appendChild(copia);
    });

    // Mostrar la seccion Ofertas
    seccionOfertas.classList.remove('d-none');

    // Bajar automaticamente hacia Ofertas
    seccionOfertas.scrollIntoView({
      behavior: 'smooth'
    });

  });
}


// SIMULACION DEL CARRITO DE COMPRAS JS

function cargarCarritoStorage() {
  try {
    const datos = localStorage.getItem('drip_carrito');
    return datos ? JSON.parse(datos) : [];
  } catch (err) {
    return [];
  }
}

function guardarCarritoStorage(datos) {
  try {
    localStorage.setItem('drip_carrito', JSON.stringify(datos));
  } catch (err) {
    // Si localStorage no esta habilitado, continua en memoria
  }
}

// Estado del carrito en memoria y sincronizado con localStorage
let carrito = cargarCarritoStorage();

/**
 * Abre el panel lateral del carrito de forma segura
 */
function abrirOffcanvasCarrito() {
  const offcanvasEl = document.getElementById('offcanvasCarrito');
  if (offcanvasEl) {
    const bsOffcanvas = bootstrap.Offcanvas.getOrCreateInstance(offcanvasEl);
    bsOffcanvas.show();
  }
}

/**
 * Extrae de forma segura el precio numerico de una tarjeta de producto
 * considerando tanto productos normales como en oferta
 * @param {HTMLElement} cardElement 
 * @returns {number}
 */
function obtenerPrecioProducto(cardElement) {
  // 1. Si tiene precio en oferta destacado (.text-danger)
  const spanOferta = cardElement.querySelector('.text-danger');
  if (spanOferta) {
    const texto = spanOferta.textContent.replace('S/', '').trim();
    const num = parseFloat(texto);
    if (!isNaN(num)) return num;
  }

  // 2. Si el contenedor padre tiene data-precio-oferta dentro de ofertas
  const contenedorProducto = cardElement.closest('.producto');
  if (contenedorProducto && cardElement.closest('#ofertas') && contenedorProducto.dataset.precioOferta) {
    const num = parseFloat(contenedorProducto.dataset.precioOferta);
    if (!isNaN(num)) return num;
  }

  // 3. Precio regular dentro de .fw-bold
  const elementoPrecio = cardElement.querySelector('.fw-bold');
  if (elementoPrecio) {
    const match = elementoPrecio.textContent.match(/[\d]+(\.[\d]+)?/);
    if (match) return parseFloat(match[0]);
  }

  return 0.0;
}

/**
 * Guarda el carrito actual en storage y refresca la interfaz
 */
function guardarYActualizarCarrito() {
  guardarCarritoStorage(carrito);
  renderizarCarritoUI();
}

/**
 * Ajusta la ruta relativa de las imágenes según si estamos en la raíz (index.html)
 * o dentro de la subcarpeta assets/pages/
 * @param {string} ruta 
 * @returns {string}
 */
function resolverRutaImagen(ruta) {
  if (!ruta) return '';
  if (ruta.startsWith('http') || ruta.startsWith('//') || ruta.startsWith('data:')) {
    return ruta;
  }
  const enPaginas = window.location.pathname.includes('/assets/pages/') || window.location.href.includes('/assets/pages/');
  let limpia = ruta.replace(/^(\.\.\/)+/, '').replace(/^(\.\/)+/, '');

  if (enPaginas) {
    if (limpia.startsWith('assets/image/')) {
      return '../image/' + limpia.replace('assets/image/', '');
    }
    if (limpia.startsWith('image/')) {
      return '../' + limpia;
    }
    return '../image/' + limpia.split('/').pop();
  } else {
    if (limpia.startsWith('image/')) {
      return 'assets/' + limpia;
    }
    if (!limpia.startsWith('assets/')) {
      return 'assets/image/' + limpia.split('/').pop();
    }
    return limpia;
  }
}

/**
 * Renderiza el estado visual del carrito (items, subtotal y total)
 */
function renderizarCarritoUI() {
  const contenedorItems = document.getElementById('contenedorItemsCarrito');
  const resumenCarrito = document.getElementById('resumenCarrito');
  const cartSubtotal = document.getElementById('cartSubtotal');
  const cartTotal = document.getElementById('cartTotal');

  if (!contenedorItems) return;

  const enPaginas = window.location.pathname.includes('/assets/pages/') || window.location.href.includes('/assets/pages/');
  const enlaceCatalogo = enPaginas ? '../../index.html#catalogo' : '#catalogo';

  // Estado: Carrito vacío
  if (carrito.length === 0) {
    contenedorItems.innerHTML = `
      <div class="text-center py-5 my-auto">
        <p class="text-muted mb-3">Tu carrito está vacío.</p>
        <a href="${enlaceCatalogo}" class="btn btn-outline-dark btn-sm px-4">
          Explorar Catálogo
        </a>
      </div>
    `;
    if (resumenCarrito) resumenCarrito.classList.add('d-none');
    return;
  }

  // Estado: Carrito con productos
  if (resumenCarrito) resumenCarrito.classList.remove('d-none');

  let htmlItems = '';
  carrito.forEach(item => {
    const subtotalItem = (item.precio * item.cantidad).toFixed(2);
    htmlItems += `
      <div class="d-flex align-items-center justify-content-between py-3 border-bottom cart-item" data-id="${item.id}">
        <div class="d-flex align-items-center gap-3">
          <img src="${resolverRutaImagen(item.imagen)}" class="rounded-1 object-fit-cover" style="height: 60px; width: 60px;" alt="${item.titulo}">
          <div>
            <h6 class="mb-0 fw-semibold text-truncate" style="max-width: 170px;" title="${item.titulo}">${item.titulo}</h6>
            <small class="text-muted d-block">S/ ${item.precio.toFixed(2)}</small>
            <div class="d-flex align-items-center gap-2 mt-2">
              <button type="button" class="btn btn-sm btn-outline-secondary py-0 px-2 btn-disminuir" data-id="${item.id}">-</button>
              <span class="small fw-semibold px-1">${item.cantidad}</span>
              <button type="button" class="btn btn-sm btn-outline-secondary py-0 px-2 btn-aumentar" data-id="${item.id}">+</button>
            </div>
          </div>
        </div>
        <div class="text-end">
          <span class="fw-bold d-block mb-2">S/ ${subtotalItem}</span>
          <button type="button" class="btn btn-link text-muted p-0 text-decoration-none btn-eliminar-item" data-id="${item.id}" title="Eliminar">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
      </div>
    `;
  });

  contenedorItems.innerHTML = htmlItems;

  const totalPagar = carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
  if (cartSubtotal) cartSubtotal.textContent = `S/ ${totalPagar.toFixed(2)}`;
  if (cartTotal) cartTotal.textContent = `S/ ${totalPagar.toFixed(2)}`;
}

// Delegación global de eventos para interactuar con el carrito
document.addEventListener('click', (e) => {
  // Abrir carrito desde el botón del navbar (funciona con o sin productos agregados)
  const btnNavbar = e.target.closest('#btnAbrirCarrito');
  if (btnNavbar) {
    e.preventDefault();
    abrirOffcanvasCarrito();
    return;
  }

  // 1. Clic en Agregar al carrito en cualquier producto
  const botonAgregar = e.target.closest('.btn-agregar-carrito');
  if (botonAgregar) {
    e.preventDefault();

    const card = botonAgregar.closest('.card');
    if (!card) return;

    const imgElemento = card.querySelector('img');
    const tituloElemento = card.querySelector('.card-title');
    const detalleElemento = card.querySelector('.card-text');

    const titulo = tituloElemento ? tituloElemento.textContent.trim() : 'Prenda Drip';
    const precio = obtenerPrecioProducto(card);
    const imagen = imgElemento ? imgElemento.getAttribute('src') : '';
    const detalle = detalleElemento ? detalleElemento.textContent.trim() : '';

    const idReal = card.closest('.producto')?.dataset.productoId;
    if (!idReal) return;
    const idProducto = String(idReal);

    const itemExistente = carrito.find(item => item.id === idProducto);
    if (itemExistente) {
      itemExistente.cantidad += 1;
    } else {
      carrito.push({
        id: idProducto,
        titulo: titulo,
        precio: precio,
        imagen: imagen,
        detalle: detalle,
        cantidad: 1
      });
    }

    guardarYActualizarCarrito();

    // Abrir panel lateral para mostrar los productos acumulados
    abrirOffcanvasCarrito();
    return;
  }

  // 2. Incrementar cantidad (+)
  const btnAumentar = e.target.closest('.btn-aumentar');
  if (btnAumentar) {
    const id = btnAumentar.dataset.id;
    const item = carrito.find(p => p.id === id);
    if (item) {
      item.cantidad += 1;
      guardarYActualizarCarrito();
    }
    return;
  }

  // 3. Disminuir cantidad (-)
  const btnDisminuir = e.target.closest('.btn-disminuir');
  if (btnDisminuir) {
    const id = btnDisminuir.dataset.id;
    const item = carrito.find(p => p.id === id);
    if (item) {
      if (item.cantidad > 1) {
        item.cantidad -= 1;
      } else {
        carrito = carrito.filter(p => p.id !== id);
      }
      guardarYActualizarCarrito();
    }
    return;
  }

  // 4. Eliminar producto del carrito (X)
  const btnEliminar = e.target.closest('.btn-eliminar-item');
  if (btnEliminar) {
    const id = btnEliminar.dataset.id;
    carrito = carrito.filter(p => p.id !== id);
    guardarYActualizarCarrito();
    return;
  }

  // 5. Vaciar carrito
  const btnVaciar = e.target.closest('#btnVaciarCarrito');
  if (btnVaciar) {
    carrito = [];
    guardarYActualizarCarrito();
    return;
  }

  // 6. Finalizar Compra: Redirigir a la página de facturación y pago
  const btnFinalizar = e.target.closest('#btnFinalizarCompra');
  if (btnFinalizar) {
    if (carrito.length === 0) {
      alert('Tu carrito está vacío. Agrega prendas para continuar.');
      return;
    }

    const offcanvasEl = document.getElementById('offcanvasCarrito');
    if (offcanvasEl) {
      const bsOffcanvas = bootstrap.Offcanvas.getInstance(offcanvasEl);
      if (bsOffcanvas) bsOffcanvas.hide();
    }

    // Detectar ubicacion actual para la ruta de facturacion.html
    const enPaginas = window.location.pathname.includes('/assets/pages/') || window.location.href.includes('/assets/pages/');
    window.location.href = enPaginas ? 'facturacion.html' : 'assets/pages/facturacion.html';
    return;
  }
});

// Renderizar UI inicial al cargar el documento
document.addEventListener('DOMContentLoaded', () => {
  renderizarCarritoUI();

  // Asegurar apertura directa desde el botón del navbar
  const btnAbrirCarrito = document.getElementById('btnAbrirCarrito');
  if (btnAbrirCarrito) {
    btnAbrirCarrito.addEventListener('click', (e) => {
      e.preventDefault();
      abrirOffcanvasCarrito();
    });
  }
});

/* ==========================================================
   CATÁLOGO DINÁMICO: productos y filtros desde Spring Boot
   Endpoint: GET /api/productos
   ========================================================== */

function normalizarTextoCatalogo(valor) {
  return String(valor || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

function escaparHTMLCatalogo(valor) {
  return String(valor ?? '').replace(/[&<>"']/g, caracter => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[caracter]);
}

function obtenerIdCategoriaCatalogo(nombre) {
  const texto = normalizarTextoCatalogo(nombre);

  if (texto.includes('hombre') && !texto.includes('mujer')) return 'hombres';
  if (texto.includes('mujer')) return 'mujeres';
  if (texto.includes('infantil') || texto.includes('nino') || texto.includes('nina')) return 'infantil';
  if (texto.includes('accesorio')) return 'accesorios';

  return texto.replace(/[^a-z0-9]+/g, '-') || 'otros';
}

function obtenerProductosCatalogo(productos) {
  return productos.filter(producto => {
    // Si el backend no envía "activo", se considera disponible.
    return producto.activo === undefined || producto.activo === null || producto.activo === true;
  });
}

function crearTarjetaProducto(producto) {
  const nombre = escaparHTMLCatalogo(producto.nombre || 'Producto Drip Club');
  const descripcion = escaparHTMLCatalogo(producto.descripcion || 'Estilo urbano');
  const imagenOriginal = producto.imagen || '';
  const imagen = escaparHTMLCatalogo(resolverRutaImagen(imagenOriginal));
  const precio = Number(producto.precio || 0);
  const precioOferta = Number(producto.precioOferta || 0);
  const tieneOferta = precioOferta > 0 && precioOferta < precio;
  const precioMostrar = tieneOferta ? precioOferta : precio;
  const id = escaparHTMLCatalogo(producto.idProducto ?? '');
  const sinStock = Number(producto.stock ?? 1) <= 0;

  const precioHTML = tieneOferta
    ? `<p class="fw-bold mb-3">
         <span class="text-muted text-decoration-line-through me-2">S/ ${precio.toFixed(2)}</span>
         <span class="text-danger">S/ ${precioOferta.toFixed(2)}</span>
       </p>`
    : `<p class="fw-bold mb-3">S/ ${precio.toFixed(2)}</p>`;

  return `
    <div class="col-12 col-sm-6 col-md-4 producto"
         data-producto-id="${id}"
         ${tieneOferta ? `data-oferta="true" data-precio-oferta="${precioOferta.toFixed(2)}"` : ''}>
      <div class="card h-100 shadow-sm">
        <img src="${imagen}" class="card-img-top imagen-producto"
             alt="${nombre}" loading="lazy"
             onerror="this.onerror=null;this.src='assets/image/logo.png';">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${nombre}</h5>
          <p class="card-text text-muted mb-1">${descripcion}</p>
          ${precioHTML}
          <button class="btn btn-dark mt-auto btn-agregar-carrito"
                  type="button" ${sinStock ? 'disabled' : ''}>
            ${sinStock ? 'Sin stock' : 'Agregar al carrito'}
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderizarCatalogoDesdeAPI(productos) {
  const contenedor = document.getElementById('contenidoCategorias');
  const estado = document.getElementById('estadoCatalogo');
  if (!contenedor) return;

  const disponibles = obtenerProductosCatalogo(productos);
  const agrupados = new Map();

  disponibles.forEach(producto => {
    const categoriaNombre = producto.subcategoria?.categoria?.nombre || 'Otros';
    const subcategoriaNombre = producto.subcategoria?.nombre || 'General';
    const categoriaId = obtenerIdCategoriaCatalogo(categoriaNombre);

    if (!agrupados.has(categoriaId)) {
      agrupados.set(categoriaId, {
        nombre: categoriaNombre,
        subcategorias: new Map()
      });
    }

    const grupo = agrupados.get(categoriaId);
    if (!grupo.subcategorias.has(subcategoriaNombre)) {
      grupo.subcategorias.set(subcategoriaNombre, []);
    }
    grupo.subcategorias.get(subcategoriaNombre).push(producto);
  });

  if (estado) estado.remove();

  if (disponibles.length === 0) {
    contenedor.innerHTML = `
      <div class="alert alert-info text-center">
        No hay productos activos para mostrar.
      </div>`;
    return;
  }

  const ordenCategorias = ['hombres', 'mujeres', 'infantil', 'accesorios'];
  const categoriasOrdenadas = Array.from(agrupados.entries()).sort((a, b) => {
    const ia = ordenCategorias.indexOf(a[0]);
    const ib = ordenCategorias.indexOf(b[0]);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });

  let html = '';
  let indiceCategoria = 0;

  categoriasOrdenadas.forEach(([categoriaId, grupo]) => {
    const subcategorias = Array.from(grupo.subcategorias.entries());
    const nombreCategoria = escaparHTMLCatalogo(grupo.nombre);
    const esPrimeraCategoria = indiceCategoria === 0;

    html += `
      <section class="tab-pane fade ${esPrimeraCategoria ? 'show active' : ''}"
               id="${escaparHTMLCatalogo(categoriaId)}">
        <div class="text-center mb-4">
          <span class="badge bg-dark px-3 py-2 text-uppercase mb-2 rounded-pill">
            Colección ${nombreCategoria}
          </span>
          <h2 class="fw-bold display-5 mb-1">Catálogo ${nombreCategoria}</h2>
          <p class="text-muted small">Explora nuestros productos disponibles</p>
        </div>

        <div class="nav nav-pills justify-content-center gap-2 flex-wrap mb-4"
             role="tablist">
          ${subcategorias.map(([nombreSubcategoria], indice) => {
            const subId = `subcat-${categoriaId}-${indice}`;
            return `
              <button class="btn btn-outline-dark ${indice === 0 ? 'active' : ''}"
                      data-bs-toggle="pill"
                      data-bs-target="#${subId}"
                      type="button" role="tab">
                ${escaparHTMLCatalogo(nombreSubcategoria)}
              </button>`;
          }).join('')}
        </div>

        <div class="tab-content">
          ${subcategorias.map(([nombreSubcategoria, listaProductos], indice) => {
            const subId = `subcat-${categoriaId}-${indice}`;
            return `
              <div class="tab-pane fade ${indice === 0 ? 'show active' : ''}"
                   id="${subId}" role="tabpanel">
                <div class="mb-4">
                  <div class="text-start mb-2">
                    <a href="#menu-categorias"
                       class="btn btn-outline-dark btn-sm rounded-pill px-3 fw-bold shadow-sm">
                      <i class="fa-solid fa-arrow-up me-2"></i> Volver al menú
                    </a>
                  </div>
                  <div class="text-center">
                    <h2 class="fw-bold display-6 mb-1">${escaparHTMLCatalogo(nombreSubcategoria)}</h2>
                    <div class="bg-primary mx-auto rounded-pill" style="width: 50px; height: 3px;"></div>
                  </div>
                </div>
                <div class="row g-4">
                  ${listaProductos.map(crearTarjetaProducto).join('')}
                </div>
              </div>`;
          }).join('')}
        </div>
      </section>`;
    indiceCategoria++;
  });

  contenedor.innerHTML = html;

  // Si la base de datos no contiene alguna de las cuatro categorías principales,
  // su botón del menú se oculta para evitar una pestaña vacía.
  document.querySelectorAll('#categorias [data-bs-target]').forEach(boton => {
    const id = boton.getAttribute('data-bs-target').replace('#', '');
    boton.classList.toggle('d-none', !agrupados.has(id));
  });
}

async function cargarProductosDesdeAPI() {
  const contenedor = document.getElementById('contenidoCategorias');
  if (!contenedor) return;

  try {
    const respuesta = await fetch('/api/productos', {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    if (!respuesta.ok) {
      throw new Error(`La API respondió con estado ${respuesta.status}`);
    }

    const productos = await respuesta.json();
    if (!Array.isArray(productos)) {
      throw new Error('La respuesta de /api/productos no es una lista.');
    }

    renderizarCatalogoDesdeAPI(productos);
  } catch (error) {
    console.error('Error al cargar el catálogo:', error);
    contenedor.innerHTML = `
      <div class="alert alert-danger text-center">
        <strong>No se pudo cargar el catálogo.</strong>
        <p class="mb-0 mt-1">Verifica que Spring Boot esté ejecutándose y que
        <code>/api/productos</code> esté disponible.</p>
        <button class="btn btn-outline-danger btn-sm mt-3"
                type="button" onclick="cargarProductosDesdeAPI()">
          Reintentar
        </button>
      </div>`;
  }
}

document.addEventListener('DOMContentLoaded', cargarProductosDesdeAPI);