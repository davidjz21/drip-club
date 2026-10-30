package com.dripclub.api.controller;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.dripclub.api.model.Direccion;
import com.dripclub.api.service.DireccionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/direcciones")
@RequiredArgsConstructor
public class DireccionController {

    private final DireccionService direccionService;

    @GetMapping
    public List<Direccion> listar() {
        return direccionService.obtenerTodos();
    }

    @GetMapping("/usuario/{idUsuario}")
    public List<Direccion> listarPorUsuario(@PathVariable Long idUsuario) {
        return direccionService.obtenerPorUsuario(idUsuario);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Direccion> buscarPorId(@PathVariable Long id) {
        Direccion direccion = direccionService.obtenerPorId(id);
        if (direccion == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(direccion);
    }

    @PostMapping
    public ResponseEntity<Direccion> crear(@Valid @RequestBody Direccion direccion) {
        direccion.setIdDireccion(null);
        Direccion nueva = direccionService.guardar(direccion);
        return ResponseEntity.status(HttpStatus.CREATED).body(nueva);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Direccion> actualizar(@PathVariable Long id, @Valid @RequestBody Direccion direccion) {
        Direccion existente = direccionService.obtenerPorId(id);
        if (existente == null) {
            return ResponseEntity.notFound().build();
        }
        direccion.setIdDireccion(id);
        Direccion actualizada = direccionService.guardar(direccion);
        return ResponseEntity.ok(actualizada);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        Direccion existente = direccionService.obtenerPorId(id);
        if (existente == null) {
            return ResponseEntity.notFound().build();
        }
        direccionService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}