package com.example.usuarios.modules.solicitud.service;

import com.example.usuarios.modules.solicitud.dto.request.EvaluarSolicitudRequest;
import com.example.usuarios.modules.solicitud.dto.request.SolicitudCreateRequest;
import com.example.usuarios.modules.solicitud.dto.response.SolicitudListResponse;
import com.example.usuarios.modules.solicitud.dto.response.SolicitudResumenResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface SolicitudService {

    SolicitudListResponse crear(Long usuarioId, SolicitudCreateRequest request);

    SolicitudListResponse evaluar(Long solicitudId, EvaluarSolicitudRequest request);

    Page<SolicitudListResponse> listarMias(Long usuarioId, String estado, Pageable pageable);

    Page<SolicitudListResponse> listarTodas(String estado, Pageable pageable);

    SolicitudResumenResponse resumenMias(Long usuarioId);

    SolicitudResumenResponse resumenTodas();
}