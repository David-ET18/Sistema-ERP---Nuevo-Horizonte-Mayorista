package com.example.demo.modulos.catalogo.mapper;

import com.example.demo.modulos.catalogo.dto.DestinoDTO;
import com.example.demo.modulos.catalogo.entity.Destino;

public final class DestinoMapper {

	private DestinoMapper() {
	}

	public static DestinoDTO toDTO(Destino destino) {
		return new DestinoDTO(
				destino.getId(),
				destino.getNombre(),
				destino.getPais());
	}
}
