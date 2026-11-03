package com.example.demo.modulos.promociones.dto;

/**
 * Respuesta binaria de la imagen almacenada en la fila de la promocion.
 */
public record ImagenPromocionDTO(
		byte[] contenido,
		String contentType,
		String nombreArchivo) {
}
