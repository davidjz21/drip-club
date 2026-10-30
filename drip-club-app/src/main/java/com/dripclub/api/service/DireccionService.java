package com.dripclub.api.service;

import java.util.List;
import com.dripclub.api.model.Direccion;

public interface DireccionService {
    List<Direccion> obtenerTodos();
    List<Direccion> obtenerPorUsuario(Long idUsuario);
    Direccion obtenerPorId(Long id);
    Direccion guardar(Direccion direccion);
    void eliminar(Long id);
}
