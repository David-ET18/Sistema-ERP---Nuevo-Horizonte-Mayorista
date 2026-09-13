package com.example.usuarios.modules.usuario.service;

import com.example.usuarios.modules.usuario.dto.request.GerenciaCreateRequest;
import com.example.usuarios.modules.usuario.dto.request.GerenciaUpdateRequest;
import com.example.usuarios.modules.usuario.dto.response.GerenciaResponse;
import com.example.usuarios.common.api.PaginationResponse;

public interface GerenciaService {
    GerenciaResponse crear(Long usuarioId, GerenciaCreateRequest request);
    GerenciaResponse obtenerPorId(Long id);
    GerenciaResponse obtenerPorUsuarioId(Long usuarioId);
    PaginationResponse<GerenciaResponse> listar(int page, int size, String departamento, Boolean activo);
    GerenciaResponse actualizar(Long id, GerenciaUpdateRequest request);
    void cambiarEstado(Long id, boolean activo);
    void eliminar(Long id);
    PaginationResponse<GerenciaResponse> listarSubordinados(Long jefeId, int page, int size);
}