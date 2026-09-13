package com.example.usuarios.modules.usuario.service;

import com.example.usuarios.modules.usuario.dto.response.AuditoriaResponse;
import com.example.usuarios.common.api.PaginationResponse;

public interface AuditoriaService {
    PaginationResponse<AuditoriaResponse> listarPorUsuario(Long usuarioId, int page, int size);
    PaginationResponse<AuditoriaResponse> listarPorEntidad(String entidad, String entidadId, int page, int size);
    PaginationResponse<AuditoriaResponse> listarPorAccion(String accion, int page, int size);
    PaginationResponse<AuditoriaResponse> listarPorFecha(java.time.Instant inicio, java.time.Instant fin, int page, int size);
}