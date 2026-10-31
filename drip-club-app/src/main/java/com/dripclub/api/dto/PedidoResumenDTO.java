package com.dripclub.api.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PedidoResumenDTO(
    Long idPedido,
    LocalDateTime fecha,
    BigDecimal total,
    String estado,
    String metodoPago,
    Long idUsuario,
    String cliente,
    String clienteCorreo
) {}