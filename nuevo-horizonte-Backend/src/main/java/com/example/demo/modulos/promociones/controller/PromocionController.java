package com.example.demo.modulos.promociones.controller;

import com.example.demo.exception.NotFoundException;
import com.example.demo.modulos.promociones.dto.KpiPromocionesDTO;
import com.example.demo.modulos.promociones.dto.PromocionDTO;
import com.example.demo.modulos.promociones.dto.PromocionRequest;
import com.example.demo.modulos.promociones.dto.ServicioOpcionDTO;
import com.example.demo.modulos.promociones.entity.Promocion;
import com.example.demo.modulos.promociones.service.PromocionService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
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
			@RequestParam(required = false) Long servicioId,
			@RequestParam(required = false) String estado,
			@RequestParam(required = false) Boolean activo,
			@RequestParam(required = false) Boolean destacada,
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "12") int size) {
		Pageable pageable = PageRequest.of(page, size,
				Sort.by(Sort.Order.desc("destacada"), Sort.Order.desc("fechaCreacion")));
		return promocionService.listar(q, servicioId, estado, activo, destacada, pageable);
	}

	@GetMapping("/kpis")
	public KpiPromocionesDTO kpis() {
		return promocionService.kpis();
	}

	@GetMapping("/servicios")
	public List<ServicioOpcionDTO> servicios() {
		return promocionService.serviciosDisponibles();
	}

	@GetMapping("/{id}")
	public PromocionDTO detalle(@PathVariable Long id) {
		return promocionService.detalle(id);
	}

	@GetMapping("/{id}/imagen")
	public ResponseEntity<byte[]> imagen(@PathVariable Long id) {
		Promocion promocion = promocionService.obtener(id);
		if (promocion.getImagen() == null || promocion.getImagen().length == 0) {
			throw new NotFoundException("La promocion no tiene imagen");
		}
		MediaType tipo = MediaType.APPLICATION_OCTET_STREAM;
		if (promocion.getImagenTipo() != null) {
			try {
				tipo = MediaType.parseMediaType(promocion.getImagenTipo());
			}
			catch (IllegalArgumentException ignored) {
				// Se conserva el tipo generico si el guardado no es un MIME valido.
			}
		}
		String nombre = promocion.getImagenNombre() != null
				? promocion.getImagenNombre()
				: "promocion-" + id;
		return ResponseEntity.ok()
				.contentType(tipo)
				.header(HttpHeaders.CONTENT_DISPOSITION,
						ContentDisposition.inline().filename(nombre, StandardCharsets.UTF_8).build().toString())
				.cacheControl(CacheControl.maxAge(Duration.ofDays(7)).cachePublic())
				.body(promocion.getImagen());
	}

	@PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	@PreAuthorize("@permisoEvaluator.puedeCrear('promociones')")
	public ResponseEntity<PromocionDTO> crear(
			@ModelAttribute PromocionRequest datos,
			@RequestPart(value = "imagen", required = false) MultipartFile imagen) {
		return ResponseEntity.status(HttpStatus.CREATED).body(promocionService.crear(datos, imagen));
	}

	@PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	@PreAuthorize("@permisoEvaluator.puedeActualizar('promociones')")
	public PromocionDTO actualizar(
			@PathVariable Long id,
			@ModelAttribute PromocionRequest datos,
			@RequestPart(value = "imagen", required = false) MultipartFile imagen) {
		return promocionService.actualizar(id, datos, imagen);
	}

	@PatchMapping("/{id}/activo")
	@PreAuthorize("@permisoEvaluator.puedeActualizar('promociones')")
	public PromocionDTO cambiarActivo(@PathVariable Long id, @RequestParam boolean activo) {
		return promocionService.cambiarActivo(id, activo);
	}

	@DeleteMapping("/{id}")
	@PreAuthorize("@permisoEvaluator.puedeEliminar('promociones')")
	public ResponseEntity<Void> eliminar(@PathVariable Long id) {
		promocionService.eliminar(id);
		return ResponseEntity.noContent().build();
	}
}
