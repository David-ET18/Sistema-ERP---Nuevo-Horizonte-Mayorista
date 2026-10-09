package com.example.demo.modulos.gestionAgencias.controller;

import com.example.demo.modulos.gestionAgencias.dto.AgenciaDetalleDTO;
import com.example.demo.modulos.gestionAgencias.dto.AgenciaListaDTO;
import com.example.demo.modulos.gestionAgencias.dto.AgenciaRequest;
import com.example.demo.modulos.gestionAgencias.dto.KpiAgenciasDTO;
import com.example.demo.modulos.gestionAgencias.service.AgenciaService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api/gestion-agencias")
@PreAuthorize("@permisoEvaluator.puedeLeer('gestion-agencias')")
public class AgenciaController {

	private static final Set<String> EXTENSIONES_PERMITIDAS =
			Set.of("png", "jpg", "jpeg", "webp", "gif");
	private static final long TAMANO_MAXIMO = 2L * 1024 * 1024;
	private static final Path CARPETA_LOGOS = Paths.get("uploads", "agencias");

	private final AgenciaService agenciaService;

	public AgenciaController(AgenciaService agenciaService) {
		this.agenciaService = agenciaService;
	}

	@GetMapping
	public Page<AgenciaListaDTO> listar(
			@RequestParam(required = false) String q,
			@RequestParam(required = false) String categoria,
			@RequestParam(required = false) Boolean activo,
			@RequestParam(required = false) Boolean soloPrioritarias,
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "10") int size) {
		PageRequest pageable = PageRequest.of(page, size, Sort.by("razonSocial").ascending());
		return agenciaService.listar(q, categoria, activo, soloPrioritarias, pageable);
	}

	@GetMapping("/kpis")
	public KpiAgenciasDTO kpis() {
		return agenciaService.kpis();
	}

	@GetMapping("/categorias")
	public List<String> categorias() {
		return agenciaService.categorias();
	}

	@GetMapping("/activas")
	public List<AgenciaListaDTO> activas() {
		return agenciaService.listarActivas();
	}

	@GetMapping("/{id}")
	public AgenciaDetalleDTO detalle(@PathVariable Long id) {
		return agenciaService.detalle(id);
	}

	@PostMapping
	@PreAuthorize("@permisoEvaluator.puedeCrear('gestion-agencias')")
	public ResponseEntity<AgenciaDetalleDTO> crear(@Valid @RequestBody AgenciaRequest request) {
		return ResponseEntity.status(HttpStatus.CREATED).body(agenciaService.crear(request));
	}

	@PutMapping("/{id}")
	@PreAuthorize("@permisoEvaluator.puedeActualizar('gestion-agencias')")
	public AgenciaDetalleDTO actualizar(@PathVariable Long id, @Valid @RequestBody AgenciaRequest request) {
		return agenciaService.actualizar(id, request);
	}

	@DeleteMapping("/{id}")
	@PreAuthorize("@permisoEvaluator.puedeEliminar('gestion-agencias')")
	public ResponseEntity<Void> eliminar(@PathVariable Long id) {
		agenciaService.eliminar(id);
		return ResponseEntity.noContent().build();
	}

	@PatchMapping("/{id}/activar")
	@PreAuthorize("@permisoEvaluator.puedeActualizar('gestion-agencias')")
	public ResponseEntity<Void> activar(@PathVariable Long id) {
		agenciaService.activar(id);
		return ResponseEntity.noContent().build();
	}

	@PostMapping(value = "/{id}/logo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	@PreAuthorize("@permisoEvaluator.puedeActualizar('gestion-agencias')")
	public Map<String, String> subirLogo(@PathVariable Long id, @RequestParam("archivo") MultipartFile archivo)
			throws IOException {
		if (archivo.isEmpty()) {
			throw new IllegalArgumentException("El archivo esta vacio");
		}
		if (archivo.getSize() > TAMANO_MAXIMO) {
			throw new IllegalArgumentException("El logo no debe superar los 2 MB");
		}

		String nombreOriginal = archivo.getOriginalFilename() == null ? "" : archivo.getOriginalFilename();
		String extension = extensionDe(nombreOriginal);
		if (!EXTENSIONES_PERMITIDAS.contains(extension)) {
			throw new IllegalArgumentException("Formato no permitido. Usa PNG, JPG, WEBP o GIF");
		}

		Files.createDirectories(CARPETA_LOGOS);
		String nombreArchivo = "agencia_" + id + "_" + UUID.randomUUID() + "." + extension;
		Path destino = CARPETA_LOGOS.resolve(nombreArchivo);
		Files.copy(archivo.getInputStream(), destino, StandardCopyOption.REPLACE_EXISTING);

		return Map.of("logoUrl", agenciaService.actualizarLogo(id, nombreArchivo));
	}

	@GetMapping("/logo/{nombreArchivo}")
	@PreAuthorize("permitAll()")
	public org.springframework.core.io.Resource verLogo(@PathVariable String nombreArchivo) throws IOException {
		Path ruta = CARPETA_LOGOS.resolve(nombreArchivo).normalize();
		if (!ruta.startsWith(CARPETA_LOGOS.normalize()) || !Files.exists(ruta)) {
			throw new org.springframework.web.server.ResponseStatusException(
					org.springframework.http.HttpStatus.NOT_FOUND, "Logo no encontrado");
		}
		org.springframework.core.io.Resource recurso = new org.springframework.core.io.UrlResource(
				ruta.toUri());
		return recurso;
	}

	private String extensionDe(String nombreArchivo) {
		int punto = nombreArchivo.lastIndexOf('.');
		if (punto < 0 || punto == nombreArchivo.length() - 1) {
			return "";
		}
		return nombreArchivo.substring(punto + 1).toLowerCase(Locale.ROOT);
	}
}
