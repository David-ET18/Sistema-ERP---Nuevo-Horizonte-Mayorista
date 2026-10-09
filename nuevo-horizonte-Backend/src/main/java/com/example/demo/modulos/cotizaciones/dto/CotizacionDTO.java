package com.example.demo.modulos.cotizaciones.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record CotizacionDTO(
		Long id,
		String numero,
		Long agenciaId,
		String agencia,
		String rucAgencia,
		String asesor,
		LocalDateTime fechaCreacion,
		LocalDateTime fechaEnvio,
		LocalDateTime fechaCierre,
		LocalDate fechaViaje,
		String serviciosAdicionales,
		BigDecimal margenPorcentaje,
		BigDecimal costoBase,
		BigDecimal margenMonto,
		BigDecimal precioVenta,
		String estado,
		String destino,
		String producto,
		BigDecimal monto,
		List<CotizacionDetalleDTO> lineas,
		List<CotizacionHistorialDTO> historial) {
}