package com.example.usuarios.modules.usuario.service;

import com.example.usuarios.modules.usuario.dto.request.ProveedorCreateRequest;
import com.example.usuarios.modules.usuario.dto.request.ProveedorUpdateRequest;
import com.example.usuarios.modules.usuario.dto.response.ProveedorResponse;
import com.example.usuarios.common.api.PaginationResponse;

public interface ProveedorService {
    ProveedorResponse crear(Long usuarioId, ProveedorCreateRequest request);
    ProveedorResponse obtenerPorId(Long id);
    ProveedorResponse obtenerPorUsuarioId(Long usuarioId);
    PaginationResponse<ProveedorResponse> listar(int page, int size, Boolean activo);
    ProveedorResponse actualizar(Long id, ProveedorUpdateRequest request);
    void cambiarEstado(Long id, boolean activo);
    void eliminar(Long id);
}