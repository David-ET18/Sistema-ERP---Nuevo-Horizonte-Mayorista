package com.example.demo.modulos.notificaciones.dto;

import java.time.LocalDateTime;

public record NotificacionDTO(
		Long id,
		String titulo,
		String mensaje,
		String tipo,
		boolean leida,
		String enlace,
		String actorNombre,
		String detalle,
		LocalDateTime fechaLeida,
		LocalDateTime fechaCreacion) {
}
