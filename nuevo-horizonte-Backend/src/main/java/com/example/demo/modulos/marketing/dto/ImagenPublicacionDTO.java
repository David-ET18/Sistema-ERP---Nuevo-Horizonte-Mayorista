package com.example.demo.modulos.marketing.dto;

/**
 * Respuesta binaria de la imagen almacenada en la fila de la publicacion.
 */
public record ImagenPublicacionDTO(
		byte[] contenido,
		String contentType,
		String nombreArchivo) {
}
