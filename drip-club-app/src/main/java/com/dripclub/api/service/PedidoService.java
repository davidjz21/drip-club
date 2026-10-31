package com.dripclub.api.service;

import java.util.List;
import com.dripclub.api.model.Pedido;
import com.dripclub.api.dto.PedidoRequest;
import com.dripclub.api.dto.PedidoResumenDTO;
import com.dripclub.api.dto.PedidoDetalleDTO;

public interface PedidoService {
    List<Pedido> obtenerTodos();
    Pedido obtenerPorId(Long id);
    Pedido cambiarEstado(Long id, String estado);
    Pedido crearPedido(PedidoRequest request);

    List<PedidoResumenDTO> listar();
    PedidoDetalleDTO obtenerDetalle(Long id);
    List<PedidoResumenDTO> listarPorUsuario(Long idUsuario);
}
