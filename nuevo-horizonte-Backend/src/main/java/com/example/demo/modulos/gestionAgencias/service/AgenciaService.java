package com.example.demo.modulos.gestionAgencias.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import com.example.demo.modulos.gestionAgencias.dto.AgenciaDTO;
import com.example.demo.modulos.gestionAgencias.dto.AgenciaDetalleDTO;
import com.example.demo.modulos.gestionAgencias.dto.AgenciaListaDTO;
import com.example.demo.modulos.gestionAgencias.dto.AgenciaRequest;
import com.example.demo.modulos.gestionAgencias.dto.KpiAgenciasDTO;
import com.example.demo.modulos.gestionAgencias.entity.Agencia;
import com.example.demo.modulos.gestionAgencias.mapper.AgenciaMapper;
import com.example.demo.modulos.gestionAgencias.repository.AgenciaRepository;
import com.example.demo.util.Specifications;

import jakarta.persistence.criteria.Predicate;

@Service
@Transactional(readOnly = true)
public class AgenciaService {

	private static final List<String> CAMPOS_BUSQUEDA =
			List.of("razonSocial", "nombreComercial", "ruc", "contactoNombre");

	private final AgenciaRepository agenciaRepository;

	public AgenciaService(AgenciaRepository agenciaRepository) {
		this.agenciaRepository = agenciaRepository;
	}

	public Page<AgenciaListaDTO> listar(String q, String categoria, Boolean activo,
			Boolean soloPrioritarias, Pageable pageable) {
		Specification<Agencia> spec = construirFiltros(q, categoria, activo, soloPrioritarias);
		return agenciaRepository.findAll(spec, pageable).map(AgenciaMapper::toListaDTO);
	}

	public KpiAgenciasDTO kpis() {
		return new KpiAgenciasDTO(
				agenciaRepository.count(),
				agenciaRepository.countByActivoTrue(),
				agenciaRepository.countByEsPrioritariaTrue(),
				agenciaRepository.countRegistradasEsteMes());
	}

	public List<String> categorias() {
		return agenciaRepository.findCategorias();
	}

	public List<AgenciaListaDTO> listarActivas() {
		return agenciaRepository.findByActivoTrueOrderByNombreComercialAsc().stream()
				.map(AgenciaMapper::toListaDTO)
				.toList();
	}

	/**
	 * Version resumida que consumen cotizaciones y ventas.
	 */
	public List<AgenciaDTO> listarActivasRef() {
		return agenciaRepository.findByActivoTrueOrderByNombreComercialAsc().stream()
				.map(AgenciaMapper::toRefDTO)
				.toList();
	}

	public AgenciaDetalleDTO detalle(Long id) {
		return AgenciaMapper.toDetalleDTO(obtener(id));
	}

	/**
	 * Entidad completa, para que otros modulos resuelvan la relacion sin
	 * conocer la tabla de agencias.
	 */
	public Agencia obtener(Long id) {
		return agenciaRepository.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
						"Agencia no encontrada"));
	}

	@Transactional
	public AgenciaDetalleDTO crear(AgenciaRequest request) {
		validarRuc(request.ruc(), null);
		Agencia agencia = new Agencia();
		AgenciaMapper.aplicar(agencia, request);
		return AgenciaMapper.toDetalleDTO(agenciaRepository.save(agencia));
	}

	@Transactional
	public AgenciaDetalleDTO actualizar(Long id, AgenciaRequest request) {
		validarRuc(request.ruc(), id);
		Agencia agencia = obtener(id);
		AgenciaMapper.aplicar(agencia, request);
		return AgenciaMapper.toDetalleDTO(agenciaRepository.save(agencia));
	}

	@Transactional
	public void eliminar(Long id) {
		agenciaRepository.delete(obtener(id));
	}

	@Transactional
	public String actualizarLogo(Long id, String nombreArchivo) {
		Agencia agencia = obtener(id);
		agencia.setLogoUrl(nombreArchivo);
		agenciaRepository.save(agencia);
		return nombreArchivo;
	}

	private void validarRuc(String ruc, Long idExcluido) {
		boolean existe = (idExcluido == null)
				? agenciaRepository.existsByRuc(ruc)
				: agenciaRepository.existsByRucAndIdNot(ruc, idExcluido);
		if (existe) {
			throw new ResponseStatusException(HttpStatus.CONFLICT,
					"Ya existe una agencia registrada con el RUC " + ruc);
		}
	}

	private Specification<Agencia> construirFiltros(String q, String categoria, Boolean activo,
			Boolean soloPrioritarias) {
		return (root, query, cb) -> {
			List<Predicate> predicates = new ArrayList<>();

			if (StringUtils.hasText(q)) {
				predicates.add(Specifications.algunoContiene(cb, root, q, CAMPOS_BUSQUEDA));
			}
			if (StringUtils.hasText(categoria)) {
				predicates.add(cb.equal(cb.lower(root.get("categoria")),
						categoria.trim().toLowerCase(Locale.ROOT)));
			}
			if (activo != null) {
				predicates.add(cb.equal(root.get("activo"), activo));
			}
			if (Boolean.TRUE.equals(soloPrioritarias)) {
				predicates.add(cb.isTrue(root.get("esPrioritaria")));
			}

			return predicates.isEmpty() ? cb.conjunction() : cb.and(predicates.toArray(new Predicate[0]));
		};
	}
}
