package com.example.demo.modulos.marketing.mapper;

import com.example.demo.modulos.marketing.dto.MarketingPublicacionDTO;
import com.example.demo.modulos.marketing.entity.MarketingPublicacion;

public final class MarketingPublicacionMapper {

	private MarketingPublicacionMapper() {
	}

	public static MarketingPublicacionDTO toDTO(MarketingPublicacion publicacion) {
		return new MarketingPublicacionDTO(
				publicacion.getId(),
				publicacion.getTextoOriginal(),
				publicacion.getTextoPublicado(),
				publicacion.getCanal(),
				publicacion.getEstado(),
				publicacion.getMensajeError(),
				publicacion.getImagen() != null && publicacion.getImagen().length > 0,
				publicacion.getResponsableNombre(),
				publicacion.getFechaPublicacion());
	}
}
