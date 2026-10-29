package com.dripclub.api.repository;

import com.dripclub.api.model.Direccion;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DireccionRepo extends JpaRepository<Direccion, Long> {
}
