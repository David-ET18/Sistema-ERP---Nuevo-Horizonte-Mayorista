package com.example.demo.modulos.gestionUsuariosRolesPermisos.controller;

import com.example.demo.modulos.gestionUsuariosRolesPermisos.dto.CambiarPasswordRequest;
import com.example.demo.modulos.gestionUsuariosRolesPermisos.dto.ForgotPasswordRequest;
import com.example.demo.modulos.gestionUsuariosRolesPermisos.dto.LoginRequest;
import com.example.demo.modulos.gestionUsuariosRolesPermisos.dto.LoginResponse;
import com.example.demo.modulos.gestionUsuariosRolesPermisos.dto.MessageResponse;
import com.example.demo.modulos.gestionUsuariosRolesPermisos.dto.PerfilUpdateRequest;
import com.example.demo.modulos.gestionUsuariosRolesPermisos.dto.RegisterRequest;
import com.example.demo.modulos.gestionUsuariosRolesPermisos.dto.ResetPasswordRequest;
import com.example.demo.modulos.gestionUsuariosRolesPermisos.dto.UsuarioDTO;
import com.example.demo.modulos.gestionUsuariosRolesPermisos.service.AuthService;
import com.example.demo.modulos.gestionUsuariosRolesPermisos.service.PasswordResetService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

	private final AuthService authService;
	private final PasswordResetService passwordResetService;

	public AuthController(AuthService authService, PasswordResetService passwordResetService) {
		this.authService = authService;
		this.passwordResetService = passwordResetService;
	}

	@PostMapping("/login")
	public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
		return ResponseEntity.ok(authService.login(request));
	}

	@PostMapping("/register")
	public ResponseEntity<LoginResponse> register(@Valid @RequestBody RegisterRequest request) {
		return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
	}

	@PostMapping("/recuperar-password")
	public ResponseEntity<MessageResponse> recuperarPassword(
			@Valid @RequestBody ForgotPasswordRequest request) {
		return ResponseEntity.ok(passwordResetService.forgotPassword(request));
	}

	@PostMapping("/reset-password")
	public ResponseEntity<MessageResponse> resetPassword(
			@Valid @RequestBody ResetPasswordRequest request) {
		return ResponseEntity.ok(passwordResetService.resetPassword(request));
	}

	@GetMapping("/me")
	public ResponseEntity<UsuarioDTO> obtenerPerfil() {
		return ResponseEntity.ok(authService.obtenerPerfil());
	}

	@PutMapping("/me")
	public ResponseEntity<UsuarioDTO> actualizarPerfil(@Valid @RequestBody PerfilUpdateRequest request) {
		return ResponseEntity.ok(authService.actualizarPerfil(request));
	}

	@PostMapping("/cambiar-password")
	public ResponseEntity<MessageResponse> cambiarPassword(@Valid @RequestBody CambiarPasswordRequest request) {
		return ResponseEntity.ok(authService.cambiarPassword(request));
	}
}
