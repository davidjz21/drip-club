package com.dripclub.api.controller;

import com.dripclub.api.dto.PedidoDetalleDTO;
import com.dripclub.api.dto.PedidoRequest;
import com.dripclub.api.dto.PedidoResumenDTO;
import com.dripclub.api.model.Pedido;
import com.dripclub.api.security.UsuarioPrincipal;
import com.dripclub.api.service.PedidoService;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

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
    public ResponseEntity<?> porUsuario(@PathVariable Long idUsuario, Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof UsuarioPrincipal principal) {
            String rol = principal.getRol() != null ? principal.getRol().toUpperCase() : "CLIENTE";
            if ("CLIENTE".equals(rol) && !principal.getIdUsuario().equals(idUsuario)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("mensaje", "No tienes permiso"));
            }
        }
        return ResponseEntity.ok(service.listarPorUsuario(idUsuario));
    }

    @PostMapping
    public ResponseEntity<?> crear(@RequestBody PedidoRequest request, Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof UsuarioPrincipal principal)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("mensaje", "No tienes permiso"));
        }

        if (request == null || request.usuarioId() == null || !request.usuarioId().equals(principal.getIdUsuario())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("mensaje", "No tienes permiso"));
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(service.crearPedido(request));
    }

    @PutMapping("/{id}/estado")
    public Pedido cambiarEstado(@PathVariable Long id, @RequestBody String estado) {
        return service.cambiarEstado(id, estado.replace("\"", "").trim().toUpperCase());
    }
}
