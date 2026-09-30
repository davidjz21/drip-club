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

  // 2. Si la categoría tiene subcategoría de polos por defecto, la activamos también
  let subcategoriaBoton = null;
  if (categoriaId === 'hombres') {
    subcategoriaBoton = document.querySelector('button[data-bs-target="#hombre-polos"]');
  } else if (categoriaId === 'mujeres') {
    subcategoriaBoton = document.querySelector('button[data-bs-target="#mujer-polos"]');
  } else if (categoriaId === 'infantil') {
    subcategoriaBoton = document.querySelector('button[data-bs-target="#infantil-polos"]');
  } else if (categoriaId === 'accesorios') {
    subcategoriaBoton = document.querySelector('button[data-bs-target="#accesorios-gorras"]');
  }

  if (subcategoriaBoton) {
    const tabSub = new bootstrap.Tab(subcategoriaBoton);
    tabSub.show();
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
        <a href="${enlaceCatalogo}" class="btn btn-outline-dark btn-sm px-4" data-bs-dismiss="offcanvas">
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

    // ID único basado en titulo e imagen para admitir multiples productos diferentes
    const idProducto = (titulo + '-' + imagen).toLowerCase().replace(/[^a-z0-9]/g, '-');

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