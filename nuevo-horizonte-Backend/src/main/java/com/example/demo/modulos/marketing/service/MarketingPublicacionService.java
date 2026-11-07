package com.example.demo.modulos.marketing.service;

import com.example.demo.exception.BusinessException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import tools.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Base64;
import java.util.Map;

@Service
public class MarketingPublicacionService {

	private static final Logger log = LoggerFactory.getLogger(MarketingPublicacionService.class);

	private final HttpClient httpClient = HttpClient.newBuilder()
			.connectTimeout(Duration.ofSeconds(10))
			.build();
	private final ObjectMapper objectMapper;

	@Value("${app.n8n.webhook-marketing:}")
	private String webhookUrl;

	public MarketingPublicacionService(ObjectMapper objectMapper) {
		this.objectMapper = objectMapper;
	}

	public void publicar(String texto, MultipartFile imagen) {
		if (webhookUrl == null || webhookUrl.isBlank()) {
			throw new BusinessException("La automatizacion de publicaciones todavia no esta configurada.");
		}
		try {
			Map<String, Object> payload = Map.of(
					"texto", texto,
					"imagenBase64", Base64.getEncoder().encodeToString(imagen.getBytes()),
					"imagenContentType", imagen.getContentType() == null ? "application/octet-stream" : imagen.getContentType(),
					"imagenNombre", imagen.getOriginalFilename() == null ? "imagen" : imagen.getOriginalFilename());

			HttpRequest request = HttpRequest.newBuilder()
					.uri(URI.create(webhookUrl))
					.timeout(Duration.ofSeconds(20))
					.header("Content-Type", "application/json")
					.POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(payload)))
					.build();

			HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
			if (response.statusCode() < 200 || response.statusCode() >= 300) {
				log.error("n8n respondio {} al publicar: {}", response.statusCode(), response.body());
				throw new BusinessException("El servicio de automatizacion respondio con un error. Intenta de nuevo.");
			}
			log.info("Publicacion enviada a la automatizacion de marketing");
		}
		catch (IOException ex) {
			log.error("No se pudo leer la imagen o contactar la automatizacion: {}", ex.getMessage());
			throw new BusinessException("No se pudo enviar la publicacion. Intenta de nuevo.");
		}
		catch (InterruptedException ex) {
			Thread.currentThread().interrupt();
			throw new BusinessException("El envio de la publicacion fue interrumpido.");
		}
	}
}
