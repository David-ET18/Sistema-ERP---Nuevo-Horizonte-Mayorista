package com.example.demo.modulos.marketing.dto;

import com.example.demo.modulos.marketing.entity.MarketingPublicacion;

import java.time.LocalDateTime;

/**
 * Vista de lista/detalle de una publicacion. No incluye los bytes de la
 * imagen: el frontend consume /api/marketing/publicaciones/{id}/imagen.
 */
public record MarketingPublicacionDTO(
		Long id,
		String textoOriginal,
		String textoPublicado,
		MarketingPublicacion.Canal canal,
		MarketingPublicacion.Estado estado,
		String mensajeError,
		boolean tieneImagen,
		String responsableNombre,
		LocalDateTime fechaPublicacion) {
}
