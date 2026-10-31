package com.example.demo.modulos.promociones.service;

import com.example.demo.exception.BusinessException;
import com.example.demo.exception.NotFoundException;
import com.example.demo.modulos.catalogo.repository.ServicioRepository;
import com.example.demo.modulos.notificaciones.service.NotificacionService;
import com.example.demo.modulos.promociones.dto.KpiPromocionesDTO;
import com.example.demo.modulos.promociones.dto.PromocionDTO;
import com.example.demo.modulos.promociones.dto.PromocionRequest;
import com.example.demo.modulos.promociones.dto.ServicioOpcionDTO;
import com.example.demo.modulos.promociones.entity.Promocion;
import com.example.demo.modulos.promociones.mapper.PromocionMapper;
import com.example.demo.modulos.promociones.repository.PromocionRepository;
import com.example.demo.util.Specifications;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
@Transactional(readOnly = true)
public class PromocionService {

	private static final List<String> CAMPOS_BUSQUEDA = List.of("titulo", "descripcion");
	private static final Set<String> TIPOS_IMAGEN = Set.of(
			"image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif");
	private static final long TAMANO_MAXIMO_IMAGEN = 5L * 1024 * 1024;
	private static final DateTimeFormatter FORMATO_FECHA = DateTimeFormatter.ofPattern("dd/MM/yyyy");

	private final PromocionRepository promocionRepository;
	private final ServicioRepository servicioRepository;
	private final NotificacionService notificacionService;

	public PromocionService(PromocionRepository promocionRepository,
			ServicioRepository servicioRepository, NotificacionService notificacionService) {
		this.promocionRepository = promocionRepository;
		this.servicioRepository = servicioRepository;
		this.notificacionService = notificacionService;
	}

	public Page<PromocionDTO> listar(String q, Long servicioId, String estado, Boolean activo,
			Boolean destacada, Pageable pageable) {
		Specification<Promocion> spec = (root, query, cb) -> {
			List<Predicate> predicates = new ArrayList<>();
			if (StringUtils.hasText(q)) {
				predicates.add(Specifications.algunoContiene(cb, root, q.trim(), CAMPOS_BUSQUEDA));
			}
			if (servicioId != null) {
				predicates.add(cb.equal(root.get("servicio").get("id"), servicioId));
			}
			if (activo != null) {
				predicates.add(cb.equal(root.get("activo"), activo));
			}
			if (destacada != null) {
				predicates.add(cb.equal(root.get("destacada"), destacada));
			}
			if (StringUtils.hasText(estado)) {
				aplicarFiltroEstado(predicates, cb, root, estado.trim());
			}
			return predicates.isEmpty() ? cb.conjunction() : cb.and(predicates.toArray(new Predicate[0]));
		};
		return promocionRepository.findAll(spec, pageable).map(PromocionMapper::toDTO);
	}

	private void aplicarFiltroEstado(List<Predicate> predicates,
			jakarta.persistence.criteria.CriteriaBuilder cb,
			jakarta.persistence.criteria.Root<Promocion> root, String estado) {
		LocalDate hoy = LocalDate.now();
		switch (estado.toUpperCase(Locale.ROOT)) {
			case PromocionMapper.ESTADO_INACTIVA -> predicates.add(cb.isFalse(root.get("activo")));
			case PromocionMapper.ESTADO_PROGRAMADA -> {
				predicates.add(cb.isTrue(root.get("activo")));
				predicates.add(cb.greaterThan(root.get("fechaInicio"), hoy));
			}
			case PromocionMapper.ESTADO_VENCIDA -> predicates.add(cb.lessThan(root.get("fechaFin"), hoy));
			case PromocionMapper.ESTADO_VIGENTE -> {
				predicates.add(cb.isTrue(root.get("activo")));
				predicates.add(cb.lessThanOrEqualTo(root.get("fechaInicio"), hoy));
				predicates.add(cb.greaterThanOrEqualTo(root.get("fechaFin"), hoy));
			}
			default -> {
				// Estado desconocido: no se aplica filtro.
			}
		}
	}

	public KpiPromocionesDTO kpis() {
		LocalDate hoy = LocalDate.now();
		return new KpiPromocionesDTO(
				promocionRepository.count(),
				promocionRepository.countByActivoTrue(),
				promocionRepository.countByActivoTrueAndFechaInicioLessThanEqualAndFechaFinGreaterThanEqual(hoy, hoy),
				promocionRepository.countByActivoTrueAndFechaInicioAfter(hoy),
				promocionRepository.countByFechaFinBefore(hoy),
				promocionRepository.countByDestacadaTrue());
	}

	public List<ServicioOpcionDTO> serviciosDisponibles() {
		return servicioRepository.findByActivoTrueOrderByNombreAsc().stream()
				.map(servicio -> new ServicioOpcionDTO(
						servicio.getId(), servicio.getNombre(), servicio.getCategoria()))
				.toList();
	}

	public PromocionDTO detalle(Long id) {
		return PromocionMapper.toDTO(obtener(id));
	}

	public Promocion obtener(Long id) {
		return promocionRepository.findById(id)
				.orElseThrow(() -> new NotFoundException("Promocion no encontrada con id " + id));
	}

	@Transactional
	public PromocionDTO crear(PromocionRequest request, MultipartFile imagen) {
		validar(request);
		Promocion promocion = new Promocion();
		aplicarDatos(promocion, request);
		aplicarImagen(promocion, imagen, Boolean.TRUE.equals(request.getQuitarImagen()));
		promocion.setFechaCreacion(LocalDateTime.now());
		promocion.setFechaActualizacion(LocalDateTime.now());
		Promocion guardada = promocionRepository.save(promocion);
		if (guardada.isActivo()) {
			notificar(guardada, "Nueva promocion disponible");
		}
		return PromocionMapper.toDTO(guardada);
	}

	@Transactional
	public PromocionDTO actualizar(Long id, PromocionRequest request, MultipartFile imagen) {
		validar(request);
		Promocion promocion = obtener(id);
		boolean estabaActiva = promocion.isActivo();
		aplicarDatos(promocion, request);
		aplicarImagen(promocion, imagen, Boolean.TRUE.equals(request.getQuitarImagen()));
		promocion.setFechaActualizacion(LocalDateTime.now());
		Promocion guardada = promocionRepository.save(promocion);
		if (!estabaActiva && guardada.isActivo()) {
			notificar(guardada, "Promocion activada");
		}
		return PromocionMapper.toDTO(guardada);
	}

	@Transactional
	public PromocionDTO cambiarActivo(Long id, boolean activo) {
		Promocion promocion = obtener(id);
		boolean estabaActiva = promocion.isActivo();
		promocion.setActivo(activo);
		promocion.setFechaActualizacion(LocalDateTime.now());
		Promocion guardada = promocionRepository.save(promocion);
		if (!estabaActiva && activo) {
			notificar(guardada, "Promocion activada");
		}
		return PromocionMapper.toDTO(guardada);
	}

	@Transactional
	public void eliminar(Long id) {
		Promocion promocion = obtener(id);
		promocionRepository.delete(promocion);
	}

	private void aplicarDatos(Promocion promocion, PromocionRequest request) {
		promocion.setTitulo(request.getTitulo().trim());
		promocion.setDescripcion(StringUtils.hasText(request.getDescripcion())
				? request.getDescripcion().trim()
				: null);
		promocion.setDescuento(request.getDescuento());
		promocion.setFechaInicio(request.getFechaInicio());
		promocion.setFechaFin(request.getFechaFin());
		if (request.getActivo() != null) {
			promocion.setActivo(request.getActivo());
		}
		if (request.getDestacada() != null) {
			promocion.setDestacada(request.getDestacada());
		}
		promocion.setServicio(request.getServicioId() == null
				? null
				: servicioRepository.findById(request.getServicioId())
						.orElseThrow(() -> new NotFoundException(
								"Servicio no encontrado con id " + request.getServicioId())));
	}

	private void aplicarImagen(Promocion promocion, MultipartFile archivo, boolean quitarImagen) {
		if (archivo != null && !archivo.isEmpty()) {
			if (archivo.getSize() > TAMANO_MAXIMO_IMAGEN) {
				throw new BusinessException("La imagen no debe superar los 5 MB");
			}
			String tipo = archivo.getContentType();
			if (tipo == null || !TIPOS_IMAGEN.contains(tipo.toLowerCase(Locale.ROOT))) {
				throw new BusinessException("Formato de imagen no permitido. Usa JPG, PNG, WEBP o GIF");
			}
			try {
				promocion.setImagen(archivo.getBytes());
			}
			catch (IOException ex) {
				throw new BusinessException("No se pudo leer la imagen enviada");
			}
			promocion.setImagenNombre(archivo.getOriginalFilename());
			promocion.setImagenTipo(tipo);
			return;
		}
		if (quitarImagen) {
			promocion.setImagen(null);
			promocion.setImagenNombre(null);
			promocion.setImagenTipo(null);
		}
	}

	private void validar(PromocionRequest request) {
		if (request == null || !StringUtils.hasText(request.getTitulo())) {
			throw new BusinessException("El titulo de la promocion es obligatorio");
		}
		if (request.getTitulo().trim().length() > 120) {
			throw new BusinessException("El titulo no debe superar los 120 caracteres");
		}
		if (request.getDescripcion() != null && request.getDescripcion().length() > 1000) {
			throw new BusinessException("La descripcion no debe superar los 1000 caracteres");
		}
		BigDecimal descuento = request.getDescuento();
		if (descuento == null
				|| descuento.compareTo(BigDecimal.ZERO) <= 0
				|| descuento.compareTo(BigDecimal.valueOf(100)) > 0) {
			throw new BusinessException("El descuento debe ser mayor que 0 y menor o igual a 100");
		}
		if (request.getFechaInicio() == null || request.getFechaFin() == null) {
			throw new BusinessException("Las fechas de inicio y fin son obligatorias");
		}
		if (request.getFechaFin().isBefore(request.getFechaInicio())) {
			throw new BusinessException("La fecha de fin no puede ser anterior a la fecha de inicio");
		}
	}

	private void notificar(Promocion promocion, String titulo) {
		String servicio = promocion.getServicio() == null
				? ""
				: " para " + promocion.getServicio().getNombre();
		String descuento = promocion.getDescuento() == null
				? ""
				: promocion.getDescuento().stripTrailingZeros().toPlainString() + "% de descuento";
		String mensaje = "\u00AB" + promocion.getTitulo() + "\u00BB" + servicio + ": " + descuento
				+ ". Vigente del " + FORMATO_FECHA.format(promocion.getFechaInicio())
				+ " al " + FORMATO_FECHA.format(promocion.getFechaFin()) + ".";
		notificacionService.crearParaTodos(titulo, mensaje,
				NotificacionService.TIPO_PROMOCION, "/promociones");
	}
}
