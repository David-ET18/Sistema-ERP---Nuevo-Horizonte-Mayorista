package com.example.demo.modulos.reportes.dto;

import java.math.BigDecimal;

/** Un punto del grafico "Rendimiento comercial" (eje X = label, eje Y = valor). */
public record PuntoSerieDTO(String label, BigDecimal valor) {
}
