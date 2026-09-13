package com.example.usuarios.modules.usuario.controller;

import com.example.usuarios.common.api.ApiResponse;
import com.example.usuarios.modules.usuario.dto.request.LoginRequest;
import com.example.usuarios.modules.usuario.dto.request.RegisterRequest;
import com.example.usuarios.modules.usuario.dto.response.AuthResponse;
import com.example.usuarios.modules.usuario.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Cuenta creada correctamente", authService.register(request)));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Inicio de sesion exitoso", authService.login(request)));
    }
}
