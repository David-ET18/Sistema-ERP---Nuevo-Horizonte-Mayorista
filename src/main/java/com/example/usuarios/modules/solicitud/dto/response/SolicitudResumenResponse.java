package com.example.usuarios.modules.solicitud.dto.response;

import com.example.usuarios.modules.solicitud.entity.TipoSolicitud;

public record SolicitudResumenResponse(
        long pendientes,
        long aprobadas,
        long rechazadas,
        long total
) {}