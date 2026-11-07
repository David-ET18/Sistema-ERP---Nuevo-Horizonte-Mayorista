package com.example.demo.modulos.marketing.controller;

import com.example.demo.modulos.marketing.service.MarketingPublicacionService;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/marketing")
@Validated
@PreAuthorize("@permisoEvaluator.puedeLeer('marketing')")
public class MarketingPublicacionController {

	private final MarketingPublicacionService marketingPublicacionService;

	public MarketingPublicacionController(MarketingPublicacionService marketingPublicacionService) {
		this.marketingPublicacionService = marketingPublicacionService;
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
