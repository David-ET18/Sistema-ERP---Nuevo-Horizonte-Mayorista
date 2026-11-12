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

import com.example.demo.modulos.catalogo.dto.DestinoDetalleDTO;
import com.example.demo.modulos.catalogo.dto.DestinoRequest;
import com.example.demo.modulos.catalogo.entity.Destino;
import com.example.demo.modulos.catalogo.mapper.DestinoMapper;
import com.example.demo.modulos.catalogo.repository.DestinoRepository;
import com.example.demo.modulos.notificaciones.service.NotificacionService;
import com.example.demo.util.Specifications;
import com.example.demo.util.Textos;

import jakarta.persistence.criteria.Predicate;

@Service
@Transactional(readOnly = true)
public class DestinoService {

	private static final List<String> CAMPOS_BUSQUEDA = List.of("nombre", "pais");

	/**
	 * Lista base de paises que se ofrece en el formulario de destinos. Los
	 * valores que ya existan en la base se suman automaticamente para no
	 * romper registros historicos.
	 */
	private static final List<String> PAISES_PREDETERMINADOS = List.of(
			"Alemania", "Argentina", "Australia", "Austria", "Bélgica", "Bolivia", "Brasil",
			"Canadá", "Chile", "China", "Colombia", "Corea del Sur", "Costa Rica", "Croacia",
			"Cuba", "Dinamarca", "Ecuador", "Egipto", "El Salvador", "Emiratos Árabes Unidos",
			"Escocia", "Eslovaquia", "Eslovenia", "España", "Estados Unidos", "Estonia",
			"Filipinas", "Finlandia", "Francia", "Grecia", "Guatemala", "Honduras", "Hungría",
			"India", "Indonesia", "Irlanda", "Islandia", "Israel", "Italia", "Jamaica", "Japón",
			"Kenia", "Malasia", "Marruecos", "México", "Nicaragua", "Noruega", "Nueva Zelanda",
			"Países Bajos", "Panamá", "Paraguay", "Perú", "Polonia", "Portugal",
			"Reino Unido", "República Checa", "República Dominicana", "Rumanía", "Rusia",
			"Singapur", "Sudáfrica", "Suecia", "Suiza", "Tailandia", "Turquía", "Ucrania",
			"Uruguay", "Venezuela", "Vietnam");

	private final DestinoRepository destinoRepository;
	private final NotificacionService notificacionService;

	public DestinoService(DestinoRepository destinoRepository, NotificacionService notificacionService) {
		this.destinoRepository = destinoRepository;
		this.notificacionService = notificacionService;
	}

	public Page<DestinoDetalleDTO> listar(String q, String pais, Boolean activo, Pageable pageable) {
		Specification<Destino> spec = (root, query, cb) -> {
			List<Predicate> predicates = new ArrayList<>();
			if (StringUtils.hasText(q)) {
				predicates.add(Specifications.algunoContiene(cb, root, q, CAMPOS_BUSQUEDA));
			}
			if (StringUtils.hasText(pais)) {
				predicates.add(cb.equal(cb.lower(root.get("pais")), pais.trim().toLowerCase(Locale.ROOT)));
			}
			if (activo != null) {
				predicates.add(cb.equal(root.get("activo"), activo));
			}
			return predicates.isEmpty() ? cb.conjunction() : cb.and(predicates.toArray(new Predicate[0]));
		};
		return destinoRepository.findAll(spec, pageable).map(DestinoMapper::toDetalleDTO);
	}

	public List<String> paises() {
		return combinarConExistentes(PAISES_PREDETERMINADOS, destinoRepository.findPaises());
	}

	private static List<String> combinarConExistentes(List<String> predeterminados, List<String> existentes) {
		List<String> resultado = new ArrayList<>(predeterminados);
		Set<String> vistos = predeterminados.stream()
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

	public DestinoDetalleDTO detalle(Long id) {
		return DestinoMapper.toDetalleDTO(obtener(id));
	}

	public Destino obtener(Long id) {
		return destinoRepository.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Destino no encontrado"));
	}

	@Transactional
	public DestinoDetalleDTO crear(DestinoRequest request) {
		validarUnico(request, null);
		Destino destino = new Destino();
		DestinoMapper.aplicar(destino, request);
		Destino guardado = destinoRepository.save(destino);
		notificar("Nuevo destino: " + guardado.getNombre(),
				"Se creó el destino " + guardado.getNombre() + " (" + guardado.getPais() + ").",
				"País: " + guardado.getPais() + " · Estado: "
						+ (guardado.isActivo() ? "activo" : "inactivo"));
		return DestinoMapper.toDetalleDTO(guardado);
	}

	@Transactional
	public DestinoDetalleDTO actualizar(Long id, DestinoRequest request) {
		validarUnico(request, id);
		Destino destino = obtener(id);
		DestinoMapper.aplicar(destino, request);
		Destino guardado = destinoRepository.save(destino);
		notificar("Destino actualizado: " + guardado.getNombre(),
				"Se actualizó el destino " + guardado.getNombre() + " (" + guardado.getPais() + ").",
				"País: " + guardado.getPais() + " · Estado: "
						+ (guardado.isActivo() ? "activo" : "inactivo"));
		return DestinoMapper.toDetalleDTO(guardado);
	}

	/**
	 * Si el destino ya lo usan tarifas, paquetes u otros registros, la base
	 * rechaza el borrado; en ese caso se pide desactivarlo en vez de eliminarlo.
	 */
	@Transactional
	public void eliminar(Long id) {
		Destino destino = obtener(id);
		String nombre = destino.getNombre();
		String pais = destino.getPais();
		try {
			destinoRepository.delete(destino);
			destinoRepository.flush();
			notificar("Destino eliminado: " + nombre,
					"Se eliminó el destino " + nombre + " (" + pais + ").",
					"País: " + pais);
		}
		catch (DataIntegrityViolationException ex) {
			throw new ResponseStatusException(HttpStatus.CONFLICT,
					"El destino esta en uso (tarifas, paquetes u otros registros). Desactivalo en lugar de eliminarlo");
		}
	}

	private void notificar(String titulo, String mensaje, String detalle) {
		notificacionService.crearParaUsuariosActivos(titulo, mensaje,
				NotificacionService.TIPO_CATALOGO, "/catalogo",
				notificacionService.actorActual(), detalle);
	}

	private void validarUnico(DestinoRequest request, Long idExcluido) {
		String nombre = Textos.sinEspacios(request.nombre());
		String pais = Textos.sinEspacios(request.pais());
		boolean existe = (idExcluido == null)
				? destinoRepository.existsByNombreIgnoreCaseAndPaisIgnoreCase(nombre, pais)
				: destinoRepository.existsByNombreIgnoreCaseAndPaisIgnoreCaseAndIdNot(nombre, pais, idExcluido);
		if (existe) {
			throw new ResponseStatusException(HttpStatus.CONFLICT,
					"Ya existe el destino " + nombre + " en " + pais);
		}
	}
}
