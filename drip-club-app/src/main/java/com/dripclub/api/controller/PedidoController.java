package com.dripclub.api.controller;

import com.dripclub.api.dto.PedidoDetalleDTO;
import com.dripclub.api.dto.PedidoRequest;
import com.dripclub.api.dto.PedidoResumenDTO;
import com.dripclub.api.model.Pedido;
import com.dripclub.api.service.PedidoService;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/pedidos")
public class PedidoController {

    private final PedidoService service;

    public PedidoController(PedidoService service) { this.service = service; }

    @GetMapping
    public List<PedidoResumenDTO> obtenerTodos() {
        return service.listar();
    }

    @GetMapping("/{id}")
    public ResponseEntity<PedidoDetalleDTO> obtenerPorId(@PathVariable Long id) {
        PedidoDetalleDTO dto = service.obtenerDetalle(id);
        if (dto == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/usuario/{idUsuario}")
    public List<PedidoResumenDTO> porUsuario(@PathVariable Long idUsuario) {
        return service.listarPorUsuario(idUsuario);
    }

    @PostMapping
    public ResponseEntity<Pedido> crear(@RequestBody PedidoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.crearPedido(request));
    }

    @PutMapping("/{id}/estado")
    public Pedido cambiarEstado(@PathVariable Long id, @RequestBody String estado) {
        return service.cambiarEstado(id, estado.replace("\"", "").trim().toUpperCase());
    }
}
