package com.example.demo.modulos.catalogo.controller;

import com.example.demo.modulos.catalogo.dto.DestinoDetalleDTO;
import com.example.demo.modulos.catalogo.dto.DestinoRequest;
import com.example.demo.modulos.catalogo.dto.KpiCatalogoDTO;
import com.example.demo.modulos.catalogo.dto.ServicioDetalleDTO;
import com.example.demo.modulos.catalogo.dto.ServicioRequest;
import com.example.demo.modulos.catalogo.service.CatalogoService;
import com.example.demo.modulos.catalogo.service.DestinoService;
import com.example.demo.modulos.catalogo.service.ServicioService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Administracion del catalogo base (destinos y servicios). Los selects de los
 * demas modulos siguen leyendo via {@link CatalogoService}.
 */
@RestController
@RequestMapping("/api/catalogo")
public class CatalogoController {

	private final DestinoService destinoService;
	private final ServicioService servicioService;
	private final CatalogoService catalogoService;

	public CatalogoController(DestinoService destinoService, ServicioService servicioService,
			CatalogoService catalogoService) {
		this.destinoService = destinoService;
		this.servicioService = servicioService;
		this.catalogoService = catalogoService;
	}

	@GetMapping("/kpis")
	public KpiCatalogoDTO kpis() {
		return catalogoService.kpis();
	}

	// ---- Destinos ----

	@GetMapping("/destinos")
	public Page<DestinoDetalleDTO> listarDestinos(
			@RequestParam(required = false) String q,
			@RequestParam(required = false) String pais,
			@RequestParam(required = false) Boolean activo,
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "10") int size) {
		return destinoService.listar(q, pais, activo, PageRequest.of(page, size, Sort.by("nombre").ascending()));
	}

	@GetMapping("/destinos/paises")
	public List<String> paises() {
		return destinoService.paises();
	}

	@GetMapping("/destinos/{id}")
	public DestinoDetalleDTO detalleDestino(@PathVariable Long id) {
		return destinoService.detalle(id);
	}

	@PostMapping("/destinos")
	public ResponseEntity<DestinoDetalleDTO> crearDestino(@Valid @RequestBody DestinoRequest request) {
		return ResponseEntity.status(HttpStatus.CREATED).body(destinoService.crear(request));
	}

	@PutMapping("/destinos/{id}")
	public DestinoDetalleDTO actualizarDestino(@PathVariable Long id, @Valid @RequestBody DestinoRequest request) {
		return destinoService.actualizar(id, request);
	}

	@DeleteMapping("/destinos/{id}")
	public ResponseEntity<Void> eliminarDestino(@PathVariable Long id) {
		destinoService.eliminar(id);
		return ResponseEntity.noContent().build();
	}

	// ---- Servicios ----

	@GetMapping("/servicios")
	public Page<ServicioDetalleDTO> listarServicios(
			@RequestParam(required = false) String q,
			@RequestParam(required = false) String categoria,
			@RequestParam(required = false) Boolean activo,
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "10") int size) {
		return servicioService.listar(q, categoria, activo, PageRequest.of(page, size, Sort.by("nombre").ascending()));
	}

	@GetMapping("/servicios/categorias")
	public List<String> categorias() {
		return servicioService.categorias();
	}

	@GetMapping("/servicios/{id}")
	public ServicioDetalleDTO detalleServicio(@PathVariable Long id) {
		return servicioService.detalle(id);
	}

	@PostMapping("/servicios")
	public ResponseEntity<ServicioDetalleDTO> crearServicio(@Valid @RequestBody ServicioRequest request) {
		return ResponseEntity.status(HttpStatus.CREATED).body(servicioService.crear(request));
	}

	@PutMapping("/servicios/{id}")
	public ServicioDetalleDTO actualizarServicio(@PathVariable Long id, @Valid @RequestBody ServicioRequest request) {
		return servicioService.actualizar(id, request);
	}

	@DeleteMapping("/servicios/{id}")
	public ResponseEntity<Void> eliminarServicio(@PathVariable Long id) {
		servicioService.eliminar(id);
		return ResponseEntity.noContent().build();
	}
}
