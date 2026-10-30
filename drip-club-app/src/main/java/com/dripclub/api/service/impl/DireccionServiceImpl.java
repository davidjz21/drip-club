package com.dripclub.api.service.impl;

import java.util.List;
import org.springframework.stereotype.Service;
import com.dripclub.api.model.Direccion;
import com.dripclub.api.repository.DireccionRepo;
import com.dripclub.api.service.DireccionService;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DireccionServiceImpl implements DireccionService {

    private final DireccionRepo direccionRepo;

    @Override
    public List<Direccion> obtenerTodos() {
        return direccionRepo.findAll();
    }

    @Override
    public List<Direccion> obtenerPorUsuario(Long idUsuario) {
        return direccionRepo.findByUsuario_IdUsuario(idUsuario);
    }

    @Override
    public Direccion obtenerPorId(Long id) {
        return direccionRepo.findById(id).orElse(null);
    }

    @Override
    public Direccion guardar(Direccion direccion) {
        return direccionRepo.save(direccion);
    }

    @Override
    public void eliminar(Long id) {
        direccionRepo.deleteById(id);
    }
}