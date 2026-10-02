package com.example.demo.modulos.catalogo.mapper;

import com.example.demo.modulos.catalogo.dto.DestinoDTO;
import com.example.demo.modulos.catalogo.dto.DestinoDetalleDTO;
import com.example.demo.modulos.catalogo.dto.DestinoRequest;
import com.example.demo.modulos.catalogo.entity.Destino;
import com.example.demo.util.Textos;

public final class DestinoMapper {

	private DestinoMapper() {
	}

	/** Version resumida que consumen los selects de otros modulos. */
	public static DestinoDTO toDTO(Destino destino) {
		return new DestinoDTO(
				destino.getId(),
				destino.getNombre(),
				destino.getPais());
	}

	public static DestinoDetalleDTO toDetalleDTO(Destino destino) {
		return new DestinoDetalleDTO(
				destino.getId(),
				destino.getNombre(),
				destino.getPais(),
				destino.getDescripcion(),
				destino.isActivo(),
				destino.getFechaCreacion());
	}

	/** El campo activo solo se sobrescribe cuando viene informado. */
	public static void aplicar(Destino destino, DestinoRequest request) {
		destino.setNombre(Textos.sinEspacios(request.nombre()));
		destino.setPais(Textos.sinEspacios(request.pais()));
		destino.setDescripcion(Textos.sinEspacios(request.descripcion()));
		if (request.activo() != null) {
			destino.setActivo(request.activo());
		}
	}
}
