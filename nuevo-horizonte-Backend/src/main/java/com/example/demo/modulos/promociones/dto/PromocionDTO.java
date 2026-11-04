package com.example.demo.modulos.promociones.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Vista de tarjeta/lista de una promocion. No incluye los bytes de la imagen:
 * el frontend consume /api/promociones/{id}/imagen.
 */
public record PromocionDTO(
		Long id,
		String nombre,
		String descripcion,
		BigDecimal descuentoPorcentaje,
		BigDecimal precioOriginal,
		BigDecimal precioPromocional,
		LocalDate fechaInicio,
		LocalDate fechaFin,
		boolean destacada,
		boolean activa,
		Long servicioId,
		String servicioNombre,
		boolean tieneImagen,
		String estadoVigencia,
		LocalDateTime fechaCreacion,
		LocalDateTime fechaActualizacion) {
}
