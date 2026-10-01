package com.example.demo.modulos.ventas.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record VentaDTO(
		Long id,
		String numero,
		Long cotizacionId,
		String cotizacionNumero,
		Long productoId,
		String producto,
		Long tarifaId,
		String tarifa,
		BigDecimal tarifaPrecio,
		Long agenciaId,
		String agencia,
		String rucAgencia,
		Long idDetallePagos,
		BigDecimal montoAPagar,
		BigDecimal comision,
		BigDecimal igv,
		BigDecimal total,
		String notasOperativas,
		String estado,
		LocalDateTime fechaVenta,
		LocalDateTime fechaCulminada,
		LocalDateTime fechaCreacion,
		String usuarioRegistro,
		List<VentaHistorialDTO> historial) {
}
