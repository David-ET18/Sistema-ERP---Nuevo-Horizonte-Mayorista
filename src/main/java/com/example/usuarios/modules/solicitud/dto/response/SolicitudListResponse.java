package com.example.usuarios.modules.solicitud.dto.response;

import com.example.usuarios.modules.solicitud.entity.EstadoSolicitud;
import com.example.usuarios.modules.solicitud.entity.TipoSolicitud;

import java.time.Instant;
import java.time.LocalDate;

public record SolicitudListResponse(
        Long id,
        String codigo,
        TipoSolicitud tipo,
        String motivo,
        LocalDate fechaInicio,
        LocalDate fechaFin,
        EstadoSolicitud estado,
        String comentarioGerencia,
        String usuario,
        Instant createdAt
) {}