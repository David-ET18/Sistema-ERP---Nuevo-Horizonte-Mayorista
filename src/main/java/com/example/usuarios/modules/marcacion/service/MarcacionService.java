package com.example.usuarios.modules.marcacion.service;

import com.example.usuarios.modules.marcacion.dto.request.MarcacionCreateRequest;
import com.example.usuarios.modules.marcacion.dto.response.MarcacionResponse;
import com.example.usuarios.modules.marcacion.dto.response.MarcacionResumenResponse;

import java.time.LocalDate;
import java.util.List;

public interface MarcacionService {

    MarcacionResponse registrar(Long usuarioId, MarcacionCreateRequest request);

    MarcacionResponse ultima(Long usuarioId, String tipo);

    List<MarcacionResponse> historialHoy(Long usuarioId);

    MarcacionResumenResponse resumenDia(Long usuarioId, LocalDate fecha);
}