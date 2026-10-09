package com.example.demo.modulos.ventas.dto;

import java.math.BigDecimal;

public record KpiVentasDTO(long ventasMes, BigDecimal montoVendidoMes, long pagosPendientes) {
}
