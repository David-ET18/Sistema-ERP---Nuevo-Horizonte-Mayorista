package com.example.demo.modulos.reportes.dto;

public record AlertaDTO(
		/** WARNING | INFO (define el icono/color en el frontend). */
		String severidad,
		long cantidad,
		String mensaje) {
}
