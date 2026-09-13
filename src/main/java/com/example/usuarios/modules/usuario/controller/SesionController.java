package com.example.usuarios.modules.usuario.controller;

import com.example.usuarios.modules.usuario.dto.response.SesionResponse;
import com.example.usuarios.modules.usuario.service.SesionService;
import com.example.usuarios.common.api.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sesiones")
@RequiredArgsConstructor
public class SesionController {

    private final SesionService sesionService;

    @GetMapping("/token/{token}")
    @PreAuthorize("hasRole('GERENCIA')")
    public ResponseEntity<ApiResponse<SesionResponse>> obtenerPorToken(@PathVariable String token) {
        return ResponseEntity.ok(ApiResponse.ok(sesionService.obtenerPorToken(token)));
    }

    @GetMapping("/usuario/{usuarioId}")
    @PreAuthorize("@securityUtils.getCurrentUserId() == #usuarioId or hasRole('GERENCIA')")
    public ResponseEntity<ApiResponse<List<SesionResponse>>> listarActivasPorUsuario(@PathVariable Long usuarioId) {
        return ResponseEntity.ok(ApiResponse.ok(sesionService.listarActivasPorUsuario(usuarioId)));
    }

    @DeleteMapping("/token/{token}")
    @PreAuthorize("@securityUtils.getCurrentUserId() == @sesionService.obtenerPorToken(#token).usuario.id or hasRole('GERENCIA')")
    public ResponseEntity<ApiResponse<Void>> revocarSesion(@PathVariable String token) {
        sesionService.revocarSesion(token);
        return ResponseEntity.ok(ApiResponse.ok("Sesión revocada correctamente", null));
    }

    @DeleteMapping("/usuario/{usuarioId}/todas")
    @PreAuthorize("@securityUtils.getCurrentUserId() == #usuarioId or hasRole('GERENCIA')")
    public ResponseEntity<ApiResponse<Void>> revocarTodasSesionesUsuario(@PathVariable Long usuarioId) {
        sesionService.revocarTodasSesionesUsuario(usuarioId);
        return ResponseEntity.ok(ApiResponse.ok("Todas las sesiones revocadas correctamente", null));
    }

    @PostMapping("/limpiar-expiradas")
    @PreAuthorize("hasRole('GERENCIA')")
    public ResponseEntity<ApiResponse<Void>> limpiarSesionesExpiradas() {
        sesionService.limpiarSesionesExpiradas();
        return ResponseEntity.ok(ApiResponse.ok("Sesiones expiradas limpiadas correctamente", null));
    }
}