package com.example.demo.security;

import com.example.demo.modulos.gestionUsuariosRolesPermisos.entity.Usuario;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.time.Duration;
import java.util.Date;
import java.util.List;

@Service
public class JwtService {

	/**
	 * Nombre de la cookie httpOnly que transporta el JWT. Ni JavaScript ni un XSS
	 * pueden leerla: a diferencia de guardar el token en localStorage/sessionStorage,
	 * el navegador la adjunta solo el mismo en cada request y nunca la expone al DOM.
	 */
	public static final String COOKIE_NAME = "nh_token";

	private final SecretKey key;
	private final long expirationMs;

	public JwtService(@Value("${app.jwt.secret}") String secret,
			@Value("${app.jwt.expiration-ms}") long expirationMs) {
		this.key = Keys.hmacShaKeyFor(secret.getBytes());
		this.expirationMs = expirationMs;
	}

	public String generateToken(Usuario usuario, List<String> roles) {
		return Jwts.builder()
				.subject(usuario.getUsername())
				.claim("idUsuario", usuario.getId())
				.claim("roles", roles)
				.issuedAt(new Date())
				.expiration(new Date(System.currentTimeMillis() + expirationMs))
				.signWith(key)
				.compact();
	}

	public Claims extractClaims(String token) {
		return Jwts.parser()
				.verifyWith(key)
				.build()
				.parseSignedClaims(token)
				.getPayload();
	}

	public String extractUsername(String token) {
		return extractClaims(token).getSubject();
	}

	public boolean isValid(String token) {
		try {
			extractClaims(token);
			return true;
		} catch (Exception e) {
			return false;
		}
	}

	/** Cookie de sesion para el login: httpOnly (sin acceso desde JS), Secure y SameSite=Lax. */
	public ResponseCookie cookieDeSesion(String token) {
		return ResponseCookie.from(COOKIE_NAME, token)
				.httpOnly(true)
				.secure(true)
				.sameSite("Lax")
				.path("/")
				.maxAge(Duration.ofMillis(expirationMs))
				.build();
	}

	/** Misma cookie con valor vacio y edad 0: asi el navegador la descarta al instante. */
	public ResponseCookie cookieDeCierreSesion() {
		return ResponseCookie.from(COOKIE_NAME, "")
				.httpOnly(true)
				.secure(true)
				.sameSite("Lax")
				.path("/")
				.maxAge(Duration.ZERO)
				.build();
	}
}