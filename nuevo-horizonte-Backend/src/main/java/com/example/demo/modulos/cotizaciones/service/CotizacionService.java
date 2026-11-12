package com.example.demo.modulos.cotizaciones.service;

import com.example.demo.exception.BusinessException;
import com.example.demo.exception.NotFoundException;
import com.example.demo.modulos.gestionAgencias.dto.AgenciaDTO;
import com.example.demo.modulos.gestionAgencias.mapper.AgenciaMapper;
import com.example.demo.modulos.gestionAgencias.service.AgenciaService;
import com.example.demo.modulos.notificaciones.service.NotificacionService;
import com.example.demo.modulos.catalogo.service.CatalogoService;
import com.example.demo.modulos.tarifas.service.TarifaService;
import com.example.demo.modulos.cotizaciones.dto.CambioEstadoRequest;
import com.example.demo.modulos.cotizaciones.dto.CotizacionDTO;
import com.example.demo.modulos.cotizaciones.dto.CotizacionDetalleDTO;
import com.example.demo.modulos.cotizaciones.dto.CotizacionHistorialDTO;
import com.example.demo.modulos.cotizaciones.dto.CotizacionLineaRequest;
import com.example.demo.modulos.cotizaciones.dto.CotizacionListaDTO;
import com.example.demo.modulos.cotizaciones.dto.CotizacionRequest;
import com.example.demo.modulos.catalogo.dto.DestinoDTO;
import com.example.demo.modulos.cotizaciones.dto.KpiCotizacionesDTO;
import com.example.demo.modulos.tarifas.dto.TarifaDTO;
import com.example.demo.modulos.gestionAgencias.entity.Agencia;
import com.example.demo.modulos.cotizaciones.entity.Cotizacion;
import com.example.demo.modulos.cotizaciones.entity.CotizacionDetalle;
import com.example.demo.modulos.cotizaciones.entity.CotizacionHistorialEstado;
import com.example.demo.modulos.catalogo.entity.Destino;
import com.example.demo.modulos.tarifas.entity.Tarifa;
import com.example.demo.modulos.cotizaciones.repository.CotizacionDetalleRepository;
import com.example.demo.modulos.cotizaciones.repository.CotizacionRepository;
import com.example.demo.modulos.gestionUsuariosRolesPermisos.entity.Usuario;
import com.example.demo.modulos.gestionUsuariosRolesPermisos.repository.UsuarioRepository;
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
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class CotizacionService {

	private static final Set<String> ESTADOS_VALIDOS = Set.of(
			"PENDIENTE", "EN_NEGOCIACION", "ENVIADA", "CERRADA", "PERDIDA", "ANULADA");

	/** Clave arbitraria del advisory lock que serializa la numeracion de cotizaciones. */
	private static final long CLAVE_NUMERO_COTIZACION = 918_273_645L;

	private final CotizacionRepository cotizacionRepository;
	private final CotizacionDetalleRepository detalleRepository;
	private final AgenciaService agenciaService;
	private final CatalogoService catalogoService;
	private final TarifaService tarifaService;
	private final UsuarioRepository usuarioRepository;
	private final NotificacionService notificacionService;

	public CotizacionService(CotizacionRepository cotizacionRepository,
			CotizacionDetalleRepository detalleRepository,
			AgenciaService agenciaService,
			CatalogoService catalogoService,
			TarifaService tarifaService,
			UsuarioRepository usuarioRepository,
			NotificacionService notificacionService) {
		this.cotizacionRepository = cotizacionRepository;
		this.detalleRepository = detalleRepository;
		this.agenciaService = agenciaService;
		this.catalogoService = catalogoService;
		this.tarifaService = tarifaService;
		this.usuarioRepository = usuarioRepository;
		this.notificacionService = notificacionService;
	}

	@Transactional(readOnly = true)
	public Page<CotizacionListaDTO> listar(String q, String estado, Long agenciaId, Long destinoId,
			LocalDateTime desde, LocalDateTime hasta, int page, int size) {
		Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "fechaCreacion"));

		String patron = (q == null || q.isBlank()) ? null : "%" + q.toLowerCase() + "%";
		Specification<Cotizacion> spec = (root, query, cb) -> {
			List<Predicate> predicados = new ArrayList<>();

			if (estado != null && !estado.isBlank()) {
				predicados.add(cb.equal(root.get("estado"), estado));
			}
			if (agenciaId != null) {
				predicados.add(cb.equal(root.get("agencia").get("id"), agenciaId));
			}
			if (desde != null) {
				predicados.add(cb.greaterThanOrEqualTo(root.get("fechaCreacion"), desde));
			}
			if (hasta != null) {
				predicados.add(cb.lessThanOrEqualTo(root.get("fechaCreacion"), hasta));
			}
			if (destinoId != null) {
				predicados.add(existeDetalleConDestino(cb, root, query, destinoId));
			}
			if (patron != null) {
				Join<Cotizacion, Agencia> agencia = root.join("agencia", JoinType.LEFT);
				predicados.add(cb.or(
						cb.like(cb.lower(root.get("numero")), patron),
						cb.like(cb.lower(cb.coalesce(agencia.get("nombreComercial"),
								agencia.get("razonSocial"))), patron),
						existeCoincidenciaEnDetalles(cb, root, query, patron)));
			}

			return cb.and(predicados.toArray(new Predicate[0]));
		};

		Page<Cotizacion> resultado = cotizacionRepository.findAll(spec, pageable);

		List<Long> ids = resultado.getContent().stream().map(Cotizacion::getId).toList();
		Map<Long, List<CotizacionDetalle>> detallePorCotizacion = ids.isEmpty() ? Map.of()
				: detalleRepository.findByCotizacionIdIn(ids).stream()
						.collect(Collectors.groupingBy(d -> d.getCotizacion().getId()));

		List<CotizacionListaDTO> contenido = resultado.getContent().stream()
				.map(c -> toListaDTO(c, detallePorCotizacion.getOrDefault(c.getId(), List.of())))
				.toList();

		return new PageImpl<>(contenido, pageable, resultado.getTotalElements());
	}

	private Predicate existeDetalleConDestino(CriteriaBuilder cb, Root<Cotizacion> root,
			CriteriaQuery<?> query, Long destinoId) {
		Subquery<Long> sub = query.subquery(Long.class);
		Root<CotizacionDetalle> detalle = sub.from(CotizacionDetalle.class);
		sub.select(cb.literal(1L));
		sub.where(cb.and(
				cb.equal(detalle.get("cotizacion"), root),
				cb.equal(detalle.get("tarifa").get("destino").get("id"), destinoId)));
		return cb.exists(sub);
	}

	private Predicate existeCoincidenciaEnDetalles(CriteriaBuilder cb, Root<Cotizacion> root,
			CriteriaQuery<?> query, String patron) {
		Subquery<Long> sub = query.subquery(Long.class);
		Root<CotizacionDetalle> detalle = sub.from(CotizacionDetalle.class);
		sub.select(cb.literal(1L));
		sub.where(cb.and(
				cb.equal(detalle.get("cotizacion"), root),
				cb.or(
						cb.like(cb.lower(detalle.get("tarifa").get("servicio").get("nombre")), patron),
						cb.like(cb.lower(detalle.get("tarifa").get("destino").get("nombre")), patron))));
		return cb.exists(sub);
	}

	@Transactional(readOnly = true)
	public KpiCotizacionesDTO kpis() {
		return new KpiCotizacionesDTO(
				cotizacionRepository.countByEstado("PENDIENTE"),
				cotizacionRepository.countByEstado("EN_NEGOCIACION"),
				cotizacionRepository.countCerradasEsteMes());
	}

	@Transactional(readOnly = true)
	public CotizacionDTO detalle(Long id) {
		return toDTO(obtenerConRelaciones(id));
	}

	@Transactional
	public CotizacionDTO crear(CotizacionRequest request) {
		validarRequest(request);

		Agencia agencia = agenciaService.obtener(request.agenciaId());
		Usuario asesor = usuarioActual();

		Cotizacion cotizacion = new Cotizacion();
		cotizacion.setNumero(siguienteNumero());
		cotizacion.setAgencia(agencia);
		cotizacion.setAsesor(asesor);
		cotizacion.setEstado("PENDIENTE");
		cotizacion.setFechaCreacion(LocalDateTime.now());
		if (request.fechaEnvio() != null) {
			cotizacion.setFechaEnvio(request.fechaEnvio());
		}
		cotizacion.setFechaViaje(request.fechaViaje());
		cotizacion.setServiciosAdicionales(request.serviciosAdicionales());
		cotizacion.setMargenPorcentaje(request.margenPorcentaje() != null ? request.margenPorcentaje() : BigDecimal.ZERO);
		request.lineas().forEach(linea -> agregarLinea(cotizacion, linea));

		CotizacionHistorialEstado inicial = new CotizacionHistorialEstado();
		inicial.setEstadoAnterior(null);
		inicial.setEstadoNuevo("PENDIENTE");
		inicial.setFechaCambio(LocalDateTime.now());
		inicial.setUsuarioCambio(asesor);
		cotizacion.addHistorial(inicial);

		Cotizacion guardada = cotizacionRepository.save(cotizacion);
		notificar("Nueva cotización: " + guardada.getNumero(),
				"Se registró la cotización " + guardada.getNumero() + " para "
						+ AgenciaMapper.nombre(guardada.getAgencia()) + ".",
				"Estado: PENDIENTE · Agencia: " + AgenciaMapper.nombre(guardada.getAgencia()));
		return toDTO(guardada);
	}

	@Transactional
	public CotizacionDTO actualizar(Long id, CotizacionRequest request) {
		validarRequest(request);
		Cotizacion cotizacion = obtenerConRelaciones(id);

		if (request.agenciaId() != null) {
			cotizacion.setAgencia(agenciaService.obtener(request.agenciaId()));
		}
		if (request.fechaEnvio() != null) {
			cotizacion.setFechaEnvio(request.fechaEnvio());
		}
		cotizacion.setFechaViaje(request.fechaViaje());
		cotizacion.setServiciosAdicionales(request.serviciosAdicionales());
		if (request.margenPorcentaje() != null) {
			cotizacion.setMargenPorcentaje(request.margenPorcentaje());
		}

		// Se actualizan las lineas existentes en lugar de borrarlas y recrearlas:
		// asi se conserva el precio con el que se cotizo (tarifa.getPrecio() pudo
		// cambiar) y la promocion aplicada, y solo se eliminan las lineas que ya
		// no vienen en el request.
		Map<Long, CotizacionDetalle> existentes = cotizacion.getDetalles().stream()
				.collect(Collectors.toMap(detalle -> detalle.getTarifa().getId(), detalle -> detalle, (a, b) -> a));

		for (CotizacionLineaRequest linea : request.lineas()) {
			CotizacionDetalle detalle = existentes.remove(linea.tarifaId());
			if (detalle == null) {
				cotizacion.addDetalle(construirDetalle(linea.tarifaId(), linea.cantidadPax()));
			} else {
				detalle.setCantidadPax(cantidadPax(linea.cantidadPax()));
			}
		}

		// Las lineas que ya no estan en el request se borran (orphanRemoval).
		existentes.values().forEach(cotizacion.getDetalles()::remove);

		notificar("Cotización actualizada: " + cotizacion.getNumero(),
				"Se actualizaron los datos de la cotización " + cotizacion.getNumero() + ".",
				"Agencia: " + AgenciaMapper.nombre(cotizacion.getAgencia())
						+ " · Líneas: " + cotizacion.getDetalles().size());
		return toDTO(cotizacion);
	}

	@Transactional
	public CotizacionDTO cambiarEstado(Long id, CambioEstadoRequest request) {
		String nuevoEstado = request.estado();
		if (nuevoEstado == null || !ESTADOS_VALIDOS.contains(nuevoEstado)) {
			throw new BusinessException("Estado no valido. Estados permitidos: " + ESTADOS_VALIDOS);
		}

		Cotizacion cotizacion = obtenerConRelaciones(id);
		String estadoAnterior = cotizacion.getEstado();

		if (estadoAnterior.equals(nuevoEstado)) {
			return toDTO(cotizacion);
		}

		cotizacion.setEstado(nuevoEstado);
		if ("ENVIADA".equals(nuevoEstado) && cotizacion.getFechaEnvio() == null) {
			cotizacion.setFechaEnvio(LocalDateTime.now());
		}
		if ("CERRADA".equals(nuevoEstado)) {
			cotizacion.setFechaCierre(LocalDateTime.now());
		}

		CotizacionHistorialEstado historial = new CotizacionHistorialEstado();
		historial.setEstadoAnterior(estadoAnterior);
		historial.setEstadoNuevo(nuevoEstado);
		historial.setFechaCambio(LocalDateTime.now());
		historial.setUsuarioCambio(usuarioActual());
		cotizacion.addHistorial(historial);

		notificar("Cotización " + cotizacion.getNumero() + ": " + nuevoEstado,
				"La cotización " + cotizacion.getNumero() + " cambió de " + estadoAnterior
						+ " a " + nuevoEstado + ".",
				"Agencia: " + AgenciaMapper.nombre(cotizacion.getAgencia())
						+ " · Estado anterior: " + estadoAnterior + " · Estado nuevo: " + nuevoEstado);
		return toDTO(cotizacion);
	}

	@Transactional(readOnly = true)
	public List<AgenciaDTO> agencias() {
		return agenciaService.listarActivasRef();
	}

	@Transactional(readOnly = true)
	public List<DestinoDTO> destinos() {
		return catalogoService.listarDestinos();
	}

	@Transactional(readOnly = true)
	public List<TarifaDTO> tarifasVigentes() {
		return tarifaService.listarVigentes();
	}

	private void validarRequest(CotizacionRequest request) {
		if (request.agenciaId() == null) {
			throw new BusinessException("Debe seleccionar una agencia");
		}
		if (request.lineas() == null || request.lineas().isEmpty()) {
			throw new BusinessException("Debe agregar al menos un producto a la cotizacion");
		}
	}

	private void agregarLinea(Cotizacion cotizacion, CotizacionLineaRequest linea) {
		cotizacion.addDetalle(construirDetalle(linea.tarifaId(), linea.cantidadPax()));
	}

	private CotizacionDetalle construirDetalle(Long tarifaId, Integer cantidadPax) {
		Tarifa tarifa = tarifaService.obtener(tarifaId);
		CotizacionDetalle detalle = new CotizacionDetalle();
		detalle.setTarifa(tarifa);
		detalle.setPrecioUnitario(tarifa.getPrecio());
		detalle.setCantidadPax(cantidadPax(cantidadPax));
		return detalle;
	}

	private int cantidadPax(Integer cantidadPax) {
		return cantidadPax != null && cantidadPax > 0 ? cantidadPax : 1;
	}

	private Cotizacion obtenerConRelaciones(Long id) {
		return cotizacionRepository.findDetalleConRelaciones(id)
				.orElseThrow(() -> new NotFoundException("Cotizacion no encontrada con id " + id));
	}

	private Usuario usuarioActual() {
		String username = SecurityContextHolder.getContext().getAuthentication().getName();
		return usuarioRepository.findByUsername(username)
				.orElseThrow(() -> new NotFoundException("Usuario no identificado: " + username));
	}

	private void notificar(String titulo, String mensaje, String detalle) {
		notificacionService.crearParaUsuariosActivos(titulo, mensaje,
				NotificacionService.TIPO_COTIZACION, "/cotizaciones",
				notificacionService.actorActual(), detalle);
	}

	/**
	 * Genera el siguiente numero de cotizacion de forma segura entre transacciones
	 * concurrentes. El lock de Postgres se libera solo al terminar la transaccion;
	 * sin el, dos altas simultaneas calculaban el mismo COT-XXXX y una fallaba por
	 * la restriccion unique de la columna numero.
	 */
	private String siguienteNumero() {
		cotizacionRepository.bloquearGeneracionDeNumero(CLAVE_NUMERO_COTIZACION);
		int siguiente = cotizacionRepository.maxSecuenciaNumero() + 1;
		return String.format("COT-%04d", siguiente);
	}

	private CotizacionListaDTO toListaDTO(Cotizacion c, List<CotizacionDetalle> lineas) {
		Set<String> productos = new LinkedHashSet<>();
		String destino = "";
		BigDecimal costoBase = BigDecimal.ZERO;
		for (CotizacionDetalle d : lineas) {
			productos.add(d.getTarifa().getServicio().getNombre());
			if (destino.isBlank()) {
				destino = d.getTarifa().getDestino().getNombre();
			}
			costoBase = costoBase.add(d.getPrecioUnitario().multiply(BigDecimal.valueOf(d.getCantidadPax())));
		}
		BigDecimal precioVenta = calcularPrecioVenta(costoBase, c.getMargenPorcentaje());
		return new CotizacionListaDTO(c.getId(), c.getNumero(), nombreAgencia(c.getAgencia()),
				destino, String.join(" + ", productos), precioVenta, c.getEstado(), c.getFechaCreacion());
	}

	private CotizacionDTO toDTO(Cotizacion c) {
		List<CotizacionDetalleDTO> lineas = c.getDetalles().stream().map(d -> {
			BigDecimal montoLinea = d.getPrecioUnitario().multiply(BigDecimal.valueOf(d.getCantidadPax()));
			return new CotizacionDetalleDTO(d.getId(), d.getTarifa().getId(),
					d.getTarifa().getServicio().getNombre(),
					d.getTarifa().getDestino().getNombre(),
					d.getTarifa().getProveedor().getNombreComercial() != null
							&& !d.getTarifa().getProveedor().getNombreComercial().isBlank()
									? d.getTarifa().getProveedor().getNombreComercial()
									: d.getTarifa().getProveedor().getRazonSocial(),
					d.getPrecioUnitario(), d.getCantidadPax(), montoLinea,
					d.getTarifa().getMoneda());
		}).toList();
		BigDecimal costoBase = lineas.stream()
				.map(CotizacionDetalleDTO::monto)
				.reduce(BigDecimal.ZERO, BigDecimal::add);
		BigDecimal margenPct = c.getMargenPorcentaje() != null ? c.getMargenPorcentaje() : BigDecimal.ZERO;
		BigDecimal margenMonto = calcularMargen(costoBase, margenPct);
		BigDecimal precioVenta = costoBase.add(margenMonto);

		Set<String> productos = new LinkedHashSet<>();
		c.getDetalles().forEach(d -> productos.add(d.getTarifa().getServicio().getNombre()));
		String destino = c.getDetalles().isEmpty() ? ""
				: c.getDetalles().get(0).getTarifa().getDestino().getNombre();

		List<CotizacionHistorialDTO> historial = c.getHistorial().stream()
				.map(h -> new CotizacionHistorialDTO(h.getId(),
						h.getEstadoAnterior(), h.getEstadoNuevo(),
						h.getFechaCambio(),
						h.getUsuarioCambio() != null ? h.getUsuarioCambio().getUsername() : null))
				.toList();

		return new CotizacionDTO(c.getId(), c.getNumero(),
				c.getAgencia().getId(), nombreAgencia(c.getAgencia()), c.getAgencia().getRuc(),
				c.getAsesor() != null ? c.getAsesor().getUsername() : null,
				c.getFechaCreacion(), c.getFechaEnvio(), c.getFechaCierre(),
				c.getFechaViaje(), c.getServiciosAdicionales(),
				margenPct, costoBase, margenMonto, precioVenta,
				c.getEstado(), destino, String.join(" + ", productos), precioVenta, lineas, historial);
	}

	private BigDecimal calcularMargen(BigDecimal costoBase, BigDecimal margenPorcentaje) {
		return costoBase.multiply(margenPorcentaje)
				.divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
	}

	private BigDecimal calcularPrecioVenta(BigDecimal costoBase, BigDecimal margenPorcentaje) {
		return costoBase.add(calcularMargen(costoBase, margenPorcentaje));
	}

	private String nombreAgencia(Agencia agencia) {
		if (agencia.getNombreComercial() != null && !agencia.getNombreComercial().isBlank()) {
			return agencia.getNombreComercial();
		}
		return agencia.getRazonSocial();
	}
}