package com.example.demo.modulos.ventas.dto;

import java.math.BigDecimal;

public record CotizacionVentaRefDTO(
		Long id,
		String numero,
		String agencia,
		BigDecimal montoEstimado) {
}
