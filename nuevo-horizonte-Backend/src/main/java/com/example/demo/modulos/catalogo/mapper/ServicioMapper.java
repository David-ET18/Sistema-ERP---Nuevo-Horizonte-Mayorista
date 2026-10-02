package com.example.demo.modulos.catalogo.mapper;

import com.example.demo.modulos.catalogo.dto.ServicioDTO;
import com.example.demo.modulos.catalogo.entity.Servicio;

public final class ServicioMapper {

	private ServicioMapper() {
	}

	public static ServicioDTO toDTO(Servicio servicio) {
		return new ServicioDTO(servicio.getId(), servicio.getNombre(), servicio.getCategoria());
	}
}
