package com.example.demo.modulos.proveedores.mapper;

import com.example.demo.modulos.proveedores.entity.Proveedor;
import com.example.demo.util.Textos;

public final class ProveedorMapper {

	private ProveedorMapper() {
	}

	/**
	 * Nombre a mostrar: nombre comercial si existe, si no la razon social.
	 */
	public static String nombre(Proveedor proveedor) {
		if (proveedor == null) {
			return null;
		}
		return Textos.primeroConContenido(proveedor.getNombreComercial(), proveedor.getRazonSocial());
	}
}
