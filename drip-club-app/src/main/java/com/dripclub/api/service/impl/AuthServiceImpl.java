package com.dripclub.api.service.impl;

import org.springframework.stereotype.Service;

import com.dripclub.api.dto.LoginRequest;
import com.dripclub.api.dto.LoginResponse;
import com.dripclub.api.exception.AccesoDenegadoException;
import com.dripclub.api.exception.CredencialesInvalidasException;
import com.dripclub.api.model.Usuario;
import com.dripclub.api.service.AuthService;
import com.dripclub.api.service.UsuarioService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private static final String ROL_ADMIN = "ADMIN";
    private static final String URL_PANEL_ADMIN = "/admin/index.html";

    private final UsuarioService usuarioService;

    @Override
    public LoginResponse autenticarAdmin(LoginRequest request) {
        Usuario usuario = usuarioService.obtenerPorCorreo(request.correo().trim().toLowerCase());

        if (usuario == null || !usuario.isActivo() || !usuario.getContrasena().equals(request.contrasena())) {
            throw new CredencialesInvalidasException("Correo o contraseña incorrectos");
        }
        if (!ROL_ADMIN.equalsIgnoreCase(usuario.getRol())) {
            throw new AccesoDenegadoException("Tu cuenta no tiene permisos de administrador");
        }

        return new LoginResponse(
                usuario.getIdUsuario(),
                usuario.getNombre(),
                usuario.getCorreo(),
                usuario.getRol(),
                URL_PANEL_ADMIN);
    }
}
