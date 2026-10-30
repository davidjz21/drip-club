package com.dripclub.api.service;

import java.util.List;
import com.dripclub.api.model.Categoria;

public interface CategoriaService {
    List<Categoria> obtenerTodos();
    Categoria obtenerPorId(Long id);
    Categoria guardar(Categoria categoria);
    void eliminar(Long id);
}