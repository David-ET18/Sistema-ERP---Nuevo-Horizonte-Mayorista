package com.example.demo.modulos.cotizaciones.dto;

import java.time.LocalDateTime;

public record CotizacionHistorialDTO(
		Long id,
		String estadoAnterior,
		String estadoNuevo,
		LocalDateTime fechaCambio,
		String usuario) {
}