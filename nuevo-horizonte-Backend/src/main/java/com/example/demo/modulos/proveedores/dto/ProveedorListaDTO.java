package com.example.demo.modulos.proveedores.dto;

import java.time.LocalDateTime;

public record ProveedorListaDTO(
		Long id,
		String razonSocial,
		String nombreComercial,
		String ruc,
		String tipoProveedor,
		String contactoNombre,
		String contactoTelefono,
		String contactoEmail,
		String condicionesComerciales,
		String destino,
		boolean activo,
		LocalDateTime fechaActualizacion) {
}
