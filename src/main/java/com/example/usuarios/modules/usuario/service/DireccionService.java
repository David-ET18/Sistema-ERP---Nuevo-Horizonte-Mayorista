package com.example.usuarios.modules.usuario.service;

import com.example.usuarios.modules.usuario.dto.request.DireccionCreateRequest;
import com.example.usuarios.modules.usuario.dto.request.DireccionUpdateRequest;
import com.example.usuarios.modules.usuario.dto.response.DireccionResponse;
import com.example.usuarios.common.api.PaginationResponse;

import java.util.List;

public interface DireccionService {
    DireccionResponse crear(Long usuarioId, DireccionCreateRequest request);
    DireccionResponse obtenerPorId(Long id);
    List<DireccionResponse> listarPorUsuario(Long usuarioId);
    DireccionResponse obtenerPrincipal(Long usuarioId);
    DireccionResponse actualizar(Long id, DireccionUpdateRequest request);
    void establecerPrincipal(Long usuarioId, Long direccionId);
    void eliminar(Long id);
}