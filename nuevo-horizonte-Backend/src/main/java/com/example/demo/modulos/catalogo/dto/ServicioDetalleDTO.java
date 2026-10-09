package com.example.demo.modulos.catalogo.dto;

import java.time.LocalDateTime;

public record ServicioDetalleDTO(
		Long id,
		String nombre,
		String categoria,
		String descripcion,
		boolean activo,
		LocalDateTime fechaCreacion) {
}
