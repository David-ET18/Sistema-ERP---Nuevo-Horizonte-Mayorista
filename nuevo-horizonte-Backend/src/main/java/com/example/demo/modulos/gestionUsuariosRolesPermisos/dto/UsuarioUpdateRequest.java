package com.example.demo.modulos.gestionUsuariosRolesPermisos.dto;

import jakarta.validation.constraints.Email;

import java.util.List;

public record UsuarioUpdateRequest(
		@Email(message = "El email no es valido") String email,
		Boolean activo,
		String password,
		List<Long> rolIds) {
}