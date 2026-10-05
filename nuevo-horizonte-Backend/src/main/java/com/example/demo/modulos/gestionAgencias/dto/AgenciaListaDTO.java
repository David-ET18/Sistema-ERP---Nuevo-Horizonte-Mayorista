package com.example.demo.modulos.gestionAgencias.dto;

import java.time.LocalDateTime;

public record AgenciaListaDTO(
		Long id,
		String razonSocial,
		String nombreComercial,
		String ruc,
		String categoria,
		String contactoNombre,
		String contactoEmail,
		String logoUrl,
		boolean esPrioritaria,
		boolean activo,
		LocalDateTime fechaCreacion) {
}
