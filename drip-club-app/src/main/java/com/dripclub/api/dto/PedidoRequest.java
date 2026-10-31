package com.dripclub.api.dto;
import java.util.List;
public record PedidoRequest(Long usuarioId, Long direccionId, String metodoPago,
 String clienteNombres, String clienteApellidos, String clienteCorreo,
 String clienteTelefono, String clienteTipoDocumento, String clienteNumeroDocumento,
 String entregaDepartamento, String entregaCiudad, String entregaDireccion,
 String entregaReferencia, List<DetallePedidoRequest> detalles) {}
