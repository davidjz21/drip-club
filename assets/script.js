
function mostrarCategorias(categoria) {
    let subcategorias = document.getElementById("subcategorias");

    if (categoria == "hombres") {
        subcategorias.innerHTML = `<button class="btn btn-outline-dark">Polos</button>
                                   <button class="btn btn-outline-dark">Pantalones</button>
                                   <button class="btn btn-outline-dark">Zapatos</button>
                                   <button class="btn btn-outline-dark">Zapatillas</button>
                                   <button class="btn btn-outline-dark">Casacas</button>`;

    } else if (categoria == "mujeres") {
        subcategorias.innerHTML =`<button class="btn btn-outline-dark">Polos</button>
                                  <button class="btn btn-outline-dark">Blusas</button>
                                  <button class="btn btn-outline-dark">Pantalones</button>
                                  <button class="btn btn-outline-dark">Faldas</button>
                                  <button class="btn btn-outline-dark">Vestidos</button>
                                  <button class="btn btn-outline-dark">Tacos</button>
                                  <button class="btn btn-outline-dark">Zapatillas</button>
                                  <button class="btn btn-outline-dark">Casacas</button>`;

    } else if (categoria == "niños") {
        subcategorias.innerHTML =`<button class="btn btn-outline-dark">Polos</button>
                                  <button class="btn btn-outline-dark">Pantalones</button>
                                  <button class="btn btn-outline-dark">Shorts</button>
                                  <button class="btn btn-outline-dark">Zapatillas</button>
                                  <button class="btn btn-outline-dark">Casacas</button>`;
    }
}
