package com.dripclub.api.service.impl;

import com.dripclub.api.dto.DetallePedidoDTO;
import com.dripclub.api.dto.DetallePedidoRequest;
import com.dripclub.api.dto.PedidoDetalleDTO;
import com.dripclub.api.dto.PedidoRequest;
import com.dripclub.api.dto.PedidoResumenDTO;
import com.dripclub.api.model.*;
import com.dripclub.api.repository.*;
import com.dripclub.api.service.PedidoService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class PedidoServiceImpl implements PedidoService {
	private final PedidoRepo pedidos;
	private final DetallePedidoRepo detalles;
	private final ProductoRepo productos;
	private final UsuarioRepo usuarios;
	private final DireccionRepo direcciones;

	public PedidoServiceImpl(PedidoRepo pedidos, DetallePedidoRepo detalles,
			ProductoRepo productos, UsuarioRepo usuarios, DireccionRepo direcciones) {
		this.pedidos = pedidos; this.detalles = detalles; this.productos = productos;
		this.usuarios = usuarios; this.direcciones = direcciones;
	}

	@Override @Transactional(readOnly = true)
	public List<Pedido> obtenerTodos() { return pedidos.findAll(); }

	@Override @Transactional(readOnly = true)
	public Pedido obtenerPorId(Long id) { return pedidos.findById(id)
			.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pedido no encontrado")); }

	

	@Override @Transactional(readOnly = true)
	public List<PedidoResumenDTO> listar() {
		return pedidos.findAllByOrderByFechaDesc().stream()
				.map(this::toResumen)
				.collect(Collectors.toList());
	}

	@Override @Transactional(readOnly = true)
	public PedidoDetalleDTO obtenerDetalle(Long id) {
		Optional<Pedido> opt = pedidos.findById(id);
		if (opt.isEmpty()) return null;
		Pedido p = opt.get();
		List<DetallePedidoDTO> items = detalles.findByPedidoIdPedido(id).stream()
				.map(d -> new DetallePedidoDTO(
						d.getIdDetalle(),
						d.getProducto().getIdProducto(),
						d.getProducto().getNombre(),
						d.getCantidad(),
						d.getPrecioUnitario(),
						d.getPrecioUnitario().multiply(BigDecimal.valueOf(d.getCantidad()))
				))
				.collect(Collectors.toList());
		return new PedidoDetalleDTO(
				p.getIdPedido(),
				p.getFecha(),
				p.getTotal(),
				p.getEstado(),
				p.getMetodoPago(),
				p.getUsuario() != null ? p.getUsuario().getIdUsuario() : null,
				p.getClienteNombres() + " " + p.getClienteApellidos(),
				p.getClienteCorreo(),
				p.getClienteTelefono(),
				p.getClienteTipoDocumento() + ": " + p.getClienteNumeroDocumento(),
				p.getEntregaDepartamento(),
				p.getEntregaCiudad(),
				p.getEntregaDireccion(),
				p.getEntregaReferencia(),
				items
		);
	}

	@Override @Transactional(readOnly = true)
	public List<PedidoResumenDTO> listarPorUsuario(Long idUsuario) {
		return pedidos.findByUsuarioIdUsuarioOrderByFechaDesc(idUsuario).stream()
				.map(this::toResumen)
				.collect(Collectors.toList());
	}

	private PedidoResumenDTO toResumen(Pedido p) {
		return new PedidoResumenDTO(
				p.getIdPedido(),
				p.getFecha(),
				p.getTotal(),
				p.getEstado(),
				p.getMetodoPago(),
				p.getUsuario() != null ? p.getUsuario().getIdUsuario() : null,
				p.getClienteNombres() + " " + p.getClienteApellidos(),
				p.getClienteCorreo()
		);
	}

	// ── Metodos existentes (sin cambios) ────────────────────────────────────

	@Override @Transactional
	public Pedido cambiarEstado(Long id, String estado) {
		Pedido pedido = obtenerPorId(id);
		if (estado == null || !Set.of("PENDIENTE", "PAGADO", "ENVIADO", "ENTREGADO", "CANCELADO").contains(estado))
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Estado no permitido");
		if ("CANCELADO".equals(pedido.getEstado()) || "ENTREGADO".equals(pedido.getEstado()))
			throw new ResponseStatusException(HttpStatus.CONFLICT, "El pedido ya esta cerrado");
		// Cancelar requiere politica de devolucion de inventario; no se habilita aqui.
		if ("CANCELADO".equals(estado))
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cancelacion pendiente de implementar devolucion de stock");
		pedido.setEstado(estado);
		return pedidos.save(pedido);
	}

	private static void requerido(String valor, String campo, int max) {
		if (valor == null || valor.isBlank() || valor.length() > max)
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Campo invalido: " + campo);
	}

	@Override @Transactional
	public Pedido crearPedido(PedidoRequest r) {
		if (r == null || r.usuarioId() == null || r.detalles() == null || r.detalles().isEmpty())
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Usuario y productos son obligatorios");
		requerido(r.metodoPago(), "metodoPago", 20);
		if (!Set.of("tarjeta", "yape", "transferencia", "contraentrega").contains(r.metodoPago()))
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Metodo de pago invalido");
		requerido(r.clienteNombres(), "clienteNombres", 100);
		requerido(r.clienteApellidos(), "clienteApellidos", 100);
		requerido(r.clienteCorreo(), "clienteCorreo", 100);
		requerido(r.clienteTelefono(), "clienteTelefono", 15);
		requerido(r.clienteTipoDocumento(), "clienteTipoDocumento", 10);
		requerido(r.clienteNumeroDocumento(), "clienteNumeroDocumento", 20);
		requerido(r.entregaDepartamento(), "entregaDepartamento", 50);
		requerido(r.entregaCiudad(), "entregaCiudad", 80);
		requerido(r.entregaDireccion(), "entregaDireccion", 200);
		if (r.entregaReferencia() != null && r.entregaReferencia().length() > 200)
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Referencia demasiado larga");

		Usuario usuario = usuarios.findById(r.usuarioId()).orElseThrow(() ->
				new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
		if (!usuario.isActivo()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Usuario inactivo");
		if (r.direccionId() != null) {
			Direccion direccion = direcciones.findById(r.direccionId()).orElseThrow(() ->
					new ResponseStatusException(HttpStatus.NOT_FOUND, "Direccion no encontrada"));
			if (!direccion.getUsuario().getIdUsuario().equals(usuario.getIdUsuario()))
				throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La direccion no pertenece al usuario");
		}

		// Agrupar duplicados y bloquear productos en orden fijo para reducir deadlocks.
		Map<Long, Integer> cantidades = new TreeMap<>();
		for (DetallePedidoRequest d : r.detalles()) {
			if (d == null || d.productoId() == null || d.cantidad() == null || d.cantidad() <= 0)
				throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Producto o cantidad invalidos");
			int acumulada;
			try {
				int anterior = cantidades.getOrDefault(d.productoId(), 0);
				acumulada = Math.addExact(anterior, d.cantidad().intValue());
			} catch (ArithmeticException e) {
				throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cantidad excesiva");
			}
			cantidades.put(d.productoId(), acumulada);
		}
		record Linea(Producto producto, int cantidad, BigDecimal precio) {}
		List<Linea> lineas = new ArrayList<>();
		BigDecimal total = BigDecimal.ZERO;
		for (var entry : cantidades.entrySet()) {
			Producto p = productos.buscarParaCompra(entry.getKey()).orElseThrow(() ->
					new ResponseStatusException(HttpStatus.NOT_FOUND, "Producto no encontrado: " + entry.getKey()));
			if (!p.isActivo() || p.getStock() < entry.getValue())
				throw new ResponseStatusException(HttpStatus.CONFLICT, "Sin stock suficiente: " + p.getNombre());
			BigDecimal precio = p.getPrecioOferta() != null ? p.getPrecioOferta() : p.getPrecio();
			if (precio == null || precio.signum() <= 0)
				throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Precio invalido");
			total = total.add(precio.multiply(BigDecimal.valueOf(entry.getValue())));
			p.setStock(p.getStock() - entry.getValue());
			lineas.add(new Linea(p, entry.getValue(), precio));
		}
		if (total.precision() - total.scale() > 8)
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Total excede el maximo permitido");
		Pedido pedido = new Pedido();
		pedido.setUsuario(usuario); pedido.setTotal(total); pedido.setEstado("PENDIENTE");
		pedido.setMetodoPago(r.metodoPago());
		pedido.setClienteNombres(r.clienteNombres()); pedido.setClienteApellidos(r.clienteApellidos());
		pedido.setClienteCorreo(r.clienteCorreo()); pedido.setClienteTelefono(r.clienteTelefono());
		pedido.setClienteTipoDocumento(r.clienteTipoDocumento()); pedido.setClienteNumeroDocumento(r.clienteNumeroDocumento());
		pedido.setEntregaDepartamento(r.entregaDepartamento()); pedido.setEntregaCiudad(r.entregaCiudad());
		pedido.setEntregaDireccion(r.entregaDireccion()); pedido.setEntregaReferencia(r.entregaReferencia());
		pedido = pedidos.save(pedido);
		for (Linea linea : lineas) {
			DetallePedido d = new DetallePedido();
			d.setPedido(pedido); d.setProducto(linea.producto());
			d.setCantidad(linea.cantidad()); d.setPrecioUnitario(linea.precio());
			detalles.save(d);
		}
		// Cambios de stock se guardan en la misma transaccion.
		return pedido;
	}
}
