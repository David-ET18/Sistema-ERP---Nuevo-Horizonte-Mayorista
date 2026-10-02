package com.example.demo.modulos.tarifas.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record TarifaRequest(
		@NotNull(message = "El proveedor es obligatorio")
		Long proveedorId,

		@NotNull(message = "El servicio es obligatorio")
		Long servicioId,

		@NotNull(message = "El destino es obligatorio")
		Long destinoId,

		@Size(max = 50, message = "El tipo de tarifa es muy largo")
		String tipoTarifa,

		@NotNull(message = "El precio es obligatorio")
		@Positive(message = "El precio debe ser mayor a 0")
		BigDecimal precio,

		@Size(min = 3, max = 3, message = "La moneda debe tener 3 letras")
		String moneda,

		@NotNull(message = "La fecha de inicio es obligatoria")
		LocalDate fechaDesde,

		@NotNull(message = "La fecha de fin es obligatoria")
		LocalDate fechaHasta,

		String condiciones,

		String observaciones) {
}
