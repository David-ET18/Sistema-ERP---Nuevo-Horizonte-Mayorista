package com.example.demo.modulos.paquetes.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record PaqueteVueloRequest(
		@NotBlank(message = "La aerolinea es obligatoria")
		String aerolinea,

		@NotBlank(message = "El origen es obligatorio")
		String origen,

		@NotBlank(message = "El destino del vuelo es obligatorio")
		String destino,

		@NotNull(message = "La fecha de salida es obligatoria")
		LocalDateTime fechaSalida,

		@NotNull(message = "La fecha de llegada es obligatoria")
		LocalDateTime fechaLlegada) {
}
