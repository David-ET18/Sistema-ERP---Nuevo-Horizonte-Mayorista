package com.example.demo.modulos.marketing.controller;

import com.example.demo.modulos.marketing.dto.ImagenPublicacionDTO;
import com.example.demo.modulos.marketing.dto.KpiMarketingDTO;
import com.example.demo.modulos.marketing.dto.MarketingPublicacionDTO;
import com.example.demo.modulos.marketing.entity.MarketingPublicacion;
import com.example.demo.modulos.marketing.service.MarketingPublicacionService;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.CacheControl;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/marketing")
@Validated
@PreAuthorize("@permisoEvaluator.puedeLeer('marketing')")
public class MarketingPublicacionController {

	private final MarketingPublicacionService marketingPublicacionService;

	public MarketingPublicacionController(MarketingPublicacionService marketingPublicacionService) {
		this.marketingPublicacionService = marketingPublicacionService;
	}

	@GetMapping("/publicaciones")
	public Page<MarketingPublicacionDTO> listar(
			@RequestParam(required = false) String q,
			@RequestParam(required = false) MarketingPublicacion.Canal canal,
			@RequestParam(required = false) MarketingPublicacion.Estado estado,
			@RequestParam(required = false) LocalDateTime desde,
			@RequestParam(required = false) LocalDateTime hasta,
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "10") int size) {
		return marketingPublicacionService.listar(q, canal, estado, desde, hasta, PageRequest.of(page, size));
	}

	@GetMapping("/publicaciones/kpis")
	public KpiMarketingDTO kpis() {
		return marketingPublicacionService.kpis();
	}

	@GetMapping("/publicaciones/{id}")
	public MarketingPublicacionDTO detalle(@PathVariable Long id) {
		return marketingPublicacionService.detalle(id);
	}

	/**
	 * Sirve la imagen almacenada en la base de datos con cache larga, igual
	 * que /api/promociones/{id}/imagen.
	 */
	@GetMapping("/publicaciones/{id}/imagen")
	public ResponseEntity<byte[]> imagen(@PathVariable Long id) {
		ImagenPublicacionDTO imagen = marketingPublicacionService.obtenerImagen(id);
		MediaType mediaType;
		try {
			mediaType = MediaType.parseMediaType(imagen.contentType());
		} catch (IllegalArgumentException ex) {
			mediaType = MediaType.APPLICATION_OCTET_STREAM;
		}
		String disposicion = ContentDisposition.inline()
				.filename(imagen.nombreArchivo(), StandardCharsets.UTF_8)
				.build()
				.toString();
		return ResponseEntity.ok()
				.contentType(mediaType)
				.contentLength(imagen.contenido().length)
				.cacheControl(CacheControl.maxAge(Duration.ofDays(30)).cachePublic().immutable())
				.header(HttpHeaders.CONTENT_DISPOSITION, disposicion)
				.body(imagen.contenido());
	}

	@PostMapping(value = "/publicaciones", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	@PreAuthorize("@permisoEvaluator.puedeCrear('marketing')")
	public ResponseEntity<Void> publicar(
			@RequestParam @NotBlank String texto,
			@RequestPart MultipartFile imagen) {
		marketingPublicacionService.publicar(texto, imagen);
		return ResponseEntity.noContent().build();
	}
}
