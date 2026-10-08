package com.example.demo.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

	private final JwtAuthFilter jwtAuthFilter;
	private final String frontendUrl;

	public SecurityConfig(JwtAuthFilter jwtAuthFilter, @Value("${app.frontend-url}") String frontendUrl) {
		this.jwtAuthFilter = jwtAuthFilter;
		this.frontendUrl = frontendUrl;
	}

	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		// El JWT ahora viaja en una cookie httpOnly (ver JwtService), no en un header
		// Authorization leido por JS. Eso obliga a proteger contra CSRF: el navegador
		// adjunta la cookie solo en cualquier request a este origen, venga o no de
		// nuestra propia pagina. CookieCsrfTokenRepository implementa "doble envio":
		// el cliente debe repetir en el header X-XSRF-TOKEN el valor de la cookie
		// XSRF-TOKEN (legible por JS a proposito, no es secreta), algo que un sitio
		// atacante no puede hacer porque no puede leer cookies de este dominio.
		http
			.cors(cors -> cors.configurationSource(corsConfigurationSource()))
			.csrf(csrf -> csrf
				.csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
				.csrfTokenRequestHandler(new SpaCsrfTokenRequestHandler())
				.ignoringRequestMatchers(
					"/api/auth/login",
					"/api/auth/logout",
					"/api/auth/recuperar-password",
					"/api/auth/reset-password"))
			.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
			.authorizeHttpRequests(auth -> auth
				.requestMatchers(
					"/api/auth/login",
					"/api/auth/logout",
					"/api/auth/recuperar-password",
					"/api/auth/reset-password",
					"/api/gestion-agencias/logo/**").permitAll()
				.anyRequest().authenticated())
			.addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
			.addFilterAfter(new CsrfCookieFilter(), CsrfFilter.class);
		return http.build();
	}

	/**
	 * Credenciales (cookies) entre origenes solo se permiten si el origen esta
	 * en una lista explicita; con "*" el navegador las bloquea siempre.
	 */
	@Bean
	public CorsConfigurationSource corsConfigurationSource() {
		CorsConfiguration config = new CorsConfiguration();
		config.setAllowedOrigins(List.of(frontendUrl));
		config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
		config.setAllowedHeaders(List.of("*"));
		config.setAllowCredentials(true);

		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", config);
		return source;
	}

	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}
}
