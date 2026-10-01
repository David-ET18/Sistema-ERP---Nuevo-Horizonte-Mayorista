package com.example.demo.modulos.proveedores.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ProveedorRequest(
		@NotBlank(message = "La razon social es obligatoria")
		@Size(max = 200, message = "La razon social es muy larga")
		String razonSocial,

		@Size(max = 200, message = "El nombre comercial es muy largo")
		String nombreComercial,

		@NotBlank(message = "El RUC es obligatorio")
		@Pattern(regexp = "^\\d{11}$", message = "El RUC debe tener 11 digitos")
		String ruc,

		@NotBlank(message = "El tipo de servicio es obligatorio")
		@Size(max = 50, message = "El tipo de servicio es muy largo")
		String tipoProveedor,

		@Size(max = 100, message = "El nombre de contacto es muy largo")
		String contactoNombre,

		@Size(max = 20, message = "El telefono es muy largo")
		String contactoTelefono,

		@Email(message = "El email no es valido")
		@Size(max = 100, message = "El email es muy largo")
		String contactoEmail,

		Long destinoId,

		@Size(max = 50, message = "La condicion comercial es muy larga")
		String condicionesComerciales,

		String observaciones,

		Boolean activo) {
}
