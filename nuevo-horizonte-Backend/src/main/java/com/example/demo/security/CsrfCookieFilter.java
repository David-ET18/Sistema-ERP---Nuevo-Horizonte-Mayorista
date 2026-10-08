package com.example.demo.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * CookieCsrfTokenRepository genera y guarda la cookie XSRF-TOKEN de forma
 * perezosa: solo cuando algo "usa" el CsrfToken (p.ej. un formulario server-side
 * que lo imprime). En una API pura nada lo usa nunca, asi que sin este filtro
 * la cookie jamas se escribiria y el frontend no tendria nada que reenviar en
 * el header X-XSRF-TOKEN. Forzar la lectura de getToken() aqui dispara ese guardado.
 * Patron documentado por Spring Security para proteger SPAs con CSRF por cookie.
 */
public class CsrfCookieFilter extends OncePerRequestFilter {

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {
		CsrfToken csrfToken = (CsrfToken) request.getAttribute("_csrf");
		if (csrfToken != null) {
			csrfToken.getToken();
		}
		filterChain.doFilter(request, response);
	}
}
