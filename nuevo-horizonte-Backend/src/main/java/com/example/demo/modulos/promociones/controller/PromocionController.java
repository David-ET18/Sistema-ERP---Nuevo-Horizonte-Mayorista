package com.example.demo.modulos.promociones.controller;

import com.example.demo.modulos.catalogo.dto.ServicioDTO;
import com.example.demo.modulos.promociones.dto.ImagenPromocionDTO;
import com.example.demo.modulos.promociones.dto.KpiPromocionesDTO;
import com.example.demo.modulos.promociones.dto.PromocionDTO;
import com.example.demo.modulos.promociones.dto.PromocionRequest;
import com.example.demo.modulos.promociones.service.PromocionService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.CacheControl;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.List;

/**
 * CRUD de promociones. Las altas y ediciones viajan como multipart/form-data
 * porque incluyen la imagen que se persiste directamente en la fila (bytea).
 */
@RestController
@RequestMapping("/api/promociones")
@PreAuthorize("@permisoEvaluator.puedeLeer('promociones')")
public class PromocionController {

	private final PromocionService promocionService;

	public PromocionController(PromocionService promocionService) {
		this.promocionService = promocionService;
	}

	@GetMapping
	public Page<PromocionDTO> listar(
			@RequestParam(required = false) String q,
			@RequestParam(required = false) Boolean activa,
			@RequestParam(required = false) Boolean destacada,
			@RequestParam(required = false) Long servicioId,
			@RequestParam(required = false) String estado,
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "9") int size) {
		PageRequest pageable = PageRequest.of(page, size,
				Sort.by(Sort.Order.desc("destacada"), Sort.Order.desc("fechaActualizacion")));
		return promocionService.listar(q, activa, destacada, servicioId, estado, pageable);
	}

	@GetMapping("/kpis")
	public KpiPromocionesDTO kpis() {
		return promocionService.kpis();
	}

	@GetMapping("/servicios")
	public List<ServicioDTO> serviciosDisponibles() {
		return promocionService.serviciosDisponibles();
	}

	@GetMapping("/{id}")
	public PromocionDTO detalle(@PathVariable Long id) {
		return promocionService.detalle(id);
	}

	/**
	 * Sirve la imagen almacenada en la base de datos con cache larga: el
	 * frontend agrega ?v=fechaActualizacion para invalidarla al editarla.
	 */
	@GetMapping("/{id}/imagen")
	public ResponseEntity<byte[]> imagen(@PathVariable Long id) {
		ImagenPromocionDTO imagen = promocionService.obtenerImagen(id);
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

	@PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	@PreAuthorize("@permisoEvaluator.puedeCrear('promociones')")
	public ResponseEntity<PromocionDTO> crear(
			@Valid @ModelAttribute PromocionRequest request,
			@RequestPart(value = "imagen", required = false) MultipartFile imagen) {
		return ResponseEntity.status(HttpStatus.CREATED).body(promocionService.crear(request, imagen));
	}

	@PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	@PreAuthorize("@permisoEvaluator.puedeActualizar('promociones')")
	public PromocionDTO actualizar(
			@PathVariable Long id,
			@Valid @ModelAttribute PromocionRequest request,
			@RequestPart(value = "imagen", required = false) MultipartFile imagen) {
		return promocionService.actualizar(id, request, imagen);
	}

	@PatchMapping("/{id}/activar")
	@PreAuthorize("@permisoEvaluator.puedeActualizar('promociones')")
	public PromocionDTO activar(@PathVariable Long id) {
		return promocionService.activar(id);
	}

	@PatchMapping("/{id}/desactivar")
	@PreAuthorize("@permisoEvaluator.puedeActualizar('promociones')")
	public PromocionDTO desactivar(@PathVariable Long id) {
		return promocionService.desactivar(id);
	}

	@DeleteMapping("/{id}")
	@PreAuthorize("@permisoEvaluator.puedeEliminar('promociones')")
	public ResponseEntity<Void> eliminar(@PathVariable Long id) {
		promocionService.eliminar(id);
		return ResponseEntity.noContent().build();
	}
}
