package com.example.demo.modulos.gestionAgencias.dto;

import java.time.LocalDateTime;

public record AgenciaDetalleDTO(
		Long id,
		String razonSocial,
		String nombreComercial,
		String ruc,
		String categoria,
		String contactoNombre,
		String contactoTelefono,
		String contactoEmail,
		String ciudad,
		String ejecutivoAsignado,
		String logoUrl,
		boolean esPrioritaria,
		boolean activo,
		LocalDateTime fechaCreacion) {
}
