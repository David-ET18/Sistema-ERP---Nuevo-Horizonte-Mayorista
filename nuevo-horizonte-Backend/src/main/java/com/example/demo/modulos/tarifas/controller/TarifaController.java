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
import org.springframework.data.domain.Pageable;
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
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
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
	private static final DateTimeFormatter FORMATO_FECHA = DateTimeFormatter.ofPattern("dd/MM/yyyy");

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

	@GetMapping("/exportar/csv")
	public ResponseEntity<byte[]> exportarCsv(
			@RequestParam(required = false) String q,
			@RequestParam(required = false) Long proveedorId,
			@RequestParam(required = false) Long destinoId,
			@RequestParam(required = false) Long servicioId,
			@RequestParam(required = false) String estado) {
		StringBuilder csv = new StringBuilder("\uFEFF");
		csv.append("Proveedor,Servicio,Destino,Moneda,Precio,Estado,Desde,Hasta,Última actualización\n");
		for (TarifaListaDTO t : tarifasFiltradas(q, proveedorId, destinoId, servicioId, estado)) {
			csv.append(csv(t.proveedor())).append(',')
					.append(csv(t.servicio())).append(',')
					.append(csv(t.destino())).append(',')
					.append(csv(t.moneda())).append(',')
					.append(t.precio() == null ? "" : t.precio().toPlainString()).append(',')
					.append(csv(t.estado())).append(',')
					.append(t.fechaDesde() == null ? "" : t.fechaDesde().format(FORMATO_FECHA)).append(',')
					.append(t.fechaHasta() == null ? "" : t.fechaHasta().format(FORMATO_FECHA)).append(',')
					.append(t.fechaActualizacion() == null ? "" : t.fechaActualizacion().toString())
					.append('\n');
		}
		return descarga(csv.toString().getBytes(StandardCharsets.UTF_8),
				MediaType.parseMediaType("text/csv;charset=UTF-8"), "tarifas", "csv");
	}

	/**
	 * Genera un libro SpreadsheetML (formato XML que Excel abre como .xls)
	 * sin agregar dependencias externas como Apache POI.
	 */
	@GetMapping("/exportar/excel")
	public ResponseEntity<byte[]> exportarExcel(
			@RequestParam(required = false) String q,
			@RequestParam(required = false) Long proveedorId,
			@RequestParam(required = false) Long destinoId,
			@RequestParam(required = false) Long servicioId,
			@RequestParam(required = false) String estado) {
		StringBuilder xml = new StringBuilder();
		xml.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n")
				.append("<?mso-application progid=\"Excel.Sheet\"?>\n")
				.append("<Workbook xmlns=\"urn:schemas-microsoft-com:office:spreadsheet\" ")
				.append("xmlns:ss=\"urn:schemas-microsoft-com:office:spreadsheet\">\n")
				.append("<Worksheet ss:Name=\"Tarifas\">\n<Table>\n");
		filaExcel(xml, "Proveedor", "Servicio", "Destino", "Moneda", "Precio", "Estado",
				"Desde", "Hasta", "Última actualización");
		for (TarifaListaDTO t : tarifasFiltradas(q, proveedorId, destinoId, servicioId, estado)) {
			filaExcel(xml,
					t.proveedor(), t.servicio(), t.destino(), t.moneda(),
					t.precio() == null ? "" : t.precio().toPlainString(), t.estado(),
					t.fechaDesde() == null ? "" : t.fechaDesde().format(FORMATO_FECHA),
					t.fechaHasta() == null ? "" : t.fechaHasta().format(FORMATO_FECHA),
					t.fechaActualizacion() == null ? "" : t.fechaActualizacion().toString());
		}
		xml.append("</Table>\n</Worksheet>\n</Workbook>\n");
		return descarga(xml.toString().getBytes(StandardCharsets.UTF_8),
				MediaType.parseMediaType("application/vnd.ms-excel"), "tarifas", "xls");
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

	private List<TarifaListaDTO> tarifasFiltradas(String q, Long proveedorId, Long destinoId, Long servicioId,
			String estado) {
		return tarifaService.listar(q, proveedorId, destinoId, servicioId, estado, Pageable.unpaged())
				.getContent();
	}

	private static String csv(String valor) {
		return "\"" + (valor == null ? "" : valor.replace("\"", "\"\"")) + "\"";
	}

	private static void filaExcel(StringBuilder xml, String... valores) {
		xml.append("<Row>");
		for (String valor : valores) {
			xml.append("<Cell><Data ss:Type=\"String\">")
					.append(escaparXml(valor))
					.append("</Data></Cell>");
		}
		xml.append("</Row>\n");
	}

	private static String escaparXml(String valor) {
		if (valor == null) {
			return "";
		}
		return valor.replace("&", "&amp;")
				.replace("<", "&lt;")
				.replace(">", "&gt;")
				.replace("\"", "&quot;")
				.replace("'", "&apos;");
	}

	private static ResponseEntity<byte[]> descarga(byte[] contenido, MediaType tipo, String prefijo,
			String extension) {
		String nombre = prefijo + "_" + LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE) + "." + extension;
		return ResponseEntity.ok()
				.contentType(tipo)
				.header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION,
						"attachment; filename=\"" + nombre + "\"")
				.body(contenido);
	}

	private String extensionDe(String nombreArchivo) {
		int punto = nombreArchivo.lastIndexOf('.');
		if (punto < 0 || punto == nombreArchivo.length() - 1) {
			return "";
		}
		return nombreArchivo.substring(punto + 1).toLowerCase(Locale.ROOT);
	}
}
