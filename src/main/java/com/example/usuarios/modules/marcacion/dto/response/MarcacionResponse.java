package com.example.usuarios.modules.marcacion.dto.response;

import com.example.usuarios.modules.marcacion.entity.TipoMarcacion;

import java.time.LocalDate;
import java.time.LocalTime;

public record MarcacionResponse(
        Long id,
        TipoMarcacion tipo,
        LocalDate fecha,
        LocalTime hora,
        Long usuarioId
) {}