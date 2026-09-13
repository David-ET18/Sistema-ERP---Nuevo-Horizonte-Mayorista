package com.example.usuarios.modules.usuario.service;

import com.example.usuarios.modules.usuario.dto.request.UsuarioCreateRequest;
import com.example.usuarios.modules.usuario.dto.request.UsuarioUpdateRequest;
import com.example.usuarios.modules.usuario.dto.response.UsuarioResponse;
import com.example.usuarios.common.api.PaginationResponse;

public interface UsuarioService {
    UsuarioResponse crear(UsuarioCreateRequest request);
    UsuarioResponse obtenerPorId(Long id);
    UsuarioResponse obtenerPorEmail(String email);
    PaginationResponse<UsuarioResponse> listar(int page, int size, String search,
                                               com.example.usuarios.modules.usuario.entity.Rol.RolNombre rol);
    UsuarioResponse actualizar(Long id, UsuarioUpdateRequest request);
    void cambiarEstado(Long id, boolean activo);
    void eliminar(Long id);
    void asignarRol(Long usuarioId, Long rolId);
    void removerRol(Long usuarioId, Long rolId);
}