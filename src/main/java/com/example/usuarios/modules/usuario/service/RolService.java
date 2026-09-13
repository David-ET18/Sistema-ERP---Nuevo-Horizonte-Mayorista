package com.example.usuarios.modules.usuario.service;

import com.example.usuarios.modules.usuario.dto.request.RolCreateRequest;
import com.example.usuarios.modules.usuario.dto.request.RolUpdateRequest;
import com.example.usuarios.modules.usuario.dto.response.RolResponse;
import com.example.usuarios.common.api.PaginationResponse;

import java.util.List;

public interface RolService {
    RolResponse crear(RolCreateRequest request);
    RolResponse obtenerPorId(Long id);
    RolResponse obtenerPorNombre(com.example.usuarios.modules.usuario.entity.Rol.RolNombre nombre);
    PaginationResponse<RolResponse> listar(int page, int size);
    RolResponse actualizar(Long id, RolUpdateRequest request);
    void eliminar(Long id);
    List<RolResponse> listarTodos();
    void asignarPermiso(Long rolId, Long permisoId);
    void removerPermiso(Long rolId, Long permisoId);
}