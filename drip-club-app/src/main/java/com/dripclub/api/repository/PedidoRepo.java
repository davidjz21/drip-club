package com.dripclub.api.repository;

import com.dripclub.api.model.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PedidoRepo extends JpaRepository<Pedido, Long> {
}
