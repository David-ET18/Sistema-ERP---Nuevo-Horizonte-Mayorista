package com.example.demo.modulos.reportes.dto;

import java.math.BigDecimal;

public record ResumenEjecutivoDTO(
		double cotizacionesCerradasPct,
		Double tiempoRespuestaHoras,
		Double tiempoRespuestaDeltaPct,
		BigDecimal ventasDelPeriodo,
		Double ventasDeltaPct) {
}
