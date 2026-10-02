package com.example.demo.modulos.tarifas.service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import com.example.demo.exception.NotFoundException;
import com.example.demo.modulos.catalogo.dto.DestinoDTO;
import com.example.demo.modulos.catalogo.dto.ServicioDTO;
import com.example.demo.modulos.catalogo.entity.Destino;
import com.example.demo.modulos.catalogo.entity.Servicio;
import com.example.demo.modulos.catalogo.repository.DestinoRepository;
import com.example.demo.modulos.catalogo.repository.ServicioRepository;
import com.example.demo.modulos.catalogo.mapper.DestinoMapper;
import com.example.demo.modulos.catalogo.mapper.ServicioMapper;
import com.example.demo.modulos.gestionUsuariosRolesPermisos.entity.Usuario;
import com.example.demo.modulos.gestionUsuariosRolesPermisos.repository.UsuarioRepository;
import com.example.demo.modulos.proveedores.entity.Proveedor;
import com.example.demo.modulos.proveedores.repository.ProveedorRepository;
import com.example.demo.modulos.tarifas.dto.KpiTarifasDTO;
import com.example.demo.modulos.tarifas.dto.TarifaDTO;
import com.example.demo.modulos.tarifas.dto.TarifaDetalleDTO;
import com.example.demo.modulos.tarifas.dto.TarifaListaDTO;
import com.example.demo.modulos.tarifas.dto.TarifaRequest;
import com.example.demo.modulos.tarifas.entity.Tarifa;
import com.example.demo.modulos.tarifas.entity.TarifaHistorial;
import com.example.demo.modulos.tarifas.mapper.TarifaMapper;
import com.example.demo.modulos.tarifas.repository.TarifaRepository;
import com.example.demo.util.Specifications;

import jakarta.persistence.criteria.Predicate;

/**
 * Dueño de las tarifas. Otros modulos consumen esta service
 * en lugar de acceder directamente a TarifaRepository.
 */
@Service
@Transactional(readOnly = true)
public class TarifaService {

	/** Dias de antelacion usados tambien por los kpis (ver TarifaMapper). */
	private static final long DIAS_POR_VENCER = 7;

	private final TarifaRepository tarifaRepository;
	private final ProveedorRepository proveedorRepository;
	private final ServicioRepository servicioRepository;
	private final DestinoRepository destinoRepository;
	private final UsuarioRepository usuarioRepository;

	public TarifaService(TarifaRepository tarifaRepository, ProveedorRepository proveedorRepository,
			ServicioRepository servicioRepository, DestinoRepository destinoRepository,
			UsuarioRepository usuarioRepository) {
		this.tarifaRepository = tarifaRepository;
		this.proveedorRepository = proveedorRepository;
		this.servicioRepository = servicioRepository;
		this.destinoRepository = destinoRepository;
		this.usuarioRepository = usuarioRepository;
	}

	public List<TarifaDTO> listarVigentes() {
		return tarifaRepository.findVigentes().stream()
				.map(TarifaMapper::toDTO)
				.toList();
	}

	public Tarifa obtener(Long id) {
		return tarifaRepository.findById(id)
				.orElseThrow(() -> new NotFoundException("Tarifa no encontrada con id " + id));
	}

	public Page<TarifaListaDTO> listar(String q, Long proveedorId, Long destinoId, Long servicioId, String estado,
			Pageable pageable) {
		Specification<Tarifa> spec = construirFiltros(q, proveedorId, destinoId, servicioId, estado);
		return tarifaRepository.findAll(spec, pageable).map(TarifaMapper::toListaDTO);
	}

	public KpiTarifasDTO kpis() {
		LocalDate hoy = LocalDate.now();
		LocalDate limite = hoy.plusDays(DIAS_POR_VENCER);
		return new KpiTarifasDTO(
				tarifaRepository.countVigentes(limite),
				tarifaRepository.countPorVencer(hoy, limite),
				tarifaRepository.countVencidas(hoy));
	}

	public List<String> tiposTarifa() {
		return TarifaMapper.TIPOS_TARIFA;
	}

	public List<String> monedas() {
		return List.of("PEN", "USD", "EUR");
	}

	public List<DestinoDTO> destinos() {
		return destinoRepository.findAllByOrderByNombreAsc().stream().map(DestinoMapper::toDTO).toList();
	}

	public List<ServicioDTO> servicios() {
		return servicioRepository.findAllByOrderByNombreAsc().stream().map(ServicioMapper::toDTO).toList();
	}

	public List<com.example.demo.modulos.tarifas.dto.ProveedorRefDTO> proveedores() {
		return proveedorRepository.findAll().stream()
				.sorted(java.util.Comparator.comparing(com.example.demo.modulos.proveedores.mapper.ProveedorMapper::nombre,
						java.util.Comparator.nullsLast(String::compareTo)))
				.map(p -> new com.example.demo.modulos.tarifas.dto.ProveedorRefDTO(p.getId(),
						com.example.demo.modulos.proveedores.mapper.ProveedorMapper.nombre(p)))
				.toList();
	}

	public TarifaDetalleDTO detalle(Long id) {
		return TarifaMapper.toDetalleDTO(obtener(id));
	}

	@Transactional
	public TarifaDetalleDTO crear(TarifaRequest request) {
		Tarifa tarifa = new Tarifa();
		TarifaMapper.aplicar(tarifa, request, obtenerProveedor(request.proveedorId()),
				obtenerServicio(request.servicioId()), obtenerDestino(request.destinoId()));
		registrarHistorial(tarifa, null, request.precio());
		return TarifaMapper.toDetalleDTO(tarifaRepository.save(tarifa));
	}

	@Transactional
	public TarifaDetalleDTO actualizar(Long id, TarifaRequest request) {
		Tarifa tarifa = obtener(id);
		var precioAnterior = tarifa.getPrecio();
		TarifaMapper.aplicar(tarifa, request, obtenerProveedor(request.proveedorId()),
				obtenerServicio(request.servicioId()), obtenerDestino(request.destinoId()));
		if (precioAnterior == null || precioAnterior.compareTo(request.precio()) != 0) {
			registrarHistorial(tarifa, precioAnterior, request.precio());
		}
		return TarifaMapper.toDetalleDTO(tarifaRepository.save(tarifa));
	}

	@Transactional
	public void eliminar(Long id) {
		tarifaRepository.delete(obtener(id));
	}

	@Transactional
	public String actualizarArchivoRespaldo(Long id, String nombreArchivo) {
		Tarifa tarifa = obtener(id);
		tarifa.setArchivoRespaldoUrl(nombreArchivo);
		tarifaRepository.save(tarifa);
		return nombreArchivo;
	}

	private void registrarHistorial(Tarifa tarifa, java.math.BigDecimal precioAnterior,
			java.math.BigDecimal precioNuevo) {
		TarifaHistorial historial = new TarifaHistorial();
		historial.setTarifa(tarifa);
		historial.setPrecioAnterior(precioAnterior);
		historial.setPrecioNuevo(precioNuevo);
		historial.setUsuarioCambio(usuarioActualOrNull());
		tarifa.getHistorial().add(historial);
	}

	private Usuario usuarioActualOrNull() {
		var auth = SecurityContextHolder.getContext().getAuthentication();
		if (auth == null) {
			return null;
		}
		return usuarioRepository.findByUsername(auth.getName()).orElse(null);
	}

	private Proveedor obtenerProveedor(Long id) {
		return proveedorRepository.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Proveedor no encontrado"));
	}

	private Servicio obtenerServicio(Long id) {
		return servicioRepository.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Servicio no encontrado"));
	}

	private Destino obtenerDestino(Long id) {
		return destinoRepository.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Destino no encontrado"));
	}

	private Specification<Tarifa> construirFiltros(String q, Long proveedorId, Long destinoId, Long servicioId,
			String estado) {
		return (root, query, cb) -> {
			List<Predicate> predicates = new ArrayList<>();
			var proveedorJoin = root.join("proveedor");
			var servicioJoin = root.join("servicio");
			var destinoJoin = root.join("destino");

			if (StringUtils.hasText(q)) {
				predicates.add(cb.or(
						Specifications.contiene(cb, proveedorJoin.get("razonSocial"), q),
						Specifications.contiene(cb, proveedorJoin.get("nombreComercial"), q),
						Specifications.contiene(cb, servicioJoin.get("nombre"), q),
						Specifications.contiene(cb, destinoJoin.get("nombre"), q)));
			}
			if (proveedorId != null) {
				predicates.add(cb.equal(proveedorJoin.get("id"), proveedorId));
			}
			if (destinoId != null) {
				predicates.add(cb.equal(destinoJoin.get("id"), destinoId));
			}
			if (servicioId != null) {
				predicates.add(cb.equal(servicioJoin.get("id"), servicioId));
			}
			if (StringUtils.hasText(estado)) {
				LocalDate hoy = LocalDate.now();
				LocalDate limite = hoy.plusDays(DIAS_POR_VENCER);
				switch (estado.toUpperCase()) {
					case TarifaMapper.ESTADO_VENCIDA -> predicates.add(cb.lessThan(root.get("fechaHasta"), hoy));
					case TarifaMapper.ESTADO_POR_VENCER -> predicates.add(cb.and(
							cb.greaterThanOrEqualTo(root.get("fechaHasta"), hoy),
							cb.lessThanOrEqualTo(root.get("fechaHasta"), limite)));
					case TarifaMapper.ESTADO_VIGENTE -> predicates.add(cb.greaterThan(root.get("fechaHasta"), limite));
					default -> {
						// estado desconocido: no se filtra
					}
				}
			}

			return predicates.isEmpty() ? cb.conjunction() : cb.and(predicates.toArray(new Predicate[0]));
		};
	}
}
