package com.example.demo.modulos.paquetes.mapper;

import com.example.demo.modulos.paquetes.dto.PaqueteDTO;
import com.example.demo.modulos.paquetes.entity.Paquete;

public final class PaqueteMapper {

	private PaqueteMapper() {
	}

	public static PaqueteDTO toDTO(Paquete paquete) {
		return new PaqueteDTO(
				paquete.getId(),
				paquete.getNombre(),
				paquete.getDestino() != null ? paquete.getDestino().getNombre() : null);
	}
}
