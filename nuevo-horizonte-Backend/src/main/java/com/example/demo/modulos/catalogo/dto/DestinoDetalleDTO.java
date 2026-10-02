package com.example.demo.modulos.catalogo.dto;

import java.time.LocalDateTime;

public record DestinoDetalleDTO(
		Long id,
		String nombre,
		String pais,
		String descripcion,
		boolean activo,
		LocalDateTime fechaCreacion) {
}
