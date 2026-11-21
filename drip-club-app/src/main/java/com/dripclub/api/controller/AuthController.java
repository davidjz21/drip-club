package com.dripclub.api.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dripclub.api.dto.LoginRequest;
import com.dripclub.api.dto.LoginResponse;
import com.dripclub.api.security.UsuarioPrincipal;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final SecurityContextRepository securityContextRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request,
                                   HttpServletRequest httpRequest,
                                   HttpServletResponse httpResponse) {
        String correo = request.correo() != null ? request.correo().trim().toLowerCase() : "";
        String contrasena = request.contrasena() != null ? request.contrasena() : "";

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(correo, contrasena)
            );

            SecurityContext context = SecurityContextHolder.createEmptyContext();
            context.setAuthentication(authentication);
            SecurityContextHolder.setContext(context);
            securityContextRepository.saveContext(context, httpRequest, httpResponse);

            UsuarioPrincipal principal = (UsuarioPrincipal) authentication.getPrincipal();
            String rol = principal.getRol() != null ? principal.getRol().toUpperCase() : "CLIENTE";

            String redirectUrl = ("ADMIN".equals(rol) || "EMPLEADO".equals(rol))
                    ? "/admin/index.html"
                    : "assets/pages/cuenta.html";

            LoginResponse response = new LoginResponse(
                    principal.getIdUsuario(),
                    principal.getNombre(),
                    principal.getCorreo(),
                    rol,
                    redirectUrl
            );

            return ResponseEntity.ok(response);
        } catch (BadCredentialsException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("mensaje", "Correo o contraseña incorrectos"));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("mensaje", "Correo o contraseña incorrectos"));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof UsuarioPrincipal principal)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("mensaje", "No autenticado"));
        }

        String rol = principal.getRol() != null ? principal.getRol().toUpperCase() : "CLIENTE";
        String redirectUrl = ("ADMIN".equals(rol) || "EMPLEADO".equals(rol))
                ? "/admin/index.html"
                : "assets/pages/cuenta.html";

        LoginResponse response = new LoginResponse(
                principal.getIdUsuario(),
                principal.getNombre(),
                principal.getCorreo(),
                rol,
                redirectUrl
        );

        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        SecurityContextHolder.clearContext();
        return ResponseEntity.noContent().build();
    }
}
