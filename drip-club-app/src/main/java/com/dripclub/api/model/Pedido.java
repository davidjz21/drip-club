package com.dripclub.api.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "pedido")
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_pedido")
    private Long idPedido;

    @Column(name = "fecha", nullable = false)
    private LocalDateTime fecha;

    @Column(name = "total", nullable = false, precision = 10, scale = 2)
    private BigDecimal total;

    @Column(name = "estado", nullable = false, length = 20)
    private String estado = "PENDIENTE";

    @Column(name = "metodo_pago", nullable = false, length = 20)
    private String metodoPago;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    // datos_cliente (compuesto aplanado)
    @Column(name = "cliente_nombres", nullable = false, length = 100)
    private String clienteNombres;

    @Column(name = "cliente_apellidos", nullable = false, length = 100)
    private String clienteApellidos;

    @Column(name = "cliente_correo", nullable = false, length = 100)
    private String clienteCorreo;

    @Column(name = "cliente_telefono", nullable = false, length = 15)
    private String clienteTelefono;

    @Column(name = "cliente_tipo_documento", nullable = false, length = 10)
    private String clienteTipoDocumento;

    @Column(name = "cliente_numero_documento", nullable = false, length = 20)
    private String clienteNumeroDocumento;

    // datos_entrega (compuesto aplanado)
    @Column(name = "entrega_departamento", nullable = false, length = 50)
    private String entregaDepartamento;

    @Column(name = "entrega_ciudad", nullable = false, length = 80)
    private String entregaCiudad;

    @Column(name = "entrega_direccion", nullable = false, length = 200)
    private String entregaDireccion;

    @Column(name = "entrega_referencia", length = 200)
    private String entregaReferencia;

    @PrePersist
    void antesDeGuardar() {
        if (fecha == null) fecha = LocalDateTime.now();
    }
}
