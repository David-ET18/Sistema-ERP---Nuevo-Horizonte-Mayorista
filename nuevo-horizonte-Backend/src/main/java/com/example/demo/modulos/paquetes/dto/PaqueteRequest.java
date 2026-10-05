package com.example.demo.modulos.paquetes.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;

public record PaqueteRequest(
		@NotBlank(message = "El titulo del paquete es obligatorio")
		@Size(max = 100, message = "El titulo es muy largo")
		String nombre,

		String descripcion,

		@NotNull(message = "El destino es obligatorio")
		Long destinoId,

		LocalDate fechaInicioViaje,

		LocalDate fechaFinViaje,

		LocalDate fechaCierreVenta,

		@Size(max = 50, message = "La categoria es muy larga")
		String categoria,

		@Size(min = 3, max = 3, message = "La moneda debe tener 3 letras")
		String moneda,

		@PositiveOrZero(message = "El precio 'desde' no puede ser negativo")
		BigDecimal precioDesde,

		@Size(max = 50, message = "La duracion es muy larga")
		String duracionTexto,

		Boolean destacado,

		/** BORRADOR (Guardar borrador) o ACTIVO (Publicar paquete). */
		@NotBlank(message = "El estado es obligatorio")
		String estado,

		Set<String> aliados,

		@Valid
		List<PaqueteVueloRequest> vuelos,

		@Valid
		List<PaqueteOpcionRequest> opciones) {
}
