package com.dripclub.api.dto;

import java.math.BigDecimal;

public record DetallePedidoDTO(
    Long idDetalle,
    Long idProducto,
    String producto,
    Integer cantidad,
    BigDecimal precioUnitario,
    BigDecimal subtotal
) {}