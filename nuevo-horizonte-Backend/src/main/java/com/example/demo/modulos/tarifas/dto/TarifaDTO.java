package com.example.demo.modulos.tarifas.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record TarifaDTO(
		Long id,
		String servicio,
		String destino,
		Long destinoId,
		String proveedor,
		BigDecimal precio,
		String moneda,
		LocalDate fechaDesde,
		LocalDate fechaHasta) {
}