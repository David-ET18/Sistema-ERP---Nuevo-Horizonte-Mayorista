package com.example.demo.modulos.catalogo.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.modulos.catalogo.dto.DestinoDTO;
import com.example.demo.modulos.catalogo.mapper.DestinoMapper;
import com.example.demo.modulos.catalogo.repository.DestinoRepository;

/**
 * Dueño del catalogo base (destinos, servicios). Es transversal: lo consumen
 * cotizaciones, tarifas y paquetes, por eso vive en su propio modulo.
 */
@Service
@Transactional(readOnly = true)
public class CatalogoService {

	private final DestinoRepository destinoRepository;

	public CatalogoService(DestinoRepository destinoRepository) {
		this.destinoRepository = destinoRepository;
	}

	public List<DestinoDTO> listarDestinos() {
		return destinoRepository.findAllByOrderByNombreAsc().stream()
				.map(DestinoMapper::toDTO)
				.toList();
	}
}
