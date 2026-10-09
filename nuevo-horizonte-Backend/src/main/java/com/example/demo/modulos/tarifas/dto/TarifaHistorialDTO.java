package com.example.demo.modulos.tarifas.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record TarifaHistorialDTO(
		BigDecimal precioAnterior,
		BigDecimal precioNuevo,
		LocalDateTime fechaCambio,
		String usuarioCambio) {
}
