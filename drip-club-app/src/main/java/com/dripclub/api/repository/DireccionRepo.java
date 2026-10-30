package com.dripclub.api.repository;

import com.dripclub.api.model.Direccion;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DireccionRepo extends JpaRepository<Direccion, Long> {
    List<Direccion> findByUsuario_IdUsuario(Long idUsuario);
}
