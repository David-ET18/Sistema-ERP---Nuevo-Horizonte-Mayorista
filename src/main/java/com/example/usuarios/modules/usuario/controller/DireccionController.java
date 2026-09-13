package com.example.usuarios.modules.usuario.controller;

import com.example.usuarios.modules.usuario.dto.request.DireccionCreateRequest;
import com.example.usuarios.modules.usuario.dto.request.DireccionUpdateRequest;
import com.example.usuarios.modules.usuario.dto.response.DireccionResponse;
import com.example.usuarios.modules.usuario.service.DireccionService;
import com.example.usuarios.common.api.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios/{usuarioId}/direcciones")
@RequiredArgsConstructor
public class DireccionController {

    private final DireccionService direccionService;

    @PostMapping
    @PreAuthorize("@securityUtils.getCurrentUserId() == #usuarioId or hasRole('GERENCIA')")
    public ResponseEntity<ApiResponse<DireccionResponse>> crear(
            @PathVariable Long usuarioId,
            @Valid @RequestBody DireccionCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Dirección creada correctamente", direccionService.crear(usuarioId, request)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("@securityUtils.getCurrentUserId() == #usuarioId or hasRole('GERENCIA')")
    public ResponseEntity<ApiResponse<DireccionResponse>> obtenerPorId(
            @PathVariable Long usuarioId,
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(direccionService.obtenerPorId(id)));
    }

    @GetMapping
    @PreAuthorize("@securityUtils.getCurrentUserId() == #usuarioId or hasRole('GERENCIA')")
    public ResponseEntity<ApiResponse<List<DireccionResponse>>> listarPorUsuario(@PathVariable Long usuarioId) {
        return ResponseEntity.ok(ApiResponse.ok(direccionService.listarPorUsuario(usuarioId)));
    }

    @GetMapping("/principal")
    @PreAuthorize("@securityUtils.getCurrentUserId() == #usuarioId or hasRole('GERENCIA')")
    public ResponseEntity<ApiResponse<DireccionResponse>> obtenerPrincipal(@PathVariable Long usuarioId) {
        return ResponseEntity.ok(ApiResponse.ok(direccionService.obtenerPrincipal(usuarioId)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("@securityUtils.getCurrentUserId() == #usuarioId or hasRole('GERENCIA')")
    public ResponseEntity<ApiResponse<DireccionResponse>> actualizar(
            @PathVariable Long usuarioId,
            @PathVariable Long id,
            @Valid @RequestBody DireccionUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Dirección actualizada correctamente", direccionService.actualizar(id, request)));
    }

    @PatchMapping("/{direccionId}/principal")
    @PreAuthorize("@securityUtils.getCurrentUserId() == #usuarioId or hasRole('GERENCIA')")
    public ResponseEntity<ApiResponse<Void>> establecerPrincipal(
            @PathVariable Long usuarioId,
            @PathVariable Long direccionId) {
        direccionService.establecerPrincipal(usuarioId, direccionId);
        return ResponseEntity.ok(ApiResponse.ok("Dirección establecida como principal", null));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("@securityUtils.getCurrentUserId() == #usuarioId or hasRole('GERENCIA')")
    public ResponseEntity<ApiResponse<Void>> eliminar(
            @PathVariable Long usuarioId,
            @PathVariable Long id) {
        direccionService.eliminar(id);
        return ResponseEntity.ok(ApiResponse.ok("Dirección eliminada correctamente", null));
    }
}