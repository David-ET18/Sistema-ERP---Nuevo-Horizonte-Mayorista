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
 * XorCsrfTokenRequestAttributeHandler a secas enmascara el token (proteccion
 * BREACH) tanto al emitirlo como al validarlo, pensado para un <input hidden>
 * en un formulario renderizado por el servidor. Una SPA simplemente lee la
 * cookie XSRF-TOKEN con JS y repite ese mismo valor, sin mascara, en el header
 * X-XSRF-TOKEN: si el servidor intenta des-enmascararlo igual, nunca calza y
 * cualquier POST/PUT/DELETE legitimo termina en 403 (el bug que se vio al
 * probar "Nuevo rol": el token nunca era invalido, el servidor lo estaba
 * decodificando con una logica pensada para otro caso).
 *
 * Esta clase usa el manejo "Xor" solo para la parte que persiste/genera el
 * token (mantiene la proteccion BREACH si algo renderiza un formulario), pero
 * al resolver el token de una request entrante prioriza el valor crudo del
 * header, que es exactamente lo que el interceptor de axios en el frontend
 * reenvia.
 */
final class SpaCsrfTokenRequestHandler extends CsrfTokenRequestAttributeHandler {

	private final CsrfTokenRequestHandler delegate = new XorCsrfTokenRequestAttributeHandler();

	@Override
	public void handle(HttpServletRequest request, HttpServletResponse response, Supplier<CsrfToken> csrfToken) {
		this.delegate.handle(request, response, csrfToken);
	}

	@Override
	public String resolveCsrfTokenValue(HttpServletRequest request, CsrfToken csrfToken) {
		String headerValue = request.getHeader(csrfToken.getHeaderName());
		return StringUtils.hasText(headerValue) ? headerValue : super.resolveCsrfTokenValue(request, csrfToken);
	}
}
