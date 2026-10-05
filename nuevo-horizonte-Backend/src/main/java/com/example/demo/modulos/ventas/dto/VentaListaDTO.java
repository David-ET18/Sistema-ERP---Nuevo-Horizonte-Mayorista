package com.example.demo.modulos.ventas.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record VentaListaDTO(
		Long id,
		String numero,
		String agencia,
		String producto,
		String tarifa,
		BigDecimal montoAPagar,
		BigDecimal comision,
		BigDecimal igv,
		String estado,
		LocalDateTime fechaVenta) {
}
