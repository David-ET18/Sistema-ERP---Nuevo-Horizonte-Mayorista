package com.example.usuarios.modules.usuario.controller;

import com.example.usuarios.modules.usuario.dto.request.ProveedorCreateRequest;
import com.example.usuarios.modules.usuario.dto.request.ProveedorUpdateRequest;
import com.example.usuarios.modules.usuario.dto.response.ProveedorResponse;
import com.example.usuarios.modules.usuario.service.ProveedorService;
import com.example.usuarios.common.api.ApiResponse;
import com.example.usuarios.common.api.PaginationResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/proveedores")
@RequiredArgsConstructor
public class ProveedorController {

    private final ProveedorService proveedorService;

    @PostMapping("/usuario/{usuarioId}")
    @PreAuthorize("@securityUtils.getCurrentUserId() == #usuarioId or hasRole('GERENCIA')")
    public ResponseEntity<ApiResponse<ProveedorResponse>> crear(
            @PathVariable Long usuarioId,
            @Valid @RequestBody ProveedorCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Proveedor creado correctamente", proveedorService.crear(usuarioId, request)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('GERENCIA') or @proveedorService.obtenerPorId(#id).usuario.id == @securityUtils.getCurrentUserId()")
    public ResponseEntity<ApiResponse<ProveedorResponse>> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(proveedorService.obtenerPorId(id)));
    }

    @GetMapping("/usuario/{usuarioId}")
    @PreAuthorize("@securityUtils.getCurrentUserId() == #usuarioId or hasRole('GERENCIA')")
    public ResponseEntity<ApiResponse<ProveedorResponse>> obtenerPorUsuarioId(@PathVariable Long usuarioId) {
        return ResponseEntity.ok(ApiResponse.ok(proveedorService.obtenerPorUsuarioId(usuarioId)));
    }

    @GetMapping
    @PreAuthorize("hasRole('GERENCIA')")
    public ResponseEntity<ApiResponse<PaginationResponse<ProveedorResponse>>> listar(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Boolean activo) {
        return ResponseEntity.ok(ApiResponse.ok(proveedorService.listar(page, size, activo)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('GERENCIA') or @proveedorService.obtenerPorId(#id).usuario.id == @securityUtils.getCurrentUserId()")
    public ResponseEntity<ApiResponse<ProveedorResponse>> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody ProveedorUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Proveedor actualizado correctamente", proveedorService.actualizar(id, request)));
    }

    @PatchMapping("/{id}/estado")
    @PreAuthorize("hasRole('GERENCIA')")
    public ResponseEntity<ApiResponse<Void>> cambiarEstado(
            @PathVariable Long id,
            @RequestParam boolean activo) {
        proveedorService.cambiarEstado(id, activo);
        return ResponseEntity.ok(ApiResponse.ok(activo ? "Proveedor activado" : "Proveedor desactivado", null));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('GERENCIA')")
    public ResponseEntity<ApiResponse<Void>> eliminar(@PathVariable Long id) {
        proveedorService.eliminar(id);
        return ResponseEntity.ok(ApiResponse.ok("Proveedor eliminado correctamente", null));
    }
}