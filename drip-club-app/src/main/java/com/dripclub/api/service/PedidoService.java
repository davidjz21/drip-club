package com.dripclub.api.service;
import java.util.List;
import com.dripclub.api.model.Pedido;
import com.dripclub.api.dto.PedidoRequest;
public interface PedidoService {
 List<Pedido> obtenerTodos();
 Pedido obtenerPorId(Long id);
 Pedido cambiarEstado(Long id, String estado);
 Pedido crearPedido(PedidoRequest request);
}
