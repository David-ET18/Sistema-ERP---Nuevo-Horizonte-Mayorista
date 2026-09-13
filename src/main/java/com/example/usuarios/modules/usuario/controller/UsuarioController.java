package com.example.usuarios.modules.usuario.controller;

import com.example.usuarios.modules.usuario.dto.request.UsuarioCreateRequest;
import com.example.usuarios.modules.usuario.dto.request.UsuarioUpdateRequest;
import com.example.usuarios.modules.usuario.dto.response.UsuarioResponse;
import com.example.usuarios.modules.usuario.service.UsuarioService;
import com.example.usuarios.common.api.ApiResponse;
import com.example.usuarios.common.api.PaginationResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;

    @PostMapping
    @PreAuthorize("hasRole('GERENCIA')")
    public ResponseEntity<ApiResponse<UsuarioResponse>> crear(@Valid @RequestBody UsuarioCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Usuario creado correctamente", usuarioService.crear(request)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('GERENCIA') or @securityUtils.getCurrentUserId() == #id")
    public ResponseEntity<ApiResponse<UsuarioResponse>> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(usuarioService.obtenerPorId(id)));
    }

    @GetMapping("/email/{email}")
    @PreAuthorize("hasRole('GERENCIA')")
    public ResponseEntity<ApiResponse<UsuarioResponse>> obtenerPorEmail(@PathVariable String email) {
        return ResponseEntity.ok(ApiResponse.ok(usuarioService.obtenerPorEmail(email)));
    }

    @GetMapping
    @PreAuthorize("hasRole('GERENCIA')")
    public ResponseEntity<ApiResponse<PaginationResponse<UsuarioResponse>>> listar(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) com.example.usuarios.modules.usuario.entity.Rol.RolNombre rol) {
        return ResponseEntity.ok(ApiResponse.ok(usuarioService.listar(page, size, search, rol)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('GERENCIA') or @securityUtils.getCurrentUserId() == #id")
    public ResponseEntity<ApiResponse<UsuarioResponse>> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody UsuarioUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Usuario actualizado correctamente", usuarioService.actualizar(id, request)));
    }

    @PatchMapping("/{id}/estado")
    @PreAuthorize("hasRole('GERENCIA')")
    public ResponseEntity<ApiResponse<Void>> cambiarEstado(
            @PathVariable Long id,
            @RequestParam boolean activo) {
        usuarioService.cambiarEstado(id, activo);
        return ResponseEntity.ok(ApiResponse.ok(activo ? "Usuario activado" : "Usuario desactivado", null));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('GERENCIA')")
    public ResponseEntity<ApiResponse<Void>> eliminar(@PathVariable Long id) {
        usuarioService.eliminar(id);
        return ResponseEntity.ok(ApiResponse.ok("Usuario eliminado correctamente", null));
    }

    @PostMapping("/{usuarioId}/roles/{rolId}")
    @PreAuthorize("hasRole('GERENCIA')")
    public ResponseEntity<ApiResponse<Void>> asignarRol(@PathVariable Long usuarioId, @PathVariable Long rolId) {
        usuarioService.asignarRol(usuarioId, rolId);
        return ResponseEntity.ok(ApiResponse.ok("Rol asignado correctamente", null));
    }

    @DeleteMapping("/{usuarioId}/roles/{rolId}")
    @PreAuthorize("hasRole('GERENCIA')")
    public ResponseEntity<ApiResponse<Void>> removerRol(@PathVariable Long usuarioId, @PathVariable Long rolId) {
        usuarioService.removerRol(usuarioId, rolId);
        return ResponseEntity.ok(ApiResponse.ok("Rol removido correctamente", null));
    }
}