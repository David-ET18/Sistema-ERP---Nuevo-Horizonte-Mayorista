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

import com.example.demo.modulos.catalogo.dto.DestinoDetalleDTO;
import com.example.demo.modulos.catalogo.dto.DestinoRequest;
import com.example.demo.modulos.catalogo.entity.Destino;
import com.example.demo.modulos.catalogo.mapper.DestinoMapper;
import com.example.demo.modulos.catalogo.repository.DestinoRepository;
import com.example.demo.util.Specifications;
import com.example.demo.util.Textos;

import jakarta.persistence.criteria.Predicate;

@Service
@Transactional(readOnly = true)
public class DestinoService {

	private static final List<String> CAMPOS_BUSQUEDA = List.of("nombre", "pais");

	private final DestinoRepository destinoRepository;

	public DestinoService(DestinoRepository destinoRepository) {
		this.destinoRepository = destinoRepository;
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
		return destinoRepository.findPaises();
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
		return DestinoMapper.toDetalleDTO(destinoRepository.save(destino));
	}

	@Transactional
	public DestinoDetalleDTO actualizar(Long id, DestinoRequest request) {
		validarUnico(request, id);
		Destino destino = obtener(id);
		DestinoMapper.aplicar(destino, request);
		return DestinoMapper.toDetalleDTO(destinoRepository.save(destino));
	}

	/**
	 * Si el destino ya lo usan tarifas, paquetes u otros registros, la base
	 * rechaza el borrado; en ese caso se pide desactivarlo en vez de eliminarlo.
	 */
	@Transactional
	public void eliminar(Long id) {
		Destino destino = obtener(id);
		try {
			destinoRepository.delete(destino);
			destinoRepository.flush();
		}
		catch (DataIntegrityViolationException ex) {
			throw new ResponseStatusException(HttpStatus.CONFLICT,
					"El destino esta en uso (tarifas, paquetes u otros registros). Desactivalo en lugar de eliminarlo");
		}
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
