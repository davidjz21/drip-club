package com.dripclub.api.service;

import java.util.List;
import com.dripclub.api.model.Producto;

public interface ProductoService {
    List<Producto> obtenerTodos();
    Producto obtenerPorId(Long id);
    Producto guardar(Producto producto);
    void eliminar(Long id);
}
