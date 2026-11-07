package com.example.demo.modulos.marketing.service;

import com.example.demo.exception.BusinessException;
import com.example.demo.exception.NotFoundException;
import com.example.demo.modulos.marketing.dto.ImagenPublicacionDTO;
import com.example.demo.modulos.marketing.dto.KpiMarketingDTO;
import com.example.demo.modulos.marketing.dto.MarketingPublicacionDTO;
import com.example.demo.modulos.marketing.entity.MarketingPublicacion;
import com.example.demo.modulos.marketing.mapper.MarketingPublicacionMapper;
import com.example.demo.modulos.marketing.repository.MarketingPublicacionRepository;
import com.example.demo.util.Textos;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Map;

@Service
@Transactional(readOnly = true)
public class MarketingPublicacionService {

	private static final Logger log = LoggerFactory.getLogger(MarketingPublicacionService.class);
	private static final long MAX_IMAGEN_BYTES = 5L * 1024 * 1024;

	private final HttpClient httpClient = HttpClient.newBuilder()
			.connectTimeout(Duration.ofSeconds(10))
			.build();
	private final ObjectMapper objectMapper;
	private final MarketingPublicacionRepository publicacionRepository;

	@Value("${app.n8n.webhook-marketing:}")
	private String webhookUrl;

	public MarketingPublicacionService(ObjectMapper objectMapper, MarketingPublicacionRepository publicacionRepository) {
		this.objectMapper = objectMapper;
		this.publicacionRepository = publicacionRepository;
	}

	public Page<MarketingPublicacionDTO> listar(String q, MarketingPublicacion.Canal canal,
			MarketingPublicacion.Estado estado, LocalDateTime desde, LocalDateTime hasta, Pageable pageable) {
		String patron = Textos.patronContiene(q);
		return publicacionRepository.listar(patron, canal, estado, desde, hasta, pageable)
				.map(MarketingPublicacionMapper::toDTO);
	}

	public KpiMarketingDTO kpis() {
		LocalDateTime inicioDeHoy = LocalDate.now().atStartOfDay();
		return new KpiMarketingDTO(
				publicacionRepository.count(),
				publicacionRepository.countByEstado(MarketingPublicacion.Estado.PUBLICADO),
				publicacionRepository.countByEstado(MarketingPublicacion.Estado.ERROR),
				publicacionRepository.countByFechaPublicacionGreaterThanEqual(inicioDeHoy));
	}

	public MarketingPublicacionDTO detalle(Long id) {
		return MarketingPublicacionMapper.toDTO(obtener(id));
	}

	public ImagenPublicacionDTO obtenerImagen(Long id) {
		MarketingPublicacionRepository.ImagenProyeccion imagen = publicacionRepository.findImagenById(id)
				.orElseThrow(() -> new NotFoundException("Publicación no encontrada con id " + id));
		if (imagen.getImagen() == null || imagen.getImagen().length == 0) {
			throw new NotFoundException("La publicación no tiene una imagen registrada");
		}
		String contentType = imagen.getImagenContentType();
		if (contentType == null || contentType.isBlank()) {
			contentType = "image/jpeg";
		}
		String nombre = imagen.getImagenNombre();
		if (nombre == null || nombre.isBlank()) {
			nombre = "publicacion-" + id;
		}
		return new ImagenPublicacionDTO(imagen.getImagen(), contentType, nombre);
	}

	@Transactional
	public void publicar(String texto, MultipartFile imagen) {
		if (webhookUrl == null || webhookUrl.isBlank()) {
			throw new BusinessException("La automatizacion de publicaciones todavia no esta configurada.");
		}

		MarketingPublicacion publicacion = new MarketingPublicacion();
		publicacion.setTextoOriginal(texto);
		publicacion.setCanal(MarketingPublicacion.Canal.TELEGRAM);
		publicacion.setFechaPublicacion(LocalDateTime.now());
		publicacion.setResponsableUsername(actorActual());
		publicacion.setResponsableNombre(actorActual());
		aplicarImagen(publicacion, imagen);

		try {
			byte[] contenidoImagen = imagen.getBytes();
			Map<String, Object> payload = Map.of(
					"texto", texto,
					"imagenBase64", Base64.getEncoder().encodeToString(contenidoImagen),
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
				marcarError(publicacion, "El servicio de automatizacion respondio con un error. Intenta de nuevo.");
				publicacionRepository.save(publicacion);
				throw new BusinessException("El servicio de automatizacion respondio con un error. Intenta de nuevo.");
			}

			aplicarRespuestaTelegram(publicacion, response.body());
			publicacionRepository.save(publicacion);
			log.info("Publicacion enviada a la automatizacion de marketing");
		}
		catch (IOException ex) {
			log.error("No se pudo leer la imagen o contactar la automatizacion: {}", ex.getMessage());
			marcarError(publicacion, "No se pudo enviar la publicacion. Intenta de nuevo.");
			publicacionRepository.save(publicacion);
			throw new BusinessException("No se pudo enviar la publicacion. Intenta de nuevo.");
		}
		catch (InterruptedException ex) {
			Thread.currentThread().interrupt();
			marcarError(publicacion, "El envio de la publicacion fue interrumpido.");
			publicacionRepository.save(publicacion);
			throw new BusinessException("El envio de la publicacion fue interrumpido.");
		}
	}

	/**
	 * El webhook de n8n responde con el JSON del ultimo nodo del flujo (el
	 * envio a Telegram), algo como [{"ok": true, "result": {"caption": "..."}}].
	 * Se interpreta en forma defensiva: si no viene con la forma esperada, la
	 * publicacion se guarda igual (el mensaje probablemente ya se envio) pero
	 * sin el texto final.
	 */
	private void aplicarRespuestaTelegram(MarketingPublicacion publicacion, String cuerpoRespuesta) {
		try {
			JsonNode raiz = objectMapper.readTree(cuerpoRespuesta);
			JsonNode nodo = raiz.isArray() && !raiz.isEmpty() ? raiz.get(0) : raiz;
			boolean ok = !nodo.path("ok").isMissingNode() ? nodo.path("ok").asBoolean(true) : true;
			if (!ok) {
				String descripcion = nodo.path("description").asString(null);
				marcarError(publicacion, descripcion != null
						? descripcion
						: "Telegram no pudo publicar el mensaje.");
				return;
			}
			String caption = nodo.path("result").path("caption").asString(null);
			publicacion.setTextoPublicado(caption);
			publicacion.setEstado(MarketingPublicacion.Estado.PUBLICADO);
			publicacion.setMensajeError(null);
		}
		catch (RuntimeException ex) {
			log.warn("No se pudo interpretar la respuesta de la automatizacion: {}", ex.getMessage());
			publicacion.setEstado(MarketingPublicacion.Estado.PUBLICADO);
		}
	}

	private void marcarError(MarketingPublicacion publicacion, String mensaje) {
		publicacion.setEstado(MarketingPublicacion.Estado.ERROR);
		publicacion.setMensajeError(mensaje);
	}

	private void aplicarImagen(MarketingPublicacion publicacion, MultipartFile imagen) {
		if (imagen == null || imagen.isEmpty()) {
			throw new BusinessException("Selecciona una imagen para la publicación.");
		}
		if (imagen.getSize() > MAX_IMAGEN_BYTES) {
			throw new BusinessException("La imagen no puede superar los 5 MB");
		}
		byte[] contenido;
		try {
			contenido = imagen.getBytes();
		}
		catch (IOException ex) {
			throw new BusinessException("No se pudo leer la imagen enviada");
		}
		publicacion.setImagen(contenido);
		publicacion.setImagenContentType(imagen.getContentType());
		publicacion.setImagenNombre(nombreArchivo(imagen.getOriginalFilename()));
		publicacion.setImagenTamano((long) contenido.length);
	}

	private String nombreArchivo(String original) {
		if (!Textos.noVacio(original)) {
			return "publicacion-imagen";
		}
		String limpio = original.trim().replace('\\', '/');
		int corte = limpio.lastIndexOf('/');
		String nombre = corte >= 0 ? limpio.substring(corte + 1) : limpio;
		return nombre.length() > 200 ? nombre.substring(nombre.length() - 200) : nombre;
	}

	private MarketingPublicacion obtener(Long id) {
		return publicacionRepository.findById(id)
				.orElseThrow(() -> new NotFoundException("Publicación no encontrada con id " + id));
	}

	/**
	 * Usuario autenticado que ejecuta la publicacion, para mostrarlo como
	 * responsable en el historial. Devuelve null en procesos automaticos.
	 */
	private String actorActual() {
		Authentication autenticacion = SecurityContextHolder.getContext().getAuthentication();
		if (autenticacion == null || !autenticacion.isAuthenticated()) {
			return null;
		}
		String nombre = autenticacion.getName();
		if (!Textos.noVacio(nombre) || "anonymousUser".equalsIgnoreCase(nombre)) {
			return null;
		}
		return nombre;
	}
}
