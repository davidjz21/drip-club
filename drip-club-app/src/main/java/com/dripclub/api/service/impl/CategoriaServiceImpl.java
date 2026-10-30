package com.dripclub.api.service.impl;

import java.util.List;
import org.springframework.stereotype.Service;
import com.dripclub.api.model.Categoria;
import com.dripclub.api.repository.CategoriaRepo;
import com.dripclub.api.service.CategoriaService;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CategoriaServiceImpl implements CategoriaService {

    private final CategoriaRepo categoriaRepo;

    @Override
    public List<Categoria> obtenerTodos() {
        return categoriaRepo.findAll();
    }

    @Override
    public Categoria obtenerPorId(Long id) {
        return categoriaRepo.findById(id).orElse(null);
    }

    @Override
    public Categoria guardar(Categoria categoria) {
        return categoriaRepo.save(categoria);
    }

    @Override
    public void eliminar(Long id) {
        Categoria categoria = categoriaRepo.findById(id).orElse(null);
        if (categoria != null) {
            categoria.setActivo(false); // Eliminación lógica
            categoriaRepo.save(categoria);
        }
    }
}