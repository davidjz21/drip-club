package com.dripclub.api.repository;

import com.dripclub.api.model.Subcategoria;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SubcategoriaRepo extends JpaRepository<Subcategoria, Long> {
    List<Subcategoria> findByCategoria_IdCategoria(Long idCategoria);
}
