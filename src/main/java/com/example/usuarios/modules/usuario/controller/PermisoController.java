package com.example.usuarios.modules.usuario.controller;

import com.example.usuarios.modules.usuario.dto.request.PermisoCreateRequest;
import com.example.usuarios.modules.usuario.dto.request.PermisoUpdateRequest;
import com.example.usuarios.modules.usuario.dto.response.PermisoResponse;
import com.example.usuarios.modules.usuario.service.PermisoService;
import com.example.usuarios.common.api.ApiResponse;
import com.example.usuarios.common.api.PaginationResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/permisos")
@RequiredArgsConstructor
public class PermisoController {

    private final PermisoService permisoService;

    @PostMapping
    @PreAuthorize("hasRole('GERENCIA')")
    public ResponseEntity<ApiResponse<PermisoResponse>> crear(@Valid @RequestBody PermisoCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Permiso creado correctamente", permisoService.crear(request)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('GERENCIA')")
    public ResponseEntity<ApiResponse<PermisoResponse>> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(permisoService.obtenerPorId(id)));
    }

    @GetMapping
    @PreAuthorize("hasRole('GERENCIA')")
    public ResponseEntity<ApiResponse<PaginationResponse<PermisoResponse>>> listar(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String recurso) {
        return ResponseEntity.ok(ApiResponse.ok(permisoService.listar(page, size, recurso)));
    }

    @GetMapping("/recurso/{recurso}")
    @PreAuthorize("hasRole('GERENCIA')")
    public ResponseEntity<ApiResponse<List<PermisoResponse>>> listarPorRecurso(@PathVariable String recurso) {
        return ResponseEntity.ok(ApiResponse.ok(permisoService.listarPorRecurso(recurso)));
    }

    @GetMapping("/todos")
    @PreAuthorize("hasRole('GERENCIA')")
    public ResponseEntity<ApiResponse<List<PermisoResponse>>> listarTodos() {
        return ResponseEntity.ok(ApiResponse.ok(permisoService.listarTodos()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('GERENCIA')")
    public ResponseEntity<ApiResponse<PermisoResponse>> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody PermisoUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Permiso actualizado correctamente", permisoService.actualizar(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('GERENCIA')")
    public ResponseEntity<ApiResponse<Void>> eliminar(@PathVariable Long id) {
        permisoService.eliminar(id);
        return ResponseEntity.ok(ApiResponse.ok("Permiso eliminado correctamente", null));
    }
}