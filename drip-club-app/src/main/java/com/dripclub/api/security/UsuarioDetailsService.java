package com.dripclub.api.security;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.dripclub.api.model.Usuario;
import com.dripclub.api.service.UsuarioService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UsuarioDetailsService implements UserDetailsService {

    private final UsuarioService usuarioService;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        if (username == null) {
            throw new UsernameNotFoundException("Correo no proporcionado");
        }
        String correoLimpio = username.trim().toLowerCase();
        Usuario usuario = usuarioService.obtenerPorCorreo(correoLimpio);
        if (usuario == null) {
            throw new UsernameNotFoundException("Usuario no encontrado con correo: " + correoLimpio);
        }

        return new UsuarioPrincipal(
                usuario.getIdUsuario(),
                usuario.getNombre(),
                usuario.getCorreo(),
                usuario.getContrasena(),
                usuario.getRol(),
                usuario.isActivo()
        );
    }
}
