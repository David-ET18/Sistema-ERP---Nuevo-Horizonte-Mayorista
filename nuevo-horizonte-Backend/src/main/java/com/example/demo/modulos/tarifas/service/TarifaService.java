package com.example.demo.modulos.tarifas.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.exception.NotFoundException;
import com.example.demo.modulos.tarifas.dto.TarifaDTO;
import com.example.demo.modulos.tarifas.entity.Tarifa;
import com.example.demo.modulos.tarifas.mapper.TarifaMapper;
import com.example.demo.modulos.tarifas.repository.TarifaRepository;

/**
 * Dueño de las tarifas. Otros modulos consumen esta service
 * en lugar de acceder directamente a TarifaRepository.
 */
@Service
@Transactional(readOnly = true)
public class TarifaService {

	private final TarifaRepository tarifaRepository;

	public TarifaService(TarifaRepository tarifaRepository) {
		this.tarifaRepository = tarifaRepository;
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
}
