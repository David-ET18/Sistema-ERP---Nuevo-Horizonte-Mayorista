package com.example.demo.modulos.promociones.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record PromocionDTO(
		Long id,
		String titulo,
		String descripcion,
		BigDecimal descuento,
		LocalDate fechaInicio,
		LocalDate fechaFin,
		boolean activo,
		boolean destacada,
		Long servicioId,
		String servicioNombre,
		String servicioCategoria,
		String imagenUrl,
		String imagenNombre,
		String estado,
		LocalDateTime fechaCreacion,
		LocalDateTime fechaActualizacion) {
}
