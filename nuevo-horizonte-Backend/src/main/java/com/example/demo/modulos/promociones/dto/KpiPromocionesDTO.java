package com.example.demo.modulos.promociones.dto;

public record KpiPromocionesDTO(
		long total,
		long activas,
		long vigentes,
		long programadas,
		long vencidas,
		long destacadas) {
}
