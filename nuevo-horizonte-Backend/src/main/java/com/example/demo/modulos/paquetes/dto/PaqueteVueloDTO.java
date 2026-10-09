package com.example.demo.modulos.paquetes.dto;

import java.time.LocalDateTime;

public record PaqueteVueloDTO(
		Long id,
		String aerolinea,
		String origen,
		String destino,
		LocalDateTime fechaSalida,
		LocalDateTime fechaLlegada) {
}
