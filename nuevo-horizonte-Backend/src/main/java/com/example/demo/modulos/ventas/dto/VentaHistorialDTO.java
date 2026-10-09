package com.example.demo.modulos.ventas.dto;

import java.time.LocalDateTime;

public record VentaHistorialDTO(
		Long id,
		String estadoAnterior,
		String estadoNuevo,
		LocalDateTime fechaCambio,
		String usuario) {
}
