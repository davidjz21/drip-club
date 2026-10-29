package com.dripclub.api.repository;

import com.dripclub.api.model.Producto;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductoRepo extends JpaRepository<Producto, Long> {
}
