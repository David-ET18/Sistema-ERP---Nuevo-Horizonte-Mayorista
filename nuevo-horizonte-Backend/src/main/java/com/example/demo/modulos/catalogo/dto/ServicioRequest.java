package com.example.demo.modulos.catalogo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ServicioRequest(
		@NotBlank(message = "El nombre del servicio es obligatorio")
		@Size(max = 100, message = "El nombre es muy largo")
		String nombre,

		@Size(max = 50, message = "La categoria es muy larga")
		String categoria,

		String descripcion,

		Boolean activo) {
}
