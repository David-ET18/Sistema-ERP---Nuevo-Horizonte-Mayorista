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
import com.example.demo.integration.EmailService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class PasswordResetService {

	private final UsuarioRepository usuarioRepository;
	private final PasswordResetTokenRepository tokenRepository;
	private final HistorialPasswordRepository historialRepository;
	private final PasswordEncoder passwordEncoder;
	private final EmailService emailService;

	@Value("${app.frontend-url}")
	private String frontendUrl;

	@Value("${app.password-reset.expiration-minutes:30}")
	private long expirationMinutes;

	public PasswordResetService(UsuarioRepository usuarioRepository,
			PasswordResetTokenRepository tokenRepository,
			HistorialPasswordRepository historialRepository,
			PasswordEncoder passwordEncoder,
			EmailService emailService) {
		this.usuarioRepository = usuarioRepository;
		this.tokenRepository = tokenRepository;
		this.historialRepository = historialRepository;
		this.passwordEncoder = passwordEncoder;
		this.emailService = emailService;
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
	 * Envia el enlace de recuperacion al correo registrado. EmailService ya
	 * resuelve el "como" (Resend si app.email.enabled=true, consola/log si no);
	 * aqui no hace falta manejar fallos de red: la implementacion de consola
	 * nunca falla, y ResendEmailService absorbe sus propios errores sin
	 * interrumpir este flujo.
	 */
	private void enviarEnlace(String email, String link) {
		emailService.enviar(email, "Recupera tu contraseña - Nuevo Horizonte", cuerpoCorreo(link));
	}

	/**
	 * Tabla en vez de flex/grid: es lo unico que Outlook de escritorio
	 * renderiza bien (usa el motor de Word, no un navegador real). El logo
	 * es blanco (pensado para fondo oscuro, ver BrandLogo.tsx), por eso la
	 * franja superior oscura en vez de ponerlo sobre blanco.
	 */
	private String cuerpoCorreo(String link) {
		String logoUrl = frontendUrl + "/brand/logo-nh.png";
		return """
				<!doctype html>
				<html lang="es">
				<body style="margin:0; padding:0; background-color:#f3f4f6; font-family:Arial, Helvetica, sans-serif;">
					<table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6; padding:32px 16px;">
						<tr>
							<td align="center">
								<table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px; width:100%%; background-color:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 1px 3px rgba(0,0,0,0.08);">
									<tr>
										<td align="center" style="background-color:#0b1b3a; padding:28px 24px;">
											<img src="%s" alt="Nuevo Horizonte" height="28" style="display:block; height:28px; border:0;" />
										</td>
									</tr>
									<tr>
										<td style="padding:36px 32px 28px;">
											<h1 style="margin:0 0 16px; color:#111827; font-size:21px; font-weight:bold;">Recupera tu contraseña</h1>
											<p style="margin:0 0 24px; color:#4b5563; font-size:14px; line-height:1.6;">
												Recibimos una solicitud para restablecer la contraseña de tu cuenta en
												<strong>Nuevo Horizonte Mayorista</strong>. Haz clic en el siguiente botón
												para crear una nueva.
											</p>
											<table role="presentation" cellpadding="0" cellspacing="0">
												<tr>
													<td align="center" style="border-radius:8px; background-color:#0b1b3a;">
														<a href="%s"
															style="display:inline-block; padding:12px 28px; color:#ffffff; font-size:14px; font-weight:bold; text-decoration:none;">
															Crear nueva contraseña
														</a>
													</td>
												</tr>
											</table>
											<p style="margin:28px 0 0; color:#6b7280; font-size:12.5px; line-height:1.6;">
												Si el botón no funciona, copia y pega este enlace en tu navegador:
											</p>
											<p style="margin:6px 0 0; word-break:break-all; font-size:12.5px;">
												<a href="%s" style="color:#0b1b3a;">%s</a>
											</p>
											<p style="margin:24px 0 0; padding-top:20px; border-top:1px solid #e5e7eb; color:#9ca3af; font-size:12px; line-height:1.6;">
												Este enlace vence en %d minutos. Si tú no solicitaste este cambio,
												puedes ignorar este correo con tranquilidad: tu contraseña actual
												sigue funcionando.
											</p>
										</td>
									</tr>
								</table>
								<p style="margin:20px 0 0; color:#9ca3af; font-size:11.5px;">
									Nuevo Horizonte Mayorista
								</p>
							</td>
						</tr>
					</table>
				</body>
				</html>
				"""
				.formatted(logoUrl, link, link, link, expirationMinutes);
	}
}