package com.example.demo.modulos.ventas.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record VentaRequest(
		Long cotizacionId,
		Long productoId,
		Long tarifaId,
		Long agenciaId,
		Long idDetallePagos,
		BigDecimal montoAPagar,
		BigDecimal comision,
		BigDecimal igv,
		String notasOperativas,
		String estado,
		LocalDateTime fechaVenta) {
}
