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
 */
document.addEventListener('DOMContentLoaded', () => {
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
