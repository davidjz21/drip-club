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
