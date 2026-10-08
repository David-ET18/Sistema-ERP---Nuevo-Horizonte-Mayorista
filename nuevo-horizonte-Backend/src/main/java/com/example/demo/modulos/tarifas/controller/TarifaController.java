package com.example.demo.modulos.tarifas.controller;

import com.example.demo.modulos.catalogo.dto.DestinoDTO;
import com.example.demo.modulos.catalogo.dto.ServicioDTO;
import com.example.demo.modulos.tarifas.dto.KpiTarifasDTO;
import com.example.demo.modulos.tarifas.dto.TarifaDetalleDTO;
import com.example.demo.modulos.tarifas.dto.TarifaListaDTO;
import com.example.demo.modulos.tarifas.dto.TarifaRequest;
import com.example.demo.modulos.tarifas.service.TarifaService;
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

/**
 * CRUD real del modulo de Gestion de Tarifas. El controller
 * {@link TarifasController} (en /api/modulos/tarifas) solo expone la ficha
 * del catalogo general de modulos, igual que en proveedores/paquetes.
 */
@RestController
@RequestMapping("/api/tarifas")
@PreAuthorize("@permisoEvaluator.puedeLeer('tarifas')")
public class TarifaController {

	private static final Set<String> EXTENSIONES_PERMITIDAS = Set.of("pdf", "xls", "xlsx", "csv");
	private static final long TAMANO_MAXIMO = 10L * 1024 * 1024;
	private static final Path CARPETA_ARCHIVOS = Paths.get("uploads", "tarifas");

	private final TarifaService tarifaService;

	public TarifaController(TarifaService tarifaService) {
		this.tarifaService = tarifaService;
	}

	@GetMapping
	public Page<TarifaListaDTO> listar(
			@RequestParam(required = false) String q,
			@RequestParam(required = false) Long proveedorId,
			@RequestParam(required = false) Long destinoId,
			@RequestParam(required = false) Long servicioId,
			@RequestParam(required = false) String estado,
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "10") int size) {
		PageRequest pageable = PageRequest.of(page, size, Sort.by("fechaActualizacion").descending());
		return tarifaService.listar(q, proveedorId, destinoId, servicioId, estado, pageable);
	}

	@GetMapping("/kpis")
	public KpiTarifasDTO kpis() {
		return tarifaService.kpis();
	}

	@GetMapping("/tipos-tarifa")
	public List<String> tiposTarifa() {
		return tarifaService.tiposTarifa();
	}

	@GetMapping("/monedas")
	public List<String> monedas() {
		return tarifaService.monedas();
	}

	@GetMapping("/referencias/proveedores")
	public List<com.example.demo.modulos.tarifas.dto.ProveedorRefDTO> proveedores() {
		return tarifaService.proveedores();
	}

	@GetMapping("/referencias/destinos")
	public List<DestinoDTO> destinos() {
		return tarifaService.destinos();
	}

	@GetMapping("/referencias/servicios")
	public List<ServicioDTO> servicios() {
		return tarifaService.servicios();
	}

	@GetMapping("/{id}")
	public TarifaDetalleDTO detalle(@PathVariable Long id) {
		return tarifaService.detalle(id);
	}

	@PostMapping
	@PreAuthorize("@permisoEvaluator.puedeCrear('tarifas')")
	public ResponseEntity<TarifaDetalleDTO> crear(@Valid @RequestBody TarifaRequest request) {
		return ResponseEntity.status(HttpStatus.CREATED).body(tarifaService.crear(request));
	}

	@PutMapping("/{id}")
	@PreAuthorize("@permisoEvaluator.puedeActualizar('tarifas')")
	public TarifaDetalleDTO actualizar(@PathVariable Long id, @Valid @RequestBody TarifaRequest request) {
		return tarifaService.actualizar(id, request);
	}

	@DeleteMapping("/{id}")
	@PreAuthorize("@permisoEvaluator.puedeEliminar('tarifas')")
	public ResponseEntity<Void> eliminar(@PathVariable Long id) {
		tarifaService.eliminar(id);
		return ResponseEntity.noContent().build();
	}

	@PostMapping(value = "/{id}/archivo-respaldo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	@PreAuthorize("@permisoEvaluator.puedeActualizar('tarifas')")
	public Map<String, String> subirArchivoRespaldo(@PathVariable Long id,
			@RequestParam("archivo") MultipartFile archivo) throws IOException {
		if (archivo.isEmpty()) {
			throw new IllegalArgumentException("El archivo esta vacio");
		}
		if (archivo.getSize() > TAMANO_MAXIMO) {
			throw new IllegalArgumentException("El archivo no debe superar los 10 MB");
		}

		String nombreOriginal = archivo.getOriginalFilename() == null ? "" : archivo.getOriginalFilename();
		String extension = extensionDe(nombreOriginal);
		if (!EXTENSIONES_PERMITIDAS.contains(extension)) {
			throw new IllegalArgumentException("Formato no permitido. Usa PDF, XLS, XLSX o CSV");
		}

		Files.createDirectories(CARPETA_ARCHIVOS);
		String nombreArchivo = "tarifa_" + id + "_" + UUID.randomUUID() + "." + extension;
		Path destino = CARPETA_ARCHIVOS.resolve(nombreArchivo);
		Files.copy(archivo.getInputStream(), destino, StandardCopyOption.REPLACE_EXISTING);

		return Map.of("archivoRespaldoUrl", tarifaService.actualizarArchivoRespaldo(id, nombreArchivo));
	}

	@GetMapping("/archivo-respaldo/{nombreArchivo}")
	public org.springframework.core.io.Resource verArchivo(@PathVariable String nombreArchivo) throws IOException {
		Path ruta = CARPETA_ARCHIVOS.resolve(nombreArchivo).normalize();
		if (!ruta.startsWith(CARPETA_ARCHIVOS.normalize()) || !Files.exists(ruta)) {
			throw new org.springframework.web.server.ResponseStatusException(
					org.springframework.http.HttpStatus.NOT_FOUND, "Archivo no encontrado");
		}
		return new org.springframework.core.io.UrlResource(ruta.toUri());
	}

	private String extensionDe(String nombreArchivo) {
		int punto = nombreArchivo.lastIndexOf('.');
		if (punto < 0 || punto == nombreArchivo.length() - 1) {
			return "";
		}
		return nombreArchivo.substring(punto + 1).toLowerCase(Locale.ROOT);
	}
}
