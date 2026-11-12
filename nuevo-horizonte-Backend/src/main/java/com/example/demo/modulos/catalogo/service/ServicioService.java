package com.example.demo.modulos.catalogo.service;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import com.example.demo.modulos.catalogo.dto.ServicioDetalleDTO;
import com.example.demo.modulos.catalogo.dto.ServicioRequest;
import com.example.demo.modulos.catalogo.entity.Servicio;
import com.example.demo.modulos.catalogo.mapper.ServicioMapper;
import com.example.demo.modulos.catalogo.repository.ServicioRepository;
import com.example.demo.modulos.notificaciones.service.NotificacionService;
import com.example.demo.util.Specifications;
import com.example.demo.util.Textos;

import jakarta.persistence.criteria.Predicate;

@Service
@Transactional(readOnly = true)
public class ServicioService {

	private static final List<String> CAMPOS_BUSQUEDA = List.of("nombre", "categoria");

	/**
	 * Lista base de categorias que se ofrece en el formulario de servicios.
	 * Las categorias que ya existan en la base se suman automaticamente.
	 */
	private static final List<String> CATEGORIAS_PREDETERMINADAS = List.of(
			"Aéreo", "Alquiler de autos", "Asistencia al viajero", "Cruceros", "Entradas y atracciones",
			"Excursiones", "Gastronomía", "Hotel", "Marítimo", "Paquetes", "Seguro de viaje",
			"Terrestre", "Tour", "Traslado", "Tren", "Otros");

	private final ServicioRepository servicioRepository;
	private final NotificacionService notificacionService;

	public ServicioService(ServicioRepository servicioRepository, NotificacionService notificacionService) {
		this.servicioRepository = servicioRepository;
		this.notificacionService = notificacionService;
	}

	public Page<ServicioDetalleDTO> listar(String q, String categoria, Boolean activo, Pageable pageable) {
		Specification<Servicio> spec = (root, query, cb) -> {
			List<Predicate> predicates = new ArrayList<>();
			if (StringUtils.hasText(q)) {
				predicates.add(Specifications.algunoContiene(cb, root, q, CAMPOS_BUSQUEDA));
			}
			if (StringUtils.hasText(categoria)) {
				predicates.add(cb.equal(cb.lower(root.get("categoria")), categoria.trim().toLowerCase(Locale.ROOT)));
			}
			if (activo != null) {
				predicates.add(cb.equal(root.get("activo"), activo));
			}
			return predicates.isEmpty() ? cb.conjunction() : cb.and(predicates.toArray(new Predicate[0]));
		};
		return servicioRepository.findAll(spec, pageable).map(ServicioMapper::toDetalleDTO);
	}

	public List<String> categorias() {
		return combinarConExistentes(CATEGORIAS_PREDETERMINADAS, servicioRepository.findCategorias());
	}

	private static List<String> combinarConExistentes(List<String> predeterminadas, List<String> existentes) {
		List<String> resultado = new ArrayList<>(predeterminadas);
		Set<String> vistos = predeterminadas.stream()
				.map(valor -> valor.toLowerCase(Locale.ROOT))
				.collect(Collectors.toCollection(LinkedHashSet::new));
		existentes.stream()
				.filter(StringUtils::hasText)
				.map(String::trim)
				.sorted(String.CASE_INSENSITIVE_ORDER)
				.forEach(valor -> {
					if (vistos.add(valor.toLowerCase(Locale.ROOT))) {
						resultado.add(valor);
					}
				});
		return resultado;
	}

	public ServicioDetalleDTO detalle(Long id) {
		return ServicioMapper.toDetalleDTO(obtener(id));
	}

	public Servicio obtener(Long id) {
		return servicioRepository.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Servicio no encontrado"));
	}

	@Transactional
	public ServicioDetalleDTO crear(ServicioRequest request) {
		validarUnico(request, null);
		Servicio servicio = new Servicio();
		ServicioMapper.aplicar(servicio, request);
		Servicio guardado = servicioRepository.save(servicio);
		notificar("Nuevo servicio: " + guardado.getNombre(),
				"Se creó el servicio " + guardado.getNombre() + " (" + guardado.getCategoria() + ").",
				"Categoría: " + guardado.getCategoria() + " · Estado: "
						+ (guardado.isActivo() ? "activo" : "inactivo"));
		return ServicioMapper.toDetalleDTO(guardado);
	}

	@Transactional
	public ServicioDetalleDTO actualizar(Long id, ServicioRequest request) {
		validarUnico(request, id);
		Servicio servicio = obtener(id);
		ServicioMapper.aplicar(servicio, request);
		Servicio guardado = servicioRepository.save(servicio);
		notificar("Servicio actualizado: " + guardado.getNombre(),
				"Se actualizó el servicio " + guardado.getNombre() + " (" + guardado.getCategoria() + ").",
				"Categoría: " + guardado.getCategoria() + " · Estado: "
						+ (guardado.isActivo() ? "activo" : "inactivo"));
		return ServicioMapper.toDetalleDTO(guardado);
	}

	/**
	 * Si el servicio ya lo usan tarifas u otros registros, la base rechaza el
	 * borrado; en ese caso se pide desactivarlo en vez de eliminarlo.
	 */
	@Transactional
	public void eliminar(Long id) {
		Servicio servicio = obtener(id);
		String nombre = servicio.getNombre();
		String categoria = servicio.getCategoria();
		try {
			servicioRepository.delete(servicio);
			servicioRepository.flush();
			notificar("Servicio eliminado: " + nombre,
					"Se eliminó el servicio " + nombre + " (" + categoria + ").",
					"Categoría: " + categoria);
		}
		catch (DataIntegrityViolationException ex) {
			throw new ResponseStatusException(HttpStatus.CONFLICT,
					"El servicio esta en uso (tarifas u otros registros). Desactivalo en lugar de eliminarlo");
		}
	}

	private void notificar(String titulo, String mensaje, String detalle) {
		notificacionService.crearParaUsuariosActivos(titulo, mensaje,
				NotificacionService.TIPO_CATALOGO, "/catalogo",
				notificacionService.actorActual(), detalle);
	}

	private void validarUnico(ServicioRequest request, Long idExcluido) {
		String nombre = Textos.sinEspacios(request.nombre());
		boolean existe = (idExcluido == null)
				? servicioRepository.existsByNombreIgnoreCase(nombre)
				: servicioRepository.existsByNombreIgnoreCaseAndIdNot(nombre, idExcluido);
		if (existe) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe el servicio " + nombre);
		}
	}
}
