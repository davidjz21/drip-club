package com.dripclub.api.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record PedidoDetalleDTO(
    Long idPedido,
    LocalDateTime fecha,
    BigDecimal total,
    String estado,
    String metodoPago,
    Long idUsuario,
    String cliente,
    String clienteCorreo,
    String clienteTelefono,
    String clienteDocumento,
    String entregaDepartamento,
    String entregaCiudad,
    String entregaDireccion,
    String entregaReferencia,
    List<DetallePedidoDTO> items
) {}