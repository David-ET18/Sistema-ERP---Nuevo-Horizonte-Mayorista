package com.example.demo.modulos.cotizaciones.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record CotizacionDetalleDTO(
		Long id,
		Long tarifaId,
		String servicio,
		String destino,
		String proveedor,
		BigDecimal precioUnitario,
		Integer cantidadPax,
		BigDecimal monto,
		String moneda) {
}