package com.dripclub.api.controller;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.dripclub.api.model.Subcategoria;
import com.dripclub.api.service.SubcategoriaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/subcategorias")
@RequiredArgsConstructor
public class SubcategoriaController {

    private final SubcategoriaService subcategoriaService;

    @GetMapping
    public List<Subcategoria> listar() {
        return subcategoriaService.obtenerTodos();
    }

    @GetMapping("/categoria/{idCategoria}")
    public List<Subcategoria> listarPorCategoria(@PathVariable Long idCategoria) {
        return subcategoriaService.obtenerPorCategoria(idCategoria);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Subcategoria> buscarPorId(@PathVariable Long id) {
        Subcategoria subcategoria = subcategoriaService.obtenerPorId(id);
        if (subcategoria == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(subcategoria);
    }

    @PostMapping
    public ResponseEntity<Subcategoria> crear(@Valid @RequestBody Subcategoria subcategoria) {
        subcategoria.setIdSubcategoria(null);
        Subcategoria nueva = subcategoriaService.guardar(subcategoria);
        return ResponseEntity.status(HttpStatus.CREATED).body(nueva);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Subcategoria> actualizar(@PathVariable Long id,
            @Valid @RequestBody Subcategoria subcategoria) {
        Subcategoria existente = subcategoriaService.obtenerPorId(id);
        if (existente == null) {
            return ResponseEntity.notFound().build();
        }
        subcategoria.setIdSubcategoria(id);
        Subcategoria actualizada = subcategoriaService.guardar(subcategoria);
        return ResponseEntity.ok(actualizada);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        Subcategoria existente = subcategoriaService.obtenerPorId(id);
        if (existente == null) {
            return ResponseEntity.notFound().build();
        }
        subcategoriaService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}