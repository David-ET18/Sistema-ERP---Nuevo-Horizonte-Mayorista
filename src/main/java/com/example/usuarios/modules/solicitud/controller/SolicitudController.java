package com.example.usuarios.modules.solicitud.controller;

import com.example.usuarios.common.api.ApiResponse;
import com.example.usuarios.common.api.PaginationResponse;
import com.example.usuarios.common.security.SecurityUtils;
import com.example.usuarios.modules.solicitud.dto.request.EvaluarSolicitudRequest;
import com.example.usuarios.modules.solicitud.dto.request.SolicitudCreateRequest;
import com.example.usuarios.modules.solicitud.dto.response.SolicitudListResponse;
import com.example.usuarios.modules.solicitud.dto.response.SolicitudResumenResponse;
import com.example.usuarios.modules.solicitud.service.SolicitudService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/solicitudes")
@RequiredArgsConstructor
public class SolicitudController {

    private final SolicitudService solicitudService;
    private final SecurityUtils securityUtils;

    @PostMapping
    @PreAuthorize("hasAnyRole('TRABAJADOR', 'GERENCIA', 'PROVEEDOR')")
    public ResponseEntity<ApiResponse<SolicitudListResponse>> crear(@Valid @RequestBody SolicitudCreateRequest request) {
        Long usuarioId = securityUtils.getCurrentUserId();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Solicitud registrada correctamente", solicitudService.crear(usuarioId, request)));
    }

    @PatchMapping("/{id}/evaluar")
    @PreAuthorize("hasRole('GERENCIA')")
    public ResponseEntity<ApiResponse<SolicitudListResponse>> evaluar(
            @PathVariable Long id,
            @Valid @RequestBody EvaluarSolicitudRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Solicitud evaluada correctamente", solicitudService.evaluar(id, request)));
    }

    @GetMapping("/mias")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<PaginationResponse<SolicitudListResponse>>> listarMias(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String estado) {
        Page<SolicitudListResponse> result = solicitudService.listarMias(
                securityUtils.getCurrentUserId(), estado, PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.ok(toPagination(result)));
    }

    @GetMapping
    @PreAuthorize("hasRole('GERENCIA')")
    public ResponseEntity<ApiResponse<PaginationResponse<SolicitudListResponse>>> listarTodas(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String estado) {
        Page<SolicitudListResponse> result = solicitudService.listarTodas(estado, PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.ok(toPagination(result)));
    }

    @GetMapping("/resumen")
    @PreAuthorize("hasRole('GERENCIA')")
    public ResponseEntity<ApiResponse<SolicitudResumenResponse>> resumenTodas() {
        return ResponseEntity.ok(ApiResponse.ok(solicitudService.resumenTodas()));
    }

    @GetMapping("/mias/resumen")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<SolicitudResumenResponse>> resumenMias() {
        return ResponseEntity.ok(ApiResponse.ok(solicitudService.resumenMias(securityUtils.getCurrentUserId())));
    }

    private static PaginationResponse<SolicitudListResponse> toPagination(Page<SolicitudListResponse> p) {
        return new PaginationResponse<>(
                p.getContent(), p.getPageable().getPageNumber(), p.getSize(),
                p.getTotalElements(), p.getTotalPages(), p.isFirst(), p.isLast(), p.isEmpty());
    }
}