package com.dripclub.api.service.impl;

import java.util.List;
import java.util.Set;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
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
            usuario.setActivo(false); // Eliminacion logica
            usuarioRepo.save(usuario);
        }
    }

    @Override
    public Usuario cambiarRol(Long id, String rol) {
        String rolLimpio = rol == null ? "" : rol.trim().toUpperCase();
        if (!Set.of("CLIENTE", "EMPLEADO", "ADMIN").contains(rolLimpio))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Rol invalido");
        Usuario usuario = usuarioRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
        usuario.setRol(rolLimpio);
        return usuarioRepo.save(usuario);
    }

    @Override
    public Usuario cambiarActivo(Long id, boolean activo) {
        Usuario usuario = usuarioRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
        usuario.setActivo(activo);
        return usuarioRepo.save(usuario);
    }
}
