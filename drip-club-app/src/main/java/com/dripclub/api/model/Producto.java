package com.dripclub.api.model;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name = "producto")
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_producto")
    private Long idProducto;

    @Column(name = "nombre", nullable = false, length = 100)
    private String nombre;

    @Column(name = "descripcion", length = 500)
    private String descripcion;

    @Column(name = "precio", nullable = false, precision = 10, scale = 2)
    private BigDecimal precio;

    @Column(name = "precio_oferta", precision = 10, scale = 2)
    private BigDecimal precioOferta;

    @Column(name = "imagen", length = 255)
    private String imagen;

    @Column(name = "stock", nullable = false)
    private int stock = 0;

    @Column(name = "activo", nullable = false)
    private boolean activo = true;

    // La categoria se obtiene via subcategoria.categoria
    @ManyToOne(optional = false)
    @JoinColumn(name = "id_subcategoria", nullable = false)
    private Subcategoria subcategoria;
}