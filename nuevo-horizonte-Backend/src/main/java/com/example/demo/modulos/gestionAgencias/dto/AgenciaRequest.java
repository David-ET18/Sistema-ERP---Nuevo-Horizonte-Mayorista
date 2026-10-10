package com.example.demo.modulos.gestionAgencias.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record AgenciaRequest(
		@NotBlank(message = "La razon social es obligatoria")
		@Pattern(regexp = "^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\\s&.,'()-]*$", message = "La razon social no debe contener numeros")
		@Size(max = 200, message = "La razon social es muy larga")
		String razonSocial,

		@Pattern(regexp = "^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\\s&.,'()-]*$", message = "El nombre comercial no debe contener numeros")
		@Size(max = 200, message = "El nombre comercial es muy largo")
		String nombreComercial,

		@NotBlank(message = "El RUC es obligatorio")
		@Pattern(regexp = "^\\d{11}$", message = "El RUC debe tener 11 digitos")
		String ruc,

		@Size(max = 50, message = "La categoria es muy larga")
		String categoria,

		@Size(max = 100, message = "El nombre de contacto es muy largo")
		String contactoNombre,

		@Pattern(regexp = "^\\d{9}$", message = "El telefono debe tener 9 digitos")
		String contactoTelefono,

		@Email(message = "El email no es valido")
		@Size(max = 100, message = "El email es muy largo")
		String contactoEmail,

		@Size(max = 100, message = "La ciudad es muy larga")
		String ciudad,

		@Size(max = 150, message = "El nombre del ejecutivo es muy largo")
		String ejecutivoAsignado,

		Boolean esPrioritaria,

		Boolean activo) {
}
