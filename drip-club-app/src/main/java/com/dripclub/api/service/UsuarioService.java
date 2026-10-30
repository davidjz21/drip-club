package com.dripclub.api.service;

import java.util.List;
import com.dripclub.api.model.Usuario;

public interface UsuarioService {
    List<Usuario> obtenerTodos();
    Usuario obtenerPorId(Long id);
    Usuario obtenerPorCorreo(String correo);
    Usuario guardar(Usuario usuario);
    void eliminar(Long id);
}
