package com.example.usuarios.modules.usuario.controller;

import com.example.usuarios.modules.usuario.dto.request.GerenciaCreateRequest;
import com.example.usuarios.modules.usuario.dto.request.GerenciaUpdateRequest;
import com.example.usuarios.modules.usuario.dto.response.GerenciaResponse;
import com.example.usuarios.modules.usuario.service.GerenciaService;
import com.example.usuarios.common.api.ApiResponse;
import com.example.usuarios.common.api.PaginationResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/gerencias")
@RequiredArgsConstructor
public class GerenciaController {

    private final GerenciaService gerenciaService;

    @PostMapping("/usuario/{usuarioId}")
    @PreAuthorize("hasRole('GERENCIA')")
    public ResponseEntity<ApiResponse<GerenciaResponse>> crear(
            @PathVariable Long usuarioId,
            @Valid @RequestBody GerenciaCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Gerencia creada correctamente", gerenciaService.crear(usuarioId, request)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('GERENCIA')")
    public ResponseEntity<ApiResponse<GerenciaResponse>> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(gerenciaService.obtenerPorId(id)));
    }

    @GetMapping("/usuario/{usuarioId}")
    @PreAuthorize("@securityUtils.getCurrentUserId() == #usuarioId or hasRole('GERENCIA')")
    public ResponseEntity<ApiResponse<GerenciaResponse>> obtenerPorUsuarioId(@PathVariable Long usuarioId) {
        return ResponseEntity.ok(ApiResponse.ok(gerenciaService.obtenerPorUsuarioId(usuarioId)));
    }

    @GetMapping
    @PreAuthorize("hasRole('GERENCIA')")
    public ResponseEntity<ApiResponse<PaginationResponse<GerenciaResponse>>> listar(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String departamento,
            @RequestParam(required = false) Boolean activo) {
        return ResponseEntity.ok(ApiResponse.ok(gerenciaService.listar(page, size, departamento, activo)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('GERENCIA')")
    public ResponseEntity<ApiResponse<GerenciaResponse>> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody GerenciaUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Gerencia actualizada correctamente", gerenciaService.actualizar(id, request)));
    }

    @PatchMapping("/{id}/estado")
    @PreAuthorize("hasRole('GERENCIA')")
    public ResponseEntity<ApiResponse<Void>> cambiarEstado(
            @PathVariable Long id,
            @RequestParam boolean activo) {
        gerenciaService.cambiarEstado(id, activo);
        return ResponseEntity.ok(ApiResponse.ok(activo ? "Gerencia activada" : "Gerencia desactivada", null));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('GERENCIA')")
    public ResponseEntity<ApiResponse<Void>> eliminar(@PathVariable Long id) {
        gerenciaService.eliminar(id);
        return ResponseEntity.ok(ApiResponse.ok("Gerencia eliminada correctamente", null));
    }

    @GetMapping("/{jefeId}/subordinados")
    @PreAuthorize("hasRole('GERENCIA')")
    public ResponseEntity<ApiResponse<PaginationResponse<GerenciaResponse>>> listarSubordinados(
            @PathVariable Long jefeId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.ok(gerenciaService.listarSubordinados(jefeId, page, size)));
    }
}