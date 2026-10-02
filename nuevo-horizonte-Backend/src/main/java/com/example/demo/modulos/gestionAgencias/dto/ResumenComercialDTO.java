package com.example.demo.modulos.gestionAgencias.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ResumenComercialDTO(
		BigDecimal comprasAcumuladas,
		long cotizaciones,
		long ventasCerradas,
		LocalDateTime ultimaCompra) {
}
