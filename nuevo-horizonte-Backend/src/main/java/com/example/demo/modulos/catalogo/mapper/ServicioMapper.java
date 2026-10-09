package com.example.demo.modulos.catalogo.mapper;

import com.example.demo.modulos.catalogo.dto.ServicioDTO;
import com.example.demo.modulos.catalogo.dto.ServicioDetalleDTO;
import com.example.demo.modulos.catalogo.dto.ServicioRequest;
import com.example.demo.modulos.catalogo.entity.Servicio;
import com.example.demo.util.Textos;

public final class ServicioMapper {

	private ServicioMapper() {
	}

	/** Version resumida que consumen los selects de otros modulos. */
	public static ServicioDTO toDTO(Servicio servicio) {
		return new ServicioDTO(servicio.getId(), servicio.getNombre(), servicio.getCategoria());
	}

	public static ServicioDetalleDTO toDetalleDTO(Servicio servicio) {
		return new ServicioDetalleDTO(
				servicio.getId(),
				servicio.getNombre(),
				servicio.getCategoria(),
				servicio.getDescripcion(),
				servicio.isActivo(),
				servicio.getFechaCreacion());
	}

	/** El campo activo solo se sobrescribe cuando viene informado. */
	public static void aplicar(Servicio servicio, ServicioRequest request) {
		servicio.setNombre(Textos.sinEspacios(request.nombre()));
		servicio.setCategoria(Textos.sinEspacios(request.categoria()));
		servicio.setDescripcion(Textos.sinEspacios(request.descripcion()));
		if (request.activo() != null) {
			servicio.setActivo(request.activo());
		}
	}
}
