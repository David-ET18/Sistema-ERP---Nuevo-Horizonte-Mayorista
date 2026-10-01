package com.example.demo.modulos.proveedores.mapper;

import java.time.LocalDateTime;
import java.util.List;

import com.example.demo.modulos.catalogo.entity.Destino;
import com.example.demo.modulos.proveedores.dto.ProveedorDTO;
import com.example.demo.modulos.proveedores.dto.ProveedorDetalleDTO;
import com.example.demo.modulos.proveedores.dto.ProveedorListaDTO;
import com.example.demo.modulos.proveedores.dto.ProveedorRequest;
import com.example.demo.modulos.proveedores.entity.Proveedor;
import com.example.demo.util.Textos;

public final class ProveedorMapper {

	/**
	 * Catalogo controlado del select "Condiciones comerciales" del formulario.
	 * Describe el tipo de condicion bajo la que trabaja el proveedor (no es
	 * texto libre). Se expone via ProveedorController#condicionesComerciales.
	 */
	public static final List<String> CONDICIONES_COMERCIALES = List.of(
			"Condiciones comerciales",
			"Condiciones turisticas",
			"Condiciones corporativas",
			"Condiciones promocionales");

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

	/**
	 * Version resumida que consumen otros modulos (tarifas, documentos).
	 */
	public static ProveedorDTO toRefDTO(Proveedor proveedor) {
		return new ProveedorDTO(
				proveedor.getId(),
				proveedor.getRazonSocial(),
				proveedor.getNombreComercial(),
				nombre(proveedor),
				proveedor.getRuc(),
				proveedor.getTipoProveedor(),
				proveedor.isActivo());
	}

	public static ProveedorListaDTO toListaDTO(Proveedor proveedor) {
		Destino destino = proveedor.getDestino();
		return new ProveedorListaDTO(
				proveedor.getId(),
				proveedor.getRazonSocial(),
				proveedor.getNombreComercial(),
				proveedor.getRuc(),
				proveedor.getTipoProveedor(),
				proveedor.getContactoNombre(),
				proveedor.getContactoTelefono(),
				proveedor.getContactoEmail(),
				proveedor.getCondicionesComerciales(),
				destino == null ? null : destino.getNombre(),
				proveedor.isActivo(),
				proveedor.getFechaActualizacion());
	}

	public static ProveedorDetalleDTO toDetalleDTO(Proveedor proveedor) {
		Destino destino = proveedor.getDestino();
		return new ProveedorDetalleDTO(
				proveedor.getId(),
				proveedor.getRazonSocial(),
				proveedor.getNombreComercial(),
				proveedor.getRuc(),
				proveedor.getTipoProveedor(),
				proveedor.getContactoNombre(),
				proveedor.getContactoTelefono(),
				proveedor.getContactoEmail(),
				destino == null ? null : destino.getId(),
				destino == null ? null : destino.getNombre(),
				proveedor.getCondicionesComerciales(),
				proveedor.getObservaciones(),
				proveedor.isActivo(),
				proveedor.getFechaCreacion(),
				proveedor.getFechaActualizacion());
	}

	/**
	 * Proyecta un request sobre la entidad. Los campos booleanos solo se sobrescriben
	 * cuando vienen informados, para no perder el valor actual en una edicion parcial.
	 */
	public static void aplicar(Proveedor proveedor, ProveedorRequest request, Destino destino) {
		proveedor.setRazonSocial(Textos.sinEspacios(request.razonSocial()));
		proveedor.setNombreComercial(Textos.sinEspacios(request.nombreComercial()));
		proveedor.setRuc(Textos.sinEspacios(request.ruc()));
		proveedor.setTipoProveedor(Textos.sinEspacios(request.tipoProveedor()));
		proveedor.setContactoNombre(Textos.sinEspacios(request.contactoNombre()));
		proveedor.setContactoTelefono(Textos.sinEspacios(request.contactoTelefono()));
		proveedor.setContactoEmail(Textos.sinEspacios(request.contactoEmail()));
		proveedor.setDestino(destino);
		proveedor.setCondicionesComerciales(Textos.sinEspacios(request.condicionesComerciales()));
		proveedor.setObservaciones(Textos.sinEspacios(request.observaciones()));
		if (request.activo() != null) {
			proveedor.setActivo(request.activo());
		}
		LocalDateTime ahora = LocalDateTime.now();
		if (proveedor.getId() == null) {
			proveedor.setFechaCreacion(ahora);
		}
		proveedor.setFechaActualizacion(ahora);
	}
}
