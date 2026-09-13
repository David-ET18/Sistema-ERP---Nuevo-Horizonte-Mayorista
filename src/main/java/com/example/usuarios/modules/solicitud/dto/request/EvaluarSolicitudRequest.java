package com.example.usuarios.modules.solicitud.dto.request;

import com.example.usuarios.modules.solicitud.entity.EstadoSolicitud;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record EvaluarSolicitudRequest(
        @NotNull EstadoSolicitud estado,
        @Size(max = 1000) String comentarioGerencia
) {}