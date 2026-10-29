package com.dripclub.api.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "direccion")
public class Direccion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_direccion")
    private Long idDireccion;

    @Column(name = "direccion", nullable = false, length = 200)
    private String direccion;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;
}
