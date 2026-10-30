package com.dripclub.api.service.impl;

import java.util.List;
import org.springframework.stereotype.Service;
import com.dripclub.api.model.Subcategoria;
import com.dripclub.api.repository.SubcategoriaRepo;
import com.dripclub.api.service.SubcategoriaService;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SubcategoriaServiceImpl implements SubcategoriaService {

    private final SubcategoriaRepo subcategoriaRepo;

    @Override
    public List<Subcategoria> obtenerTodos() {
        return subcategoriaRepo.findAll();
    }

    @Override
    public List<Subcategoria> obtenerPorCategoria(Long idCategoria) {
        return subcategoriaRepo.findByCategoria_IdCategoria(idCategoria);
    }

    @Override
    public Subcategoria obtenerPorId(Long id) {
        return subcategoriaRepo.findById(id).orElse(null);
    }

    @Override
    public Subcategoria guardar(Subcategoria subcategoria) {
        return subcategoriaRepo.save(subcategoria);
    }

    @Override
    public void eliminar(Long id) {
        Subcategoria subcategoria = subcategoriaRepo.findById(id).orElse(null);
        if (subcategoria != null) {
            subcategoria.setActivo(false);
            subcategoriaRepo.save(subcategoria);
        }
    }
}