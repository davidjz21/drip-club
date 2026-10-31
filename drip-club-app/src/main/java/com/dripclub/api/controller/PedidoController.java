package com.dripclub.api.controller;
import com.dripclub.api.dto.PedidoRequest;
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
 @GetMapping public List<Pedido> obtenerTodos() { return service.obtenerTodos(); }
 @GetMapping("/{id}") public Pedido obtenerPorId(@PathVariable Long id) { return service.obtenerPorId(id); }
 @PostMapping public ResponseEntity<Pedido> crear(@RequestBody PedidoRequest request) {
  return ResponseEntity.status(HttpStatus.CREATED).body(service.crearPedido(request));
 }
 @PutMapping("/{id}/estado") public Pedido cambiarEstado(@PathVariable Long id, @RequestBody String estado) {
  return service.cambiarEstado(id, estado.replace("\"", "").trim().toUpperCase());
 }
}
