package com.example.demo.modulos.gestionUsuariosRolesPermisos.service;

import com.example.demo.modulos.gestionUsuariosRolesPermisos.dto.ForgotPasswordRequest;
import com.example.demo.modulos.gestionUsuariosRolesPermisos.dto.MessageResponse;
import com.example.demo.modulos.gestionUsuariosRolesPermisos.dto.ResetPasswordRequest;
import com.example.demo.modulos.gestionUsuariosRolesPermisos.entity.HistorialPassword;
import com.example.demo.modulos.gestionUsuariosRolesPermisos.entity.PasswordResetToken;
import com.example.demo.modulos.gestionUsuariosRolesPermisos.entity.Usuario;
import com.example.demo.modulos.gestionUsuariosRolesPermisos.repository.HistorialPasswordRepository;
import com.example.demo.modulos.gestionUsuariosRolesPermisos.repository.PasswordResetTokenRepository;
import com.example.demo.modulos.gestionUsuariosRolesPermisos.repository.UsuarioRepository;
import com.example.demo.exception.BusinessException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class PasswordResetService {

	private static final Logger log = LoggerFactory.getLogger(PasswordResetService.class);

	private final UsuarioRepository usuarioRepository;
	private final PasswordResetTokenRepository tokenRepository;
	private final HistorialPasswordRepository historialRepository;
	private final PasswordEncoder passwordEncoder;

	@Value("${app.frontend-url}")
	private String frontendUrl;

	@Value("${app.password-reset.expiration-minutes:30}")
	private long expirationMinutes;

	public PasswordResetService(UsuarioRepository usuarioRepository,
			PasswordResetTokenRepository tokenRepository,
			HistorialPasswordRepository historialRepository,
			PasswordEncoder passwordEncoder) {
		this.usuarioRepository = usuarioRepository;
		this.tokenRepository = tokenRepository;
		this.historialRepository = historialRepository;
		this.passwordEncoder = passwordEncoder;
	}

	/**
	 * Solicita la recuperacion de contrasena. Siempre responde el mismo mensaje
	 * generico (exista o no el correo) para no revelar que correos estan registrados.
	 */
	@Transactional
	public MessageResponse forgotPassword(ForgotPasswordRequest request) {
		usuarioRepository.findByEmail(request.email()).ifPresent(usuario -> {
			tokenRepository.deleteByUsuario_Id(usuario.getId());

			String token = UUID.randomUUID().toString().replace("-", "");
			PasswordResetToken reset = new PasswordResetToken();
			reset.setUsuario(usuario);
			reset.setToken(token);
			reset.setFechaExpiracion(LocalDateTime.now().plusMinutes(expirationMinutes));
			reset.setFechaCreacion(LocalDateTime.now());
			tokenRepository.save(reset);

			String link = frontendUrl + "/reset-password?token=" + token;
			enviarEnlace(usuario.getEmail(), link);
		});

		return new MessageResponse(
				"Si el correo existe en el sistema, se ha enviado un enlace de recuperacion.");
	}

	@Transactional
	public MessageResponse resetPassword(ResetPasswordRequest request) {
		PasswordResetToken reset = tokenRepository.findByToken(request.token())
				.filter(token -> !token.isUsado())
				.orElseThrow(() -> new BusinessException("El enlace de recuperacion no es valido"));

		if (reset.getFechaExpiracion().isBefore(LocalDateTime.now())) {
			throw new BusinessException("El enlace de recuperacion ha expirado");
		}

		Usuario usuario = reset.getUsuario();

		List<HistorialPassword> recientes =
				historialRepository.findTop3ByUsuario_IdOrderByFechaCambioDesc(usuario.getId());
		for (HistorialPassword historial : recientes) {
			if (passwordEncoder.matches(request.nuevaContrasena(), historial.getHashPassword())) {
				throw new BusinessException(
						"La nueva contrasena no puede ser igual a alguna de las contrasenas anteriores");
			}
		}

		String nuevoHash = passwordEncoder.encode(request.nuevaContrasena());
		usuario.setPasswordHash(nuevoHash);
		usuarioRepository.save(usuario);

		HistorialPassword historial = new HistorialPassword();
		historial.setUsuario(usuario);
		historial.setHashPassword(nuevoHash);
		historial.setFechaCambio(LocalDateTime.now());
		historialRepository.save(historial);

		reset.setUsado(true);
		tokenRepository.save(reset);

		return new MessageResponse("Contrasena actualizada exitosamente.");
	}

	/**
	 * Envia el enlace de recuperacion. Durante el desarrollo se registra en consola;
	 * para produccion integrar JavaMailSender (spring-boot-starter-mail) con SMTP.
	 */
	private void enviarEnlace(String email, String link) {
		log.info("=== RECUPERACION DE CONTRASENA ===");
		log.info("Destinatario: {}", email);
		log.info("Enlace de recuperacion (modo desarrollo): {}", link);
	}
}