package com.example.demo.modulos.promociones.dto;

import java.math.BigDecimal;

/**
 * Servicio del catalogo expuesto en el selector de promociones. Incluye el
 * precio de referencia (la tarifa vigente mas baja del servicio) para que el
 * formulario pueda autocompletar el precio original al elegirlo.
 */
public record ServicioPromocionDTO(Long id, String nombre, String categoria, BigDecimal precioReferencia) {
}
