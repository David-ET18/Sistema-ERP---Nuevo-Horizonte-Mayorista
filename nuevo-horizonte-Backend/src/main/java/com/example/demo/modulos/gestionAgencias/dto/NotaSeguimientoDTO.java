package com.example.demo.modulos.gestionAgencias.dto;

import java.time.LocalDateTime;

public record NotaSeguimientoDTO(
		Long id,
		String tipo,
		String notas,
		String usuario,
		LocalDateTime fecha) {
}
