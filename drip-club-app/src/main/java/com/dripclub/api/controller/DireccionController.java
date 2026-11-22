package com.dripclub.api.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.dripclub.api.model.Direccion;
import com.dripclub.api.security.UsuarioPrincipal;
import com.dripclub.api.service.DireccionService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/direcciones")
@RequiredArgsConstructor
public class DireccionController {

    private final DireccionService direccionService;

    @GetMapping
    public ResponseEntity<?> listar(Authentication authentication) {
        if (!esAdmin(authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("mensaje", "No tienes permiso"));
        }
        return ResponseEntity.ok(direccionService.obtenerTodos());
    }

    @GetMapping("/usuario/{idUsuario}")
    public ResponseEntity<?> listarPorUsuario(@PathVariable Long idUsuario, Authentication authentication) {
        if (!esAdmin(authentication) && !esMismoUsuario(idUsuario, authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("mensaje", "No tienes permiso"));
        }
        return ResponseEntity.ok(direccionService.obtenerPorUsuario(idUsuario));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> buscarPorId(@PathVariable Long id, Authentication authentication) {
        Direccion direccion = direccionService.obtenerPorId(id);
        if (direccion == null) {
            return ResponseEntity.notFound().build();
        }
        if (!esAdmin(authentication) && !perteneceAUsuario(direccion, authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("mensaje", "No tienes permiso"));
        }
        return ResponseEntity.ok(direccion);
    }

    @PostMapping
    public ResponseEntity<?> crear(@Valid @RequestBody Direccion direccion, Authentication authentication) {
        if (direccion.getUsuario() == null || direccion.getUsuario().getIdUsuario() == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("mensaje", "No tienes permiso"));
        }
        if (!esAdmin(authentication) && !esMismoUsuario(direccion.getUsuario().getIdUsuario(), authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("mensaje", "No tienes permiso"));
        }
        direccion.setIdDireccion(null);
        Direccion nueva = direccionService.guardar(direccion);
        return ResponseEntity.status(HttpStatus.CREATED).body(nueva);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Long id,
                                        @Valid @RequestBody Direccion direccion,
                                        Authentication authentication) {
        Direccion existente = direccionService.obtenerPorId(id);
        if (existente == null) {
            return ResponseEntity.notFound().build();
        }
        if (!esAdmin(authentication) && !perteneceAUsuario(existente, authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("mensaje", "No tienes permiso"));
        }

        direccion.setIdDireccion(id);
        // Garantiza que el dueño nunca cambie, ignorando lo que venga en el cuerpo
        direccion.setUsuario(existente.getUsuario());

        Direccion actualizada = direccionService.guardar(direccion);
        return ResponseEntity.ok(actualizada);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Long id, Authentication authentication) {
        Direccion existente = direccionService.obtenerPorId(id);
        if (existente == null) {
            return ResponseEntity.notFound().build();
        }
        if (!esAdmin(authentication) && !perteneceAUsuario(existente, authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("mensaje", "No tienes permiso"));
        }
        direccionService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    private boolean esAdmin(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof UsuarioPrincipal principal) {
            return "ADMIN".equalsIgnoreCase(principal.getRol());
        }
        return false;
    }

    private boolean esMismoUsuario(Long idUsuario, Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof UsuarioPrincipal principal) {
            return principal.getIdUsuario().equals(idUsuario);
        }
        return false;
    }

    private boolean perteneceAUsuario(Direccion direccion, Authentication authentication) {
        if (direccion.getUsuario() != null && direccion.getUsuario().getIdUsuario() != null) {
            return esMismoUsuario(direccion.getUsuario().getIdUsuario(), authentication);
        }
        return false;
    }
}
