package com.example.demo.modulos.gestionAgencias.dto;

import java.time.LocalDateTime;

/** Un evento del timeline "Historial comercial": una cotizacion o una venta. */
public record HistorialComercialItemDTO(
		String tipo,
		String numero,
		String titulo,
		String estado,
		LocalDateTime fecha) {
}
