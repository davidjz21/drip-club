package com.dripclub.api.service.impl;

import java.util.List;
import org.springframework.stereotype.Service;
import com.dripclub.api.model.Producto;
import com.dripclub.api.repository.ProductoRepo;
import com.dripclub.api.service.ProductoService;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProductoServiceImpl implements ProductoService {

    private final ProductoRepo productoRepo;

    @Override
    public List<Producto> obtenerTodos() {
        return productoRepo.findAll();
    }

    @Override
    public Producto obtenerPorId(Long id) {
        return productoRepo.findById(id).orElse(null);
    }

    @Override
    public Producto guardar(Producto producto) {
        return productoRepo.save(producto);
    }

    @Override
    public void eliminar(Long id) {
        Producto producto = productoRepo.findById(id).orElse(null);
        if (producto != null) {
            producto.setActivo(false);
            productoRepo.save(producto);
        }
    }
}
