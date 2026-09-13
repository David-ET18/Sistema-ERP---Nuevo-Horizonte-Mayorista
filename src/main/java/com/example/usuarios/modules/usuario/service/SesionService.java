package com.example.usuarios.modules.usuario.service;

import com.example.usuarios.modules.usuario.dto.response.SesionResponse;

import java.util.List;

public interface SesionService {
    SesionResponse obtenerPorToken(String token);
    List<SesionResponse> listarActivasPorUsuario(Long usuarioId);
    void revocarSesion(String token);
    void revocarTodasSesionesUsuario(Long usuarioId);
    void limpiarSesionesExpiradas();
}