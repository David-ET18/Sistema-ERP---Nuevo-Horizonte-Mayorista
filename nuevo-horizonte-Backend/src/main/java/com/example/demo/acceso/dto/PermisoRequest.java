package com.example.demo.acceso.dto;

import jakarta.validation.constraints.NotBlank;

public record PermisoRequest(
		@NotBlank(message = "El modulo es obligatorio") String modulo,
		boolean puedeLeer,
		boolean puedeEscribir) {
}