package com.example.demo.modulos.gestionUsuariosRolesPermisos.dto;

import jakarta.validation.constraints.NotBlank;

public record PermisoRequest(
		@NotBlank(message = "El modulo es obligatorio") String modulo,
		boolean puedeLeer,
		boolean puedeCrear,
		boolean puedeActualizar,
		boolean puedeEliminar) {
}