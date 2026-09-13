package com.example.usuarios.modules.usuario.service;

import com.example.usuarios.modules.usuario.dto.request.PermisoCreateRequest;
import com.example.usuarios.modules.usuario.dto.request.PermisoUpdateRequest;
import com.example.usuarios.modules.usuario.dto.response.PermisoResponse;
import com.example.usuarios.common.api.PaginationResponse;

import java.util.List;

public interface PermisoService {
    PermisoResponse crear(PermisoCreateRequest request);
    PermisoResponse obtenerPorId(Long id);
    PaginationResponse<PermisoResponse> listar(int page, int size, String recurso);
    PermisoResponse actualizar(Long id, PermisoUpdateRequest request);
    void eliminar(Long id);
    List<PermisoResponse> listarPorRecurso(String recurso);
    List<PermisoResponse> listarTodos();
}