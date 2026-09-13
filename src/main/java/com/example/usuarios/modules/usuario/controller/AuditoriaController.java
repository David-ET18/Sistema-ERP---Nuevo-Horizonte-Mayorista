package com.example.usuarios.modules.usuario.controller;

import com.example.usuarios.modules.usuario.dto.response.AuditoriaResponse;
import com.example.usuarios.modules.usuario.service.AuditoriaService;
import com.example.usuarios.common.api.ApiResponse;
import com.example.usuarios.common.api.PaginationResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;

@RestController
@RequestMapping("/api/auditoria")
@RequiredArgsConstructor
public class AuditoriaController {

    private final AuditoriaService auditoriaService;

    @GetMapping("/usuario/{usuarioId}")
    @PreAuthorize("hasRole('GERENCIA')")
    public ResponseEntity<ApiResponse<PaginationResponse<AuditoriaResponse>>> listarPorUsuario(
            @PathVariable Long usuarioId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.ok(auditoriaService.listarPorUsuario(usuarioId, page, size)));
    }

    @GetMapping("/entidad/{entidad}/{entidadId}")
    @PreAuthorize("hasRole('GERENCIA')")
    public ResponseEntity<ApiResponse<PaginationResponse<AuditoriaResponse>>> listarPorEntidad(
            @PathVariable String entidad,
            @PathVariable String entidadId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.ok(auditoriaService.listarPorEntidad(entidad, entidadId, page, size)));
    }

    @GetMapping("/accion/{accion}")
    @PreAuthorize("hasRole('GERENCIA')")
    public ResponseEntity<ApiResponse<PaginationResponse<AuditoriaResponse>>> listarPorAccion(
            @PathVariable String accion,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.ok(auditoriaService.listarPorAccion(accion, page, size)));
    }

    @GetMapping("/fecha")
    @PreAuthorize("hasRole('GERENCIA')")
    public ResponseEntity<ApiResponse<PaginationResponse<AuditoriaResponse>>> listarPorFecha(
            @RequestParam Instant inicio,
            @RequestParam Instant fin,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.ok(auditoriaService.listarPorFecha(inicio, fin, page, size)));
    }
}