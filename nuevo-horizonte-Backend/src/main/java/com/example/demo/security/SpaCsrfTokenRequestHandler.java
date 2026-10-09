package com.example.demo.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.security.web.csrf.CsrfTokenRequestHandler;
import org.springframework.security.web.csrf.XorCsrfTokenRequestAttributeHandler;
import org.springframework.util.StringUtils;

import java.util.function.Supplier;

/**
 * Patron oficial de Spring Security para proteger una SPA con CSRF por cookie
 * (https://docs.spring.io/spring-security/reference/servlet/exploits/csrf.html#csrf-integration-javascript-spa).
 *
 * La clave del patron es materializar el token con {@code csrfToken.get()} justo
 * dentro de {@link #handle}: ahi es donde {@code HttpFirewall} entrega la peticion
 * ya filtrada y el repositorio (CookieCsrfTokenRepository) aprovecha el momento
 * para guardar/consolidar la cookie. Si el token se fuerza a materializar mas
 * tarde (p.ej. en un filtro posterior con CsrfCookieFilter), Spring Security 7
 * considera el token ya consumido/rotado, ejecuta la logica de "token removido"
 * y la respuesta termina LIMPIANDO la cookie XSRF-TOKEN. Con la cookie limpia,
 * la siguiente peticion que modifica datos (POST/PUT/PATCH/DELETE) no tiene que
 * reenviar y el backend responde 403 Forbidden (CSRF), que es exactamente el
 * fallo que se observaba al desactivar/reactivar con filtros aplicados.
 *
 * XorCsrfTokenRequestAttributeHandler a secas enmascara el token (proteccion
 * BREACH) tanto al emitirlo como al validarlo, pensado para un <input hidden>
 * en un formulario renderizado por el servidor. Una SPA simplemente lee la
 * cookie XSRF-TOKEN con JS y repite ese mismo valor, sin mascara, en el header
 * X-XSRF-TOKEN. Por eso al RESOLVER el valor entrante se usa el handler "plain"
 * cuando llega por header (nuestro caso) y el "xor" solo cuando viene por
 * parametro de formulario.
 */
final class SpaCsrfTokenRequestHandler implements CsrfTokenRequestHandler {

	private final CsrfTokenRequestHandler plain = new CsrfTokenRequestAttributeHandler();
	private final CsrfTokenRequestHandler xor = new XorCsrfTokenRequestAttributeHandler();

	@Override
	public void handle(HttpServletRequest request, HttpServletResponse response, Supplier<CsrfToken> csrfToken) {
		this.xor.handle(request, response, csrfToken);
		csrfToken.get();
	}

	@Override
	public String resolveCsrfTokenValue(HttpServletRequest request, CsrfToken csrfToken) {
		String headerValue = request.getHeader(csrfToken.getHeaderName());
		return (StringUtils.hasText(headerValue) ? this.plain : this.xor).resolveCsrfTokenValue(request, csrfToken);
	}
}