package com.example.demo.modulos.paquetes.controller;

import com.example.demo.modulos.catalogo.dto.DestinoDTO;
import com.example.demo.modulos.paquetes.dto.KpiPaquetesDTO;
import com.example.demo.modulos.paquetes.dto.PaqueteDetalleDTO;
import com.example.demo.modulos.paquetes.dto.PaqueteListaDTO;
import com.example.demo.modulos.paquetes.dto.PaqueteRequest;
import com.example.demo.modulos.paquetes.service.PaqueteService;
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
 * CRUD real del modulo de armado de Paquetes Turisticos. El controller
 * {@link PaquetesController} (en /api/modulos/paquetes) solo expone la
 * ficha del catalogo general de modulos, igual que en proveedores.
 */
@RestController
@RequestMapping("/api/paquetes")
public class PaqueteController {

	private final PaqueteService paqueteService;

	public PaqueteController(PaqueteService paqueteService) {
		this.paqueteService = paqueteService;
	}

	@GetMapping
	public Page<PaqueteListaDTO> listar(
			@RequestParam(required = false) String q,
			@RequestParam(required = false) String categoria,
			@RequestParam(required = false) String estado,
			@RequestParam(required = false) Boolean destacado,
			@RequestParam(required = false) Long destinoId,
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "10") int size) {
		PageRequest pageable = PageRequest.of(page, size, Sort.by("fechaActualizacion").descending());
		return paqueteService.listar(q, categoria, estado, destacado, destinoId, pageable);
	}

	@GetMapping("/kpis")
	public KpiPaquetesDTO kpis() {
		return paqueteService.kpis();
	}

	@GetMapping("/categorias")
	public List<String> categorias() {
		return paqueteService.categorias();
	}

	@GetMapping("/monedas")
	public List<String> monedas() {
		return paqueteService.monedas();
	}

	@GetMapping("/opciones-incluye")
	public List<String> opcionesIncluye() {
		return paqueteService.opcionesIncluye();
	}

	@GetMapping("/aerolineas-sugeridas")
	public List<String> aerolineasSugeridas() {
		return paqueteService.aerolineasSugeridas();
	}

	@GetMapping("/referencias/destinos")
	public List<DestinoDTO> destinos() {
		return paqueteService.destinos();
	}

	@GetMapping("/{id}")
	public PaqueteDetalleDTO detalle(@PathVariable Long id) {
		return paqueteService.detalle(id);
	}

	@PostMapping
	public ResponseEntity<PaqueteDetalleDTO> crear(@Valid @RequestBody PaqueteRequest request) {
		return ResponseEntity.status(HttpStatus.CREATED).body(paqueteService.crear(request));
	}

	@PutMapping("/{id}")
	public PaqueteDetalleDTO actualizar(@PathVariable Long id, @Valid @RequestBody PaqueteRequest request) {
		return paqueteService.actualizar(id, request);
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> eliminar(@PathVariable Long id) {
		paqueteService.eliminar(id);
		return ResponseEntity.noContent().build();
	}
}
