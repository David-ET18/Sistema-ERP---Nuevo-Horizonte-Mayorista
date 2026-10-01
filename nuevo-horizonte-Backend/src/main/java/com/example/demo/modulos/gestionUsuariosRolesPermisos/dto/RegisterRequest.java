package com.example.demo.modulos.gestionUsuariosRolesPermisos.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
		@NotBlank(message = "El username es obligatorio")
		@Size(min = 3, max = 50, message = "El username debe tener entre 3 y 50 caracteres")
		String username,
		@NotBlank(message = "El email es obligatorio")
		@Email(message = "El email no es valido")
		@Size(max = 100, message = "El email no debe superar 100 caracteres")
		String email,
		@NotBlank(message = "La contrasena es obligatoria")
		@Size(min = 6, max = 60, message = "La contrasena debe tener entre 6 y 60 caracteres")
		String password) {
}