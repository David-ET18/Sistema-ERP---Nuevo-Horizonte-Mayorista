package com.example.usuarios.modules.marcacion.controller;

import com.example.usuarios.common.api.ApiResponse;
import com.example.usuarios.common.security.SecurityUtils;
import com.example.usuarios.modules.marcacion.dto.request.MarcacionCreateRequest;
import com.example.usuarios.modules.marcacion.dto.response.MarcacionResponse;
import com.example.usuarios.modules.marcacion.dto.response.MarcacionResumenResponse;
import com.example.usuarios.modules.marcacion.service.MarcacionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/marcaciones")
@RequiredArgsConstructor
public class MarcacionController {

    private final MarcacionService marcacionService;
    private final SecurityUtils securityUtils;

    @PostMapping
    @PreAuthorize("hasAnyRole('TRABAJADOR', 'GERENCIA', 'PROVEEDOR')")
    public ResponseEntity<ApiResponse<MarcacionResponse>> registrar(@Valid @RequestBody MarcacionCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Marcación registrada correctamente",
                        marcacionService.registrar(securityUtils.getCurrentUserId(), request)));
    }

    @GetMapping("/ultima/{tipo}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<MarcacionResponse>> ultima(@PathVariable String tipo) {
        return ResponseEntity.ok(ApiResponse.ok(marcacionService.ultima(securityUtils.getCurrentUserId(), tipo)));
    }

    @GetMapping("/hoy")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<MarcacionResponse>>> historialHoy() {
        return ResponseEntity.ok(ApiResponse.ok(marcacionService.historialHoy(securityUtils.getCurrentUserId())));
    }

    @GetMapping("/resumen")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<MarcacionResumenResponse>> resumenDia(
            @RequestParam(required = false) LocalDate fecha) {
        return ResponseEntity.ok(ApiResponse.ok(marcacionService.resumenDia(securityUtils.getCurrentUserId(), fecha)));
    }
}