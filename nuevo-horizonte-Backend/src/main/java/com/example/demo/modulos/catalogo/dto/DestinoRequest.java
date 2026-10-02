package com.example.demo.modulos.catalogo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record DestinoRequest(
		@NotBlank(message = "El nombre del destino es obligatorio")
		@Size(max = 100, message = "El nombre es muy largo")
		String nombre,

		@NotBlank(message = "El pais es obligatorio")
		@Size(max = 100, message = "El pais es muy largo")
		String pais,

		String descripcion,

		Boolean activo) {
}
