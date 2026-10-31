package com.dripclub.api.dto;

public record LoginResponse(
    Long idUsuario,
    String nombre,
    String correo,
    String rol,
    String redirectUrl
) {}