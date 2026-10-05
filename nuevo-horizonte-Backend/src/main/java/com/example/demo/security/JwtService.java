package com.example.demo.security;

import com.example.demo.modulos.gestionUsuariosRolesPermisos.entity.Usuario;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.List;

@Service
public class JwtService {

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
}