package com.dripclub.api.service;

import java.util.List;
import com.dripclub.api.model.Subcategoria;

public interface SubcategoriaService {
    List<Subcategoria> obtenerTodos();
    List<Subcategoria> obtenerPorCategoria(Long idCategoria);
    Subcategoria obtenerPorId(Long id);
    Subcategoria guardar(Subcategoria subcategoria);
    void eliminar(Long id);
}
