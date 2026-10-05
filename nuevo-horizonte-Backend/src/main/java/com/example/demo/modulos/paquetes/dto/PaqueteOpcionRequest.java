package com.example.demo.modulos.paquetes.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;
import java.time.LocalDate;

public record PaqueteOpcionRequest(
		@NotBlank(message = "El hotel/servicio es obligatorio")
		String hotelServicio,

		@NotNull(message = "La fecha desde es obligatoria")
		LocalDate fechaDesde,

		@NotNull(message = "La fecha hasta es obligatoria")
		LocalDate fechaHasta,

		String incluye,

		@PositiveOrZero(message = "El precio simple no puede ser negativo")
		BigDecimal precioSimple,

		@PositiveOrZero(message = "El precio doble no puede ser negativo")
		BigDecimal precioDoble,

		@PositiveOrZero(message = "El precio triple no puede ser negativo")
		BigDecimal precioTriple,

		@PositiveOrZero(message = "El precio de nino no puede ser negativo")
		BigDecimal precioNino) {
}
