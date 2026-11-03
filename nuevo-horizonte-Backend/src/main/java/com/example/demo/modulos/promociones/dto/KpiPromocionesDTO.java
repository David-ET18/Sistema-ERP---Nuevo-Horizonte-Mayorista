package com.example.demo.modulos.promociones.dto;

import java.math.BigDecimal;

public record KpiPromocionesDTO(
		long total,
		long activas,
		long destacadas,
		long vigentes,
		long porVencer) {
}
