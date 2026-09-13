package com.example.usuarios.modules.marcacion.dto.response;

import java.time.LocalDate;
import java.time.LocalTime;

public record MarcacionResumenResponse(
        LocalDate fecha,
        LocalTime entrada,
        LocalTime salida
) {}