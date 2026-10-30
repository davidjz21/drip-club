package com.dripclub.api.service.impl;

import java.util.List;
import org.springframework.stereotype.Service;
import com.dripclub.api.model.Usuario;
import com.dripclub.api.repository.UsuarioRepo;
import com.dripclub.api.service.UsuarioService;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UsuarioServiceImpl implements UsuarioService {

    private final UsuarioRepo usuarioRepo;

    @Override
    public List<Usuario> obtenerTodos() {
        return usuarioRepo.findAll();
    }

    @Override
    public Usuario obtenerPorId(Long id) {
        return usuarioRepo.findById(id).orElse(null);
    }

    @Override
    public Usuario obtenerPorCorreo(String correo) {
        return usuarioRepo.findByCorreo(correo).orElse(null);
    }

    @Override
    public Usuario guardar(Usuario usuario) {
        return usuarioRepo.save(usuario);
    }

    @Override
    public void eliminar(Long id) {
        Usuario usuario = usuarioRepo.findById(id).orElse(null);
        if (usuario != null) {
            usuario.setActivo(false); // Eliminación lógica
            usuarioRepo.save(usuario);
        }
    }
}