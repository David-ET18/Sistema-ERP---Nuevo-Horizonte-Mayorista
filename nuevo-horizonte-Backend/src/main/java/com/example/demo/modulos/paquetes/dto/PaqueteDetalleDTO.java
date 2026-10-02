package com.example.demo.modulos.paquetes.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

public record PaqueteDetalleDTO(
		Long id,
		String nombre,
		String descripcion,
		Long destinoId,
		String destino,
		LocalDate fechaInicioViaje,
		LocalDate fechaFinViaje,
		LocalDate fechaCierreVenta,
		String categoria,
		String moneda,
		BigDecimal precioDesde,
		String duracionTexto,
		boolean destacado,
		String estado,
		Set<String> aliados,
		List<PaqueteVueloDTO> vuelos,
		List<PaqueteOpcionDTO> opciones,
		LocalDateTime fechaCreacion,
		LocalDateTime fechaActualizacion) {
}
