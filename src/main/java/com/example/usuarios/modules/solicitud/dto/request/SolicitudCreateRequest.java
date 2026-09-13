package com.example.usuarios.modules.solicitud.dto.request;

import com.example.usuarios.modules.solicitud.entity.TipoSolicitud;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record SolicitudCreateRequest(
        @NotNull TipoSolicitud tipo,
        @Size(max = 1000) String motivo,
        LocalDate fechaInicio,
        LocalDate fechaFin
) {}