package com.example.demo.modulos.paquetes.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.exception.NotFoundException;
import com.example.demo.modulos.paquetes.dto.PaqueteDTO;
import com.example.demo.modulos.paquetes.entity.Paquete;
import com.example.demo.modulos.paquetes.mapper.PaqueteMapper;
import com.example.demo.modulos.paquetes.repository.PaqueteRepository;

/**
 * Dueno de los paquetes. Otros modulos consumen esta service
 * en lugar de acceder directamente a PaqueteRepository.
 */
@Service
@Transactional(readOnly = true)
public class PaqueteService {

	private final PaqueteRepository paqueteRepository;

	public PaqueteService(PaqueteRepository paqueteRepository) {
		this.paqueteRepository = paqueteRepository;
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
}
