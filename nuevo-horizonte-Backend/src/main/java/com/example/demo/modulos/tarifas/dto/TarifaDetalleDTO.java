package com.example.demo.modulos.tarifas.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record TarifaDetalleDTO(
		Long id,
		Long proveedorId,
		String proveedor,
		Long servicioId,
		String servicio,
		Long destinoId,
		String destino,
		String tipoTarifa,
		BigDecimal precio,
		String moneda,
		LocalDate fechaDesde,
		LocalDate fechaHasta,
		String condiciones,
		String observaciones,
		String archivoRespaldoUrl,
		String estado,
		List<TarifaHistorialDTO> historial,
		LocalDateTime fechaCreacion,
		LocalDateTime fechaActualizacion) {
}
