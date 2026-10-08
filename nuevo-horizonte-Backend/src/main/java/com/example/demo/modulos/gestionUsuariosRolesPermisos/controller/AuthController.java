package com.example.demo.modulos.gestionUsuariosRolesPermisos.controller;

import com.example.demo.modulos.gestionUsuariosRolesPermisos.dto.CambiarPasswordRequest;
import com.example.demo.modulos.gestionUsuariosRolesPermisos.dto.ForgotPasswordRequest;
import com.example.demo.modulos.gestionUsuariosRolesPermisos.dto.LoginRequest;
import com.example.demo.modulos.gestionUsuariosRolesPermisos.dto.LoginResponse;
import com.example.demo.modulos.gestionUsuariosRolesPermisos.dto.MessageResponse;
import com.example.demo.modulos.gestionUsuariosRolesPermisos.dto.PerfilUpdateRequest;
import com.example.demo.modulos.gestionUsuariosRolesPermisos.dto.ResetPasswordRequest;
import com.example.demo.modulos.gestionUsuariosRolesPermisos.dto.UsuarioDTO;
import com.example.demo.modulos.gestionUsuariosRolesPermisos.service.AuthService;
import com.example.demo.modulos.gestionUsuariosRolesPermisos.service.PasswordResetService;
import com.example.demo.security.JwtService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
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
	private final JwtService jwtService;

	public AuthController(AuthService authService, PasswordResetService passwordResetService, JwtService jwtService) {
		this.authService = authService;
		this.passwordResetService = passwordResetService;
		this.jwtService = jwtService;
	}

	/**
	 * El JWT nunca viaja en el cuerpo de la respuesta: se entrega solo como
	 * cookie httpOnly (ver JwtService.cookieDeSesion), para que ningun script
	 * en el navegador (ni uno inyectado por XSS) pueda leerlo.
	 */
	@PostMapping("/login")
	public ResponseEntity<UsuarioDTO> login(@Valid @RequestBody LoginRequest request, HttpServletResponse response) {
		LoginResponse resultado = authService.login(request);
		response.addHeader(HttpHeaders.SET_COOKIE, jwtService.cookieDeSesion(resultado.token()).toString());
		return ResponseEntity.ok(resultado.usuario());
	}

	@PostMapping("/logout")
	public ResponseEntity<Void> logout(HttpServletResponse response) {
		response.addHeader(HttpHeaders.SET_COOKIE, jwtService.cookieDeCierreSesion().toString());
		return ResponseEntity.noContent().build();
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
