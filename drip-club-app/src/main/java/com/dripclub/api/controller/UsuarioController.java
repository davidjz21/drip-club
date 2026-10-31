package com.dripclub.api.controller;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.dripclub.api.model.Usuario;
import com.dripclub.api.service.UsuarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;

    @GetMapping
    public List<Usuario> listar() {
        return usuarioService.obtenerTodos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Usuario> buscarPorId(@PathVariable Long id) {
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
        Usuario nuevo = usuarioService.guardar(usuario);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevo);
    }

    /** Actualiza datos personales. No acepta rol ni activo (los ignora). */
    @PutMapping("/{id}")
    public ResponseEntity<Usuario> actualizar(@PathVariable Long id, @RequestBody Usuario datos) {
        Usuario existente = usuarioService.obtenerPorId(id);
        if (existente == null) {
            return ResponseEntity.notFound().build();
        }
        existente.setNombre(datos.getNombre());
        existente.setCorreo(datos.getCorreo());
        existente.setTelefono(datos.getTelefono());

        // Si envia contrasena vacia conserva la actual
        if (datos.getContrasena() != null && !datos.getContrasena().isBlank()) {
            existente.setContrasena(datos.getContrasena());
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

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody java.util.Map<String, String> credenciales) {
        String correo = credenciales.get("correo");
        String contrasena = credenciales.get("contrasena");

        if (correo == null || contrasena == null) {
            return ResponseEntity.badRequest().body(java.util.Map.of("mensaje", "Correo y contrasena requeridos"));
        }

        Usuario usuario = usuarioService.obtenerPorCorreo(correo.trim().toLowerCase());
        if (usuario == null || !usuario.isActivo() || !usuario.getContrasena().equals(contrasena)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(java.util.Map.of("mensaje", "Correo o contrasena incorrectos"));
        }
        return ResponseEntity.ok(usuario);
    }
}
