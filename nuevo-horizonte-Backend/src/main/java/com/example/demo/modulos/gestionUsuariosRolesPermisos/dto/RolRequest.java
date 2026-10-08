package com.example.demo.modulos.gestionUsuariosRolesPermisos.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

public record RolRequest(
		@NotBlank(message = "El nombre del rol es obligatorio")
		@Size(max = 60, message = "El nombre no debe superar 60 caracteres")
		String nombre,
		@Size(max = 200, message = "La descripcion no debe superar 200 caracteres")
		String descripcion,
		String color,
		Boolean activo,
		List<PermisoRequest> permisos) {
}