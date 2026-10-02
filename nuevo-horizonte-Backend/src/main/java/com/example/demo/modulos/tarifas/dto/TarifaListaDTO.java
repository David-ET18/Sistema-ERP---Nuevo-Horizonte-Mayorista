package com.example.demo.modulos.tarifas.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record TarifaListaDTO(
		Long id,
		String proveedor,
		String servicio,
		String destino,
		BigDecimal precio,
		String moneda,
		LocalDate fechaDesde,
		LocalDate fechaHasta,
		/** VIGENTE | POR_VENCER | VENCIDA (calculado, no se guarda). */
		String estado,
		LocalDateTime fechaActualizacion) {
}
