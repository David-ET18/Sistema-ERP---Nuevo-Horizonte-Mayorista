package com.example.demo.modulos.proveedores.dto;

/**
 * Version resumida que consumen otros modulos (tarifas, documentos).
 */
public record ProveedorDTO(
		Long id,
		String razonSocial,
		String nombreComercial,
		String nombre,
		String ruc,
		String tipoProveedor,
		boolean activo) {
}
