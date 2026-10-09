package com.example.demo.modulos.proveedores.dto;

import java.time.LocalDateTime;

public record ProveedorDetalleDTO(
		Long id,
		String razonSocial,
		String nombreComercial,
		String ruc,
		String tipoProveedor,
		String contactoNombre,
		String contactoTelefono,
		String contactoEmail,
		Long destinoId,
		String destino,
		String condicionesComerciales,
		String observaciones,
		boolean activo,
		LocalDateTime fechaCreacion,
		LocalDateTime fechaActualizacion) {
}
