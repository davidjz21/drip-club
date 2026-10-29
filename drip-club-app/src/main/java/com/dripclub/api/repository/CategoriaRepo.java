package com.dripclub.api.repository;

import com.dripclub.api.model.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoriaRepo extends JpaRepository<Categoria, Long> {
}
