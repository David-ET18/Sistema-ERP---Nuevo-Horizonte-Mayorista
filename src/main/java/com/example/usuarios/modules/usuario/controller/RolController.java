package com.example.usuarios.modules.usuario.controller;

import com.example.usuarios.modules.usuario.dto.request.RolCreateRequest;
import com.example.usuarios.modules.usuario.dto.request.RolUpdateRequest;
import com.example.usuarios.modules.usuario.dto.response.RolResponse;
import com.example.usuarios.modules.usuario.service.RolService;
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
@RequestMapping("/api/roles")
@RequiredArgsConstructor
public class RolController {

    private final RolService rolService;

    @PostMapping
    @PreAuthorize("hasRole('GERENCIA')")
    public ResponseEntity<ApiResponse<RolResponse>> crear(@Valid @RequestBody RolCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Rol creado correctamente", rolService.crear(request)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('GERENCIA')")
    public ResponseEntity<ApiResponse<RolResponse>> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(rolService.obtenerPorId(id)));
    }

    @GetMapping("/nombre/{nombre}")
    @PreAuthorize("hasRole('GERENCIA')")
    public ResponseEntity<ApiResponse<RolResponse>> obtenerPorNombre(@PathVariable com.example.usuarios.modules.usuario.entity.Rol.RolNombre nombre) {
        return ResponseEntity.ok(ApiResponse.ok(rolService.obtenerPorNombre(nombre)));
    }

    @GetMapping
    @PreAuthorize("hasRole('GERENCIA')")
    public ResponseEntity<ApiResponse<PaginationResponse<RolResponse>>> listar(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.ok(rolService.listar(page, size)));
    }

    @GetMapping("/todos")
    @PreAuthorize("hasRole('GERENCIA')")
    public ResponseEntity<ApiResponse<List<RolResponse>>> listarTodos() {
        return ResponseEntity.ok(ApiResponse.ok(rolService.listarTodos()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('GERENCIA')")
    public ResponseEntity<ApiResponse<RolResponse>> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody RolUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Rol actualizado correctamente", rolService.actualizar(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('GERENCIA')")
    public ResponseEntity<ApiResponse<Void>> eliminar(@PathVariable Long id) {
        rolService.eliminar(id);
        return ResponseEntity.ok(ApiResponse.ok("Rol eliminado correctamente", null));
    }

    @PostMapping("/{rolId}/permisos/{permisoId}")
    @PreAuthorize("hasRole('GERENCIA')")
    public ResponseEntity<ApiResponse<Void>> asignarPermiso(@PathVariable Long rolId, @PathVariable Long permisoId) {
        rolService.asignarPermiso(rolId, permisoId);
        return ResponseEntity.ok(ApiResponse.ok("Permiso asignado correctamente", null));
    }

    @DeleteMapping("/{rolId}/permisos/{permisoId}")
    @PreAuthorize("hasRole('GERENCIA')")
    public ResponseEntity<ApiResponse<Void>> removerPermiso(@PathVariable Long rolId, @PathVariable Long permisoId) {
        rolService.removerPermiso(rolId, permisoId);
        return ResponseEntity.ok(ApiResponse.ok("Permiso removido correctamente", null));
    }
}