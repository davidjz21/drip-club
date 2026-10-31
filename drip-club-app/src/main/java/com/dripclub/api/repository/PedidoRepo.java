package com.dripclub.api.repository;

import com.dripclub.api.model.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PedidoRepo extends JpaRepository<Pedido, Long> {
    List<Pedido> findAllByOrderByFechaDesc();
    List<Pedido> findByUsuarioIdUsuarioOrderByFechaDesc(Long idUsuario);
}
