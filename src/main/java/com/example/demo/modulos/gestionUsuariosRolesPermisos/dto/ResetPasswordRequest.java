package com.example.demo.modulos.gestionUsuariosRolesPermisos.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ResetPasswordRequest(
		@NotBlank(message = "El token es obligatorio") String token,
		@NotBlank(message = "La contrasena es obligatoria")
		@Size(min = 6, max = 100, message = "La contrasena debe tener al menos 6 caracteres")
		String nuevaContrasena) {
}