package com.example.demo.modulos.ventas.service;

import com.example.demo.exception.BusinessException;
import com.example.demo.exception.NotFoundException;
import com.example.demo.modulos.gestionAgencias.dto.AgenciaDTO;
import com.example.demo.modulos.tarifas.dto.TarifaDTO;
import com.example.demo.modulos.gestionAgencias.entity.Agencia;
import com.example.demo.modulos.cotizaciones.entity.Cotizacion;
import com.example.demo.modulos.paquetes.entity.Paquete;
import com.example.demo.modulos.tarifas.entity.Tarifa;
import com.example.demo.modulos.gestionAgencias.repository.AgenciaRepository;
import com.example.demo.modulos.cotizaciones.repository.CotizacionRepository;
import com.example.demo.modulos.paquetes.repository.PaqueteRepository;
import com.example.demo.modulos.tarifas.repository.TarifaRepository;
import com.example.demo.modulos.gestionUsuariosRolesPermisos.entity.Usuario;
import com.example.demo.modulos.gestionUsuariosRolesPermisos.repository.UsuarioRepository;
import com.example.demo.modulos.ventas.dto.CambioEstadoVentaRequest;
import com.example.demo.modulos.ventas.dto.CotizacionVentaRefDTO;
import com.example.demo.modulos.ventas.dto.KpiVentasDTO;
import com.example.demo.modulos.ventas.dto.PaqueteDTO;
import com.example.demo.modulos.ventas.dto.VentaDTO;
import com.example.demo.modulos.ventas.dto.VentaHistorialDTO;
import com.example.demo.modulos.ventas.dto.VentaListaDTO;
import com.example.demo.modulos.ventas.dto.VentaRequest;
import com.example.demo.modulos.ventas.entity.Venta;
import com.example.demo.modulos.ventas.entity.VentaHistorialEstado;
import com.example.demo.modulos.ventas.repository.VentaRepository;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Service
public class VentaService {

	private static final Set<String> ESTADOS_VALIDOS = Set.of(
			"PENDIENTE_PAGO", "CONFIRMADA", "PAGADA", "CULMINADA", "ANULADA");

	private final VentaRepository ventaRepository;
	private final CotizacionRepository cotizacionRepository;
	private final AgenciaRepository agenciaRepository;
	private final TarifaRepository tarifaRepository;
	private final PaqueteRepository paqueteRepository;
	private final UsuarioRepository usuarioRepository;

	public VentaService(VentaRepository ventaRepository,
			CotizacionRepository cotizacionRepository,
			AgenciaRepository agenciaRepository,
			TarifaRepository tarifaRepository,
			PaqueteRepository paqueteRepository,
			UsuarioRepository usuarioRepository) {
		this.ventaRepository = ventaRepository;
		this.cotizacionRepository = cotizacionRepository;
		this.agenciaRepository = agenciaRepository;
		this.tarifaRepository = tarifaRepository;
		this.paqueteRepository = paqueteRepository;
		this.usuarioRepository = usuarioRepository;
	}

	@Transactional(readOnly = true)
	public Page<VentaListaDTO> listar(String q, String estado, Long agenciaId,
			LocalDateTime desde, LocalDateTime hasta, int page, int size) {
		Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "fechaVenta"));

		String patron = (q == null || q.isBlank()) ? null : "%" + q.toLowerCase() + "%";
		Specification<Venta> spec = (root, query, cb) -> {
			List<Predicate> predicados = new ArrayList<>();

			if (estado != null && !estado.isBlank()) {
				predicados.add(cb.equal(root.get("estado"), estado));
			}
			if (agenciaId != null) {
				predicados.add(cb.equal(root.get("agencia").get("id"), agenciaId));
			}
			if (desde != null) {
				predicados.add(cb.greaterThanOrEqualTo(root.get("fechaVenta"), desde));
			}
			if (hasta != null) {
				predicados.add(cb.lessThanOrEqualTo(root.get("fechaVenta"), hasta));
			}
			if (patron != null) {
				Join<Venta, Agencia> agencia = root.join("agencia", JoinType.LEFT);
				predicados.add(cb.or(
						cb.like(cb.lower(root.get("numero")), patron),
						cb.like(cb.lower(cb.coalesce(agencia.get("nombreComercial"),
								agencia.get("razonSocial"))), patron),
						existeProductoQueCoincide(cb, root, query, patron),
						existeCotizacionQueCoincide(cb, root, query, patron)));
			}

			return cb.and(predicados.toArray(new Predicate[0]));
		};

		Page<Venta> resultado = ventaRepository.findAll(spec, pageable);
		List<VentaListaDTO> contenido = resultado.getContent().stream()
				.map(this::toListaDTO)
				.toList();

		return new PageImpl<>(contenido, pageable, resultado.getTotalElements());
	}

	@Transactional(readOnly = true)
	public KpiVentasDTO kpis() {
		return new KpiVentasDTO(
				ventaRepository.countVentasMes(),
				ventaRepository.montoVendidoMes(),
				ventaRepository.countPagosPendientes());
	}

	@Transactional(readOnly = true)
	public VentaDTO detalle(Long id) {
		return toDTO(obtenerConRelaciones(id));
	}

	@Transactional
	public VentaDTO crear(VentaRequest request) {
		validarRequest(request);

		Venta venta = new Venta();
		venta.setNumero(siguienteNumero());
		aplicarRequest(venta, request, true);
		venta.setFechaVenta(request.fechaVenta() != null ? request.fechaVenta() : LocalDateTime.now());
		venta.setFechaCreacion(LocalDateTime.now());
		venta.setUsuarioRegistro(usuarioActual());
		venta.setEstado(estadoNormalizado(request.estado()));

		VentaHistorialEstado inicial = new VentaHistorialEstado();
		inicial.setEstadoAnterior(null);
		inicial.setEstadoNuevo(venta.getEstado());
		inicial.setFechaCambio(LocalDateTime.now());
		inicial.setUsuarioCambio(venta.getUsuarioRegistro());
		venta.addHistorial(inicial);

		return toDTO(ventaRepository.save(venta));
	}

	@Transactional
	public VentaDTO actualizar(Long id, VentaRequest request) {
		validarRequest(request);
		Venta venta = obtenerConRelaciones(id);
		aplicarRequest(venta, request, false);
		return toDTO(venta);
	}

	@Transactional
	public VentaDTO cambiarEstado(Long id, CambioEstadoVentaRequest request) {
		String nuevoEstado = request.estado();
		if (nuevoEstado == null || !ESTADOS_VALIDOS.contains(nuevoEstado)) {
			throw new BusinessException("Estado no valido. Estados permitidos: " + ESTADOS_VALIDOS);
		}

		Venta venta = obtenerConRelaciones(id);
		String estadoAnterior = venta.getEstado();
		if (estadoAnterior.equals(nuevoEstado)) {
			return toDTO(venta);
		}

		venta.setEstado(nuevoEstado);
		if ("CULMINADA".equals(nuevoEstado) && venta.getFechaCulminada() == null) {
			venta.setFechaCulminada(LocalDateTime.now());
		}
		if (!"CULMINADA".equals(nuevoEstado)) {
			venta.setFechaCulminada(null);
		}

		VentaHistorialEstado historial = new VentaHistorialEstado();
		historial.setEstadoAnterior(estadoAnterior);
		historial.setEstadoNuevo(nuevoEstado);
		historial.setFechaCambio(LocalDateTime.now());
		historial.setUsuarioCambio(usuarioActual());
		venta.addHistorial(historial);

		return toDTO(venta);
	}

	@Transactional
	public void eliminar(Long id) {
		Venta venta = ventaRepository.findById(id)
				.orElseThrow(() -> new NotFoundException("Venta no encontrada con id " + id));
		ventaRepository.delete(venta);
	}

	@Transactional(readOnly = true)
	public List<AgenciaDTO> agencias() {
		return agenciaRepository.findByActivoTrueOrderByNombreComercialAsc().stream()
				.map(a -> new AgenciaDTO(a.getId(), a.getRazonSocial(), a.getNombreComercial(),
						nombreAgencia(a), a.getRuc(), a.isActivo()))
				.toList();
	}

	@Transactional(readOnly = true)
	public List<TarifaDTO> tarifasVigentes() {
		return tarifaRepository.findVigentes().stream()
				.map(t -> new TarifaDTO(t.getId(),
						t.getServicio().getNombre(),
						t.getDestino().getNombre(),
						t.getDestino().getId(),
						nombreProveedor(t),
						t.getPrecio(),
						t.getMoneda(),
						t.getFechaDesde(),
						t.getFechaHasta()))
				.toList();
	}

	@Transactional(readOnly = true)
	public List<PaqueteDTO> productos() {
		return paqueteRepository.findActivos().stream()
				.map(p -> new PaqueteDTO(p.getId(), p.getNombre(),
						p.getDestino() != null ? p.getDestino().getNombre() : null))
				.toList();
	}

	@Transactional(readOnly = true)
	public List<CotizacionVentaRefDTO> cotizacionesCerradas() {
		return cotizacionRepository.findCerradas().stream()
				.map(c -> new CotizacionVentaRefDTO(c.getId(), c.getNumero(),
						nombreAgencia(c.getAgencia()),
						estimarMontoCotizacion(c)))
				.toList();
	}

	private Predicate existeProductoQueCoincide(CriteriaBuilder cb, Root<Venta> root,
			CriteriaQuery<?> query, String patron) {
		Subquery<Long> sub = query.subquery(Long.class);
		Root<Paquete> paquete = sub.from(Paquete.class);
		sub.select(cb.literal(1L));
		sub.where(cb.and(
				cb.equal(paquete.get("id"), root.get("producto").get("id")),
				cb.like(cb.lower(paquete.get("nombre")), patron)));
		return cb.exists(sub);
	}

	private Predicate existeCotizacionQueCoincide(CriteriaBuilder cb, Root<Venta> root,
			CriteriaQuery<?> query, String patron) {
		Subquery<Long> sub = query.subquery(Long.class);
		Root<Cotizacion> cotizacion = sub.from(Cotizacion.class);
		sub.select(cb.literal(1L));
		sub.where(cb.and(
				cb.equal(cotizacion.get("id"), root.get("cotizacion").get("id")),
				cb.like(cb.lower(cotizacion.get("numero")), patron)));
		return cb.exists(sub);
	}

	private void validarRequest(VentaRequest request) {
		if (request.agenciaId() == null) {
			throw new BusinessException("Debe seleccionar una agencia");
		}
		if (request.cotizacionId() == null && request.productoId() == null && request.tarifaId() == null) {
			throw new BusinessException("Debe vincular una cotizacion o seleccionar un producto");
		}
		if (request.montoAPagar() != null && request.montoAPagar().signum() < 0) {
			throw new BusinessException("El monto a pagar no puede ser negativo");
		}
		if (request.comision() != null && request.comision().signum() < 0) {
			throw new BusinessException("La comision no puede ser negativa");
		}
		if (request.igv() != null && request.igv().signum() < 0) {
			throw new BusinessException("El IGV no puede ser negativo");
		}
	}

	private void aplicarRequest(Venta venta, VentaRequest request, boolean crear) {
		if (request.cotizacionId() != null) {
			Cotizacion cotizacion = cotizacionRepository.findById(request.cotizacionId())
					.orElseThrow(() -> new NotFoundException("Cotizacion no encontrada con id " + request.cotizacionId()));
			venta.setCotizacion(cotizacion);
			venta.setAgencia(cotizacion.getAgencia());
		} else if (request.agenciaId() != null) {
			venta.setAgencia(obtenerAgencia(request.agenciaId()));
		}
		if (request.productoId() != null) {
			venta.setProducto(obtenerPaquete(request.productoId()));
		}
		if (request.tarifaId() != null) {
			venta.setTarifa(obtenerTarifa(request.tarifaId()));
		}
		venta.setIdDetallePagos(request.idDetallePagos());
		venta.setMontoAPagar(request.montoAPagar() != null ? request.montoAPagar() : BigDecimal.ZERO);
		venta.setComision(request.comision() != null ? request.comision() : BigDecimal.ZERO);
		venta.setIgv(request.igv() != null ? request.igv() : BigDecimal.ZERO);
		venta.setNotasOperativas(request.notasOperativas());
		if (crear) {
			venta.setEstado(estadoNormalizado(request.estado()));
		}
	}

	private String estadoNormalizado(String estado) {
		if (estado == null || estado.isBlank()) {
			return "CONFIRMADA";
		}
		if (!ESTADOS_VALIDOS.contains(estado)) {
			throw new BusinessException("Estado no valido. Estados permitidos: " + ESTADOS_VALIDOS);
		}
		return estado;
	}

	private Venta obtenerConRelaciones(Long id) {
		return ventaRepository.findDetalleConRelaciones(id)
				.orElseThrow(() -> new NotFoundException("Venta no encontrada con id " + id));
	}

	private Agencia obtenerAgencia(Long id) {
		return agenciaRepository.findById(id)
				.orElseThrow(() -> new NotFoundException("Agencia no encontrada con id " + id));
	}

	private Tarifa obtenerTarifa(Long id) {
		return tarifaRepository.findById(id)
				.orElseThrow(() -> new NotFoundException("Tarifa no encontrada con id " + id));
	}

	private Paquete obtenerPaquete(Long id) {
		return paqueteRepository.findById(id)
				.orElseThrow(() -> new NotFoundException("Producto no encontrado con id " + id));
	}

	private Usuario usuarioActual() {
		String username = SecurityContextHolder.getContext().getAuthentication().getName();
		return usuarioRepository.findByUsername(username)
				.orElseThrow(() -> new NotFoundException("Usuario no identificado: " + username));
	}

	private String siguienteNumero() {
		int siguiente = 1;
		var ultima = ventaRepository.findTopByNumeroStartingWithOrderByNumeroDesc("VTA-");
		if (ultima.isPresent()) {
			try {
				siguiente = Integer.parseInt(ultima.get().getNumero().substring(4)) + 1;
			} catch (NumberFormatException ignored) {
				// se mantiene 1
			}
		}
		String numero;
		do {
			numero = String.format("VTA-%04d", siguiente++);
		} while (ventaRepository.existsByNumero(numero));
		return numero;
	}

	private BigDecimal estimarMontoCotizacion(Cotizacion c) {
		BigDecimal costoBase = c.getDetalles().stream()
				.map(d -> d.getPrecioUnitario().multiply(BigDecimal.valueOf(d.getCantidadPax())))
				.reduce(BigDecimal.ZERO, BigDecimal::add);
		BigDecimal margenPct = c.getMargenPorcentaje() != null ? c.getMargenPorcentaje() : BigDecimal.ZERO;
		return costoBase.add(costoBase.multiply(margenPct)
				.divide(BigDecimal.valueOf(100), 2, java.math.RoundingMode.HALF_UP));
	}

	private VentaListaDTO toListaDTO(Venta v) {
		String tarifa = "-";
		if (v.getTarifa() != null) {
			tarifa = v.getTarifa().getServicio().getNombre() + " · "
					+ v.getTarifa().getDestino().getNombre();
		}
		return new VentaListaDTO(
				v.getId(),
				v.getNumero(),
				nombreAgencia(v.getAgencia()),
				v.getProducto() != null ? v.getProducto().getNombre() : "-",
				tarifa,
				v.getMontoAPagar(),
				v.getComision(),
				v.getIgv(),
				v.getEstado(),
				v.getFechaVenta());
	}

	private VentaDTO toDTO(Venta v) {
		List<VentaHistorialDTO> historial = v.getHistorial().stream()
				.map(h -> new VentaHistorialDTO(h.getId(),
						h.getEstadoAnterior(), h.getEstadoNuevo(),
						h.getFechaCambio(),
						h.getUsuarioCambio() != null ? h.getUsuarioCambio().getUsername() : null))
				.toList();

		BigDecimal total = v.getMontoAPagar().add(v.getIgv());

		return new VentaDTO(
				v.getId(),
				v.getNumero(),
				v.getCotizacion() != null ? v.getCotizacion().getId() : null,
				v.getCotizacion() != null ? v.getCotizacion().getNumero() : null,
				v.getProducto() != null ? v.getProducto().getId() : null,
				v.getProducto() != null ? v.getProducto().getNombre() : null,
				v.getTarifa() != null ? v.getTarifa().getId() : null,
				v.getTarifa() != null
						? v.getTarifa().getServicio().getNombre() + " · " + v.getTarifa().getDestino().getNombre()
						: null,
				v.getTarifa() != null ? v.getTarifa().getPrecio() : null,
				v.getAgencia() != null ? v.getAgencia().getId() : null,
				v.getAgencia() != null ? nombreAgencia(v.getAgencia()) : null,
				v.getAgencia() != null ? v.getAgencia().getRuc() : null,
				v.getIdDetallePagos(),
				v.getMontoAPagar(),
				v.getComision(),
				v.getIgv(),
				total,
				v.getNotasOperativas(),
				v.getEstado(),
				v.getFechaVenta(),
				v.getFechaCulminada(),
				v.getFechaCreacion(),
				v.getUsuarioRegistro() != null ? v.getUsuarioRegistro().getUsername() : null,
				historial);
	}

	private String nombreProveedor(Tarifa t) {
		return t.getProveedor().getNombreComercial() != null && !t.getProveedor().getNombreComercial().isBlank()
				? t.getProveedor().getNombreComercial()
				: t.getProveedor().getRazonSocial();
	}

	private String nombreAgencia(Agencia agencia) {
		if (agencia == null) {
			return null;
		}
		if (agencia.getNombreComercial() != null && !agencia.getNombreComercial().isBlank()) {
			return agencia.getNombreComercial();
		}
		return agencia.getRazonSocial();
	}
}
