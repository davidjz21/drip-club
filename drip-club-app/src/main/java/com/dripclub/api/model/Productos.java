package com.dripclub.api.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name = "productos")
public class Productos {
    private Long id;
    private String nombre;
    private String descripcion;
    private Double precio;
    private Double precio_oferta;
    private Long stock;

}