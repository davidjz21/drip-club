package com.dripclub.api.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.dripclub.api.model.Usuario;
import com.dripclub.api.security.UsuarioPrincipal;
import com.dripclub.api.service.UsuarioService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;
    private final PasswordEncoder passwordEncoder;

    @GetMapping
    public List<Usuario> listar() {
        return usuarioService.obtenerTodos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> buscarPorId(@PathVariable Long id, Authentication authentication) {
        if (noAutorizadoParaUsuario(id, authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("mensaje", "No tienes permiso"));
        }

        Usuario usuario = usuarioService.obtenerPorId(id);
        if (usuario == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(usuario);
    }

    @PostMapping
    public ResponseEntity<Usuario> crear(@Valid @RequestBody Usuario usuario) {
        usuario.setIdUsuario(null);
        usuario.setRol("CLIENTE");
        usuario.setActivo(true);
        if (usuario.getCorreo() != null) {
            usuario.setCorreo(usuario.getCorreo().trim().toLowerCase());
        }
        if (usuario.getContrasena() != null && !usuario.getContrasena().isBlank()) {
            usuario.setContrasena(passwordEncoder.encode(usuario.getContrasena()));
        }
        Usuario nuevo = usuarioService.guardar(usuario);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevo);
    }

    /** Actualiza datos personales. No acepta rol ni activo (los ignora). */
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Long id,
                                        @RequestBody Usuario datos,
                                        Authentication authentication) {
        if (noAutorizadoParaUsuario(id, authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("mensaje", "No tienes permiso"));
        }

        if (datos.getCorreo() == null || datos.getCorreo().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", "El correo es obligatorio"));
        }

        Usuario existente = usuarioService.obtenerPorId(id);
        if (existente == null) {
            return ResponseEntity.notFound().build();
        }
        existente.setNombre(datos.getNombre());
        existente.setCorreo(datos.getCorreo().trim().toLowerCase());
        existente.setTelefono(datos.getTelefono());

        // Si envía contraseña no vacía, se codifica con BCrypt. Si no, conserva la existente sin rehashear.
        if (datos.getContrasena() != null && !datos.getContrasena().isBlank()) {
            existente.setContrasena(passwordEncoder.encode(datos.getContrasena()));
        }
        Usuario actualizado = usuarioService.guardar(existente);
        return ResponseEntity.ok(actualizado);
    }

    /** Solo para el panel admin: cambia el rol del usuario. */
    @PutMapping("/{id}/rol")
    public ResponseEntity<Usuario> cambiarRol(@PathVariable Long id, @RequestBody String rol) {
        Usuario actualizado = usuarioService.cambiarRol(id, rol.replace("\"", "").trim());
        return ResponseEntity.ok(actualizado);
    }

    /** Solo para el panel admin: activa o desactiva un usuario. */
    @PutMapping("/{id}/activo")
    public ResponseEntity<Usuario> cambiarActivo(@PathVariable Long id, @RequestBody String activo) {
        boolean valor = Boolean.parseBoolean(activo.replace("\"", "").trim());
        Usuario actualizado = usuarioService.cambiarActivo(id, valor);
        return ResponseEntity.ok(actualizado);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        Usuario existente = usuarioService.obtenerPorId(id);
        if (existente == null) {
            return ResponseEntity.notFound().build();
        }
        usuarioService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    private boolean noAutorizadoParaUsuario(Long targetId, Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof UsuarioPrincipal principal) {
            String rol = principal.getRol() != null ? principal.getRol().toUpperCase() : "CLIENTE";
            if ("ADMIN".equals(rol)) {
                return false;
            }
            return !principal.getIdUsuario().equals(targetId);
        }
        return true;
    }
}
