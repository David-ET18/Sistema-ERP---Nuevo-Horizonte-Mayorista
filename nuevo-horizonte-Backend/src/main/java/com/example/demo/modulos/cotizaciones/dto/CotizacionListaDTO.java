package com.example.demo.modulos.cotizaciones.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record CotizacionListaDTO(
		Long id,
		String numero,
		String agencia,
		String destino,
		String producto,
		BigDecimal monto,
		String estado,
		LocalDateTime fechaCreacion) {
}