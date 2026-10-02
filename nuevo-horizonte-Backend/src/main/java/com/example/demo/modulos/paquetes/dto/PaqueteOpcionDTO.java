package com.example.demo.modulos.paquetes.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record PaqueteOpcionDTO(
		Long id,
		String hotelServicio,
		LocalDate fechaDesde,
		LocalDate fechaHasta,
		String incluye,
		BigDecimal precioSimple,
		BigDecimal precioDoble,
		BigDecimal precioTriple,
		BigDecimal precioNino) {
}
