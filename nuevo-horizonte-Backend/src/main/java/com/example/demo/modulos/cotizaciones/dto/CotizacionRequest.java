package com.example.demo.modulos.cotizaciones.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record CotizacionRequest(
		Long agenciaId,
		LocalDateTime fechaEnvio,
		LocalDate fechaViaje,
		String serviciosAdicionales,
		BigDecimal margenPorcentaje,
		List<CotizacionLineaRequest> lineas) {
}