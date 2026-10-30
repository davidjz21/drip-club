package com.dripclub.api.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> manejarValidaciones(MethodArgumentNotValidException ex) {
        Map<String, String> errores = new HashMap<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            errores.put(error.getField(), error.getDefaultMessage());
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errores);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, String>> manejarConflictoIntegridad(DataIntegrityViolationException ex) {
        Map<String, String> respuesta = new HashMap<>();
        String mensaje = ex.getMessage() != null ? ex.getMessage().toLowerCase() : "";
        if (mensaje.contains("correo")) {
            respuesta.put("correo", "Ese correo ya está registrado");
        } else {
            respuesta.put("mensaje", "Los datos entran en conflicto con registros existentes");
        }
        return ResponseEntity.status(HttpStatus.CONFLICT).body(respuesta);
    }
}
