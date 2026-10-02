package com.example.demo.modulos.catalogo.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

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
import com.example.demo.util.Specifications;
import com.example.demo.util.Textos;

import jakarta.persistence.criteria.Predicate;

@Service
@Transactional(readOnly = true)
public class ServicioService {

	private static final List<String> CAMPOS_BUSQUEDA = List.of("nombre", "categoria");

	private final ServicioRepository servicioRepository;

	public ServicioService(ServicioRepository servicioRepository) {
		this.servicioRepository = servicioRepository;
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
		return servicioRepository.findCategorias();
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
		return ServicioMapper.toDetalleDTO(servicioRepository.save(servicio));
	}

	@Transactional
	public ServicioDetalleDTO actualizar(Long id, ServicioRequest request) {
		validarUnico(request, id);
		Servicio servicio = obtener(id);
		ServicioMapper.aplicar(servicio, request);
		return ServicioMapper.toDetalleDTO(servicioRepository.save(servicio));
	}

	/**
	 * Si el servicio ya lo usan tarifas u otros registros, la base rechaza el
	 * borrado; en ese caso se pide desactivarlo en vez de eliminarlo.
	 */
	@Transactional
	public void eliminar(Long id) {
		Servicio servicio = obtener(id);
		try {
			servicioRepository.delete(servicio);
			servicioRepository.flush();
		}
		catch (DataIntegrityViolationException ex) {
			throw new ResponseStatusException(HttpStatus.CONFLICT,
					"El servicio esta en uso (tarifas u otros registros). Desactivalo en lugar de eliminarlo");
		}
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
