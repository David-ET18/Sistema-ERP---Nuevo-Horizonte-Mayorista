package com.example.demo.modulos.notificaciones.dto;

import java.time.LocalDateTime;

public record NotificacionDTO(
		Long id,
		String titulo,
		String mensaje,
		String tipo,
		String enlace,
		boolean leida,
		LocalDateTime fechaLeida,
		LocalDateTime fechaCreacion) {
}
