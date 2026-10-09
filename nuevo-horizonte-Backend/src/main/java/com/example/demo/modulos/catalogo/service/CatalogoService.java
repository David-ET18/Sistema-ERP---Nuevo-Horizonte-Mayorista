package com.example.demo.modulos.catalogo.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.modulos.catalogo.dto.DestinoDTO;
import com.example.demo.modulos.catalogo.dto.KpiCatalogoDTO;
import com.example.demo.modulos.catalogo.dto.ServicioDTO;
import com.example.demo.modulos.catalogo.mapper.DestinoMapper;
import com.example.demo.modulos.catalogo.mapper.ServicioMapper;
import com.example.demo.modulos.catalogo.repository.DestinoRepository;
import com.example.demo.modulos.catalogo.repository.ServicioRepository;

/**
 * Lectura del catalogo base para los selects de otros modulos (cotizaciones,
 * tarifas, paquetes). Solo ofrece registros activos; la administracion
 * (alta, edicion y baja) vive en DestinoService y ServicioService.
 */
@Service
@Transactional(readOnly = true)
public class CatalogoService {

	private final DestinoRepository destinoRepository;
	private final ServicioRepository servicioRepository;

	public CatalogoService(DestinoRepository destinoRepository, ServicioRepository servicioRepository) {
		this.destinoRepository = destinoRepository;
		this.servicioRepository = servicioRepository;
	}

	public List<DestinoDTO> listarDestinos() {
		return destinoRepository.findByActivoTrueOrderByNombreAsc().stream()
				.map(DestinoMapper::toDTO)
				.toList();
	}

	public List<ServicioDTO> listarServicios() {
		return servicioRepository.findByActivoTrueOrderByNombreAsc().stream()
				.map(ServicioMapper::toDTO)
				.toList();
	}

	public KpiCatalogoDTO kpis() {
		return new KpiCatalogoDTO(
				destinoRepository.count(), destinoRepository.countByActivoTrue(),
				servicioRepository.count(), servicioRepository.countByActivoTrue());
	}

}
