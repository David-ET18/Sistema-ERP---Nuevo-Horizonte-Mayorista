package com.example.demo.modulos.paquetes.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import com.example.demo.exception.NotFoundException;
import com.example.demo.modulos.catalogo.dto.DestinoDTO;
import com.example.demo.modulos.catalogo.entity.Destino;
import com.example.demo.modulos.catalogo.mapper.DestinoMapper;
import com.example.demo.modulos.catalogo.repository.DestinoRepository;
import com.example.demo.modulos.paquetes.dto.KpiPaquetesDTO;
import com.example.demo.modulos.paquetes.dto.PaqueteDTO;
import com.example.demo.modulos.paquetes.dto.PaqueteDetalleDTO;
import com.example.demo.modulos.paquetes.dto.PaqueteListaDTO;
import com.example.demo.modulos.paquetes.dto.PaqueteRequest;
import com.example.demo.modulos.paquetes.entity.Paquete;
import com.example.demo.modulos.paquetes.mapper.PaqueteMapper;
import com.example.demo.modulos.paquetes.repository.PaqueteRepository;
import com.example.demo.util.Specifications;

import jakarta.persistence.criteria.Predicate;

/**
 * Dueno de los paquetes. Otros modulos consumen esta service
 * en lugar de acceder directamente a PaqueteRepository.
 */
@Service
@Transactional(readOnly = true)
public class PaqueteService {

	private static final List<String> CAMPOS_BUSQUEDA = List.of("nombre", "categoria");

	private final PaqueteRepository paqueteRepository;
	private final DestinoRepository destinoRepository;

	public PaqueteService(PaqueteRepository paqueteRepository, DestinoRepository destinoRepository) {
		this.paqueteRepository = paqueteRepository;
		this.destinoRepository = destinoRepository;
	}

	public List<PaqueteDTO> listarActivos() {
		return paqueteRepository.findActivos().stream()
				.map(PaqueteMapper::toDTO)
				.toList();
	}

	public Paquete obtener(Long id) {
		return paqueteRepository.findById(id)
				.orElseThrow(() -> new NotFoundException("Producto no encontrado con id " + id));
	}

	public Page<PaqueteListaDTO> listar(String q, String categoria, String estado, Boolean destacado,
			Long destinoId, Pageable pageable) {
		Specification<Paquete> spec = construirFiltros(q, categoria, estado, destacado, destinoId);
		return paqueteRepository.findAll(spec, pageable).map(PaqueteMapper::toListaDTO);
	}

	public KpiPaquetesDTO kpis() {
		return new KpiPaquetesDTO(
				paqueteRepository.countByEstado("ACTIVO"),
				paqueteRepository.countByEstado("BORRADOR"),
				paqueteRepository.countByDestacadoTrue());
	}

	public List<String> categorias() {
		return paqueteRepository.findCategorias();
	}

	public List<String> monedas() {
		return PaqueteMapper.MONEDAS;
	}

	public List<String> opcionesIncluye() {
		return PaqueteMapper.OPCIONES_INCLUYE;
	}

	public List<String> aerolineasSugeridas() {
		return PaqueteMapper.AEROLINEAS_SUGERIDAS;
	}

	public List<DestinoDTO> destinos() {
		return destinoRepository.findByActivoTrueOrderByNombreAsc().stream()
				.map(DestinoMapper::toDTO)
				.toList();
	}

	public PaqueteDetalleDTO detalle(Long id) {
		return PaqueteMapper.toDetalleDTO(obtener(id));
	}

	@Transactional
	public PaqueteDetalleDTO crear(PaqueteRequest request) {
		validarNombre(request.nombre(), null);
		Paquete paquete = new Paquete();
		PaqueteMapper.aplicar(paquete, request, resolverDestino(request.destinoId()));
		sincronizarHijos(paquete, request);
		return PaqueteMapper.toDetalleDTO(paqueteRepository.save(paquete));
	}

	@Transactional
	public PaqueteDetalleDTO actualizar(Long id, PaqueteRequest request) {
		validarNombre(request.nombre(), id);
		Paquete paquete = obtener(id);
		PaqueteMapper.aplicar(paquete, request, resolverDestino(request.destinoId()));
		sincronizarHijos(paquete, request);
		return PaqueteMapper.toDetalleDTO(paqueteRepository.save(paquete));
	}

	@Transactional
	public void eliminar(Long id) {
		paqueteRepository.delete(obtener(id));
	}

	/**
	 * Reemplaza vuelos y opciones por los que vienen en el request. Al ser
	 * colecciones con orphanRemoval, limpiar + volver a agregar es mas simple
	 * y seguro que tratar de hacer diff elemento por elemento.
	 */
	private void sincronizarHijos(Paquete paquete, PaqueteRequest request) {
		paquete.getVuelos().clear();
		if (request.vuelos() != null) {
			int orden = 0;
			for (var vueloRequest : request.vuelos()) {
				paquete.getVuelos().add(PaqueteMapper.nuevoVuelo(paquete, vueloRequest, orden++));
			}
		}

		paquete.getOpciones().clear();
		if (request.opciones() != null) {
			int orden = 0;
			for (var opcionRequest : request.opciones()) {
				paquete.getOpciones().add(PaqueteMapper.nuevaOpcion(paquete, opcionRequest, orden++));
			}
		}
	}

	private Destino resolverDestino(Long destinoId) {
		return destinoRepository.findById(destinoId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Destino no encontrado"));
	}

	private void validarNombre(String nombre, Long idExcluido) {
		boolean existe = (idExcluido == null)
				? paqueteRepository.existsByNombre(nombre)
				: paqueteRepository.existsByNombreAndIdNot(nombre, idExcluido);
		if (existe) {
			throw new ResponseStatusException(HttpStatus.CONFLICT,
					"Ya existe un paquete con el titulo " + nombre);
		}
	}

	private Specification<Paquete> construirFiltros(String q, String categoria, String estado, Boolean destacado,
			Long destinoId) {
		return (root, query, cb) -> {
			List<Predicate> predicates = new ArrayList<>();

			if (StringUtils.hasText(q)) {
				predicates.add(Specifications.algunoContiene(cb, root, q, CAMPOS_BUSQUEDA));
			}
			if (StringUtils.hasText(categoria)) {
				predicates.add(Specifications.igual(cb, root.get("categoria"), categoria));
			}
			if (StringUtils.hasText(estado)) {
				predicates.add(cb.equal(root.get("estado"), estado));
			}
			if (destacado != null) {
				predicates.add(cb.equal(root.get("destacado"), destacado));
			}
			if (destinoId != null) {
				predicates.add(cb.equal(root.get("destino").get("id"), destinoId));
			}

			return predicates.isEmpty() ? cb.conjunction() : cb.and(predicates.toArray(new Predicate[0]));
		};
	}
}
