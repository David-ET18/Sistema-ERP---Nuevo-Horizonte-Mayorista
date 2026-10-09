package com.example.demo.integration;

import tools.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.Map;

/**
 * Envia correos reales via la API HTTP de Resend (resend.com). Se activa solo
 * con app.email.enabled=true; mientras tanto, EmailConsolaService (el
 * fallback por defecto) se encarga de todo.
 */
@Component
@ConditionalOnProperty(name = "app.email.enabled", havingValue = "true")
public class ResendEmailService implements EmailService {

	private static final Logger log = LoggerFactory.getLogger(ResendEmailService.class);
	private static final URI RESEND_URL = URI.create("https://api.resend.com/emails");

	// Se crea perezosamente (no en el constructor): si algun entorno no puede
	// abrir el socket/selector que HttpClient necesita, eso solo rompe el
	// envio de correos (se captura abajo), no el arranque entero de la app.
	private volatile HttpClient httpClient;
	private final ObjectMapper objectMapper;

	@Value("${app.resend.api-key}")
	private String apiKey;

	@Value("${app.resend.from}")
	private String remitente;

	public ResendEmailService(ObjectMapper objectMapper) {
		this.objectMapper = objectMapper;
	}

	@Override
	public void enviar(String destinatario, String asunto, String cuerpo) {
		if (apiKey == null || apiKey.isBlank()) {
			log.warn("RESEND_API_KEY no configurada; no se envio el correo a {}", destinatario);
			return;
		}
		try {
			Map<String, Object> payload = Map.of(
					"from", remitente,
					"to", List.of(destinatario),
					"subject", asunto,
					"html", cuerpo);
			HttpRequest request = HttpRequest.newBuilder()
					.uri(RESEND_URL)
					.timeout(Duration.ofSeconds(10))
					.header("Authorization", "Bearer " + apiKey)
					.header("Content-Type", "application/json")
					.POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(payload)))
					.build();

			HttpResponse<String> response = cliente().send(request, HttpResponse.BodyHandlers.ofString());
			if (response.statusCode() >= 200 && response.statusCode() < 300) {
				log.info("Correo enviado a {} via Resend", destinatario);
			}
			else {
				log.error("Resend respondio {} al enviar correo a {}: {}", response.statusCode(), destinatario,
						response.body());
			}
		}
		catch (IOException | RuntimeException ex) {
			log.error("No se pudo enviar el correo a {} via Resend: {}", destinatario, ex.getMessage());
		}
		catch (InterruptedException ex) {
			Thread.currentThread().interrupt();
			log.error("Envio de correo a {} via Resend interrumpido", destinatario);
		}
	}

	private HttpClient cliente() {
		HttpClient actual = httpClient;
		if (actual == null) {
			synchronized (this) {
				actual = httpClient;
				if (actual == null) {
					actual = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build();
					httpClient = actual;
				}
			}
		}
		return actual;
	}
}
