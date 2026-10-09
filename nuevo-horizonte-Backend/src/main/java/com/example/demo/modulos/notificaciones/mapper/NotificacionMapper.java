package com.example.demo.modulos.notificaciones.mapper;

import com.example.demo.modulos.notificaciones.dto.NotificacionDTO;
import com.example.demo.modulos.notificaciones.entity.Notificacion;

public final class NotificacionMapper {

	private NotificacionMapper() {
	}

	public static NotificacionDTO toDTO(Notificacion notificacion) {
		return new NotificacionDTO(
				notificacion.getId(),
				notificacion.getTitulo(),
				notificacion.getMensaje(),
				notificacion.getTipo(),
				notificacion.isLeida(),
				notificacion.getFechaCreacion());
	}
}