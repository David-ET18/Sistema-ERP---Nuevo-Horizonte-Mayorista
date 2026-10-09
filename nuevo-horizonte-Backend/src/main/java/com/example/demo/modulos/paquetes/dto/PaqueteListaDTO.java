package com.example.demo.modulos.paquetes.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PaqueteListaDTO(
		Long id,
		String nombre,
		String destino,
		String categoria,
		String duracionTexto,
		String moneda,
		BigDecimal precioDesde,
		String estado,
		boolean destacado,
		LocalDateTime fechaActualizacion) {
}
