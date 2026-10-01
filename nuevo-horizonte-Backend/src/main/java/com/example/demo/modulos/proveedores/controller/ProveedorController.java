package com.example.demo.modulos.proveedores.controller;

import com.example.demo.modulos.catalogo.dto.DestinoDTO;
import com.example.demo.modulos.proveedores.dto.KpiProveedoresDTO;
import com.example.demo.modulos.proveedores.dto.ProveedorDTO;
import com.example.demo.modulos.proveedores.dto.ProveedorDetalleDTO;
import com.example.demo.modulos.proveedores.dto.ProveedorListaDTO;
import com.example.demo.modulos.proveedores.dto.ProveedorRequest;
import com.example.demo.modulos.proveedores.service.ProveedorService;
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
 * CRUD real del modulo de Gestion de Proveedores. El controller
 * {@link ProveedoresController} (en /api/modulos/proveedores) solo expone la
 * ficha del catalogo general de modulos, igual que en gestionAgencias.
 */
@RestController
@RequestMapping("/api/proveedores")
public class ProveedorController {

	private final ProveedorService proveedorService;

	public ProveedorController(ProveedorService proveedorService) {
		this.proveedorService = proveedorService;
	}

	@GetMapping
	public Page<ProveedorListaDTO> listar(
			@RequestParam(required = false) String q,
			@RequestParam(required = false) String tipoProveedor,
			@RequestParam(required = false) Boolean activo,
			@RequestParam(required = false) Long destinoId,
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "10") int size) {
		PageRequest pageable = PageRequest.of(page, size, Sort.by("razonSocial").ascending());
		return proveedorService.listar(q, tipoProveedor, activo, destinoId, pageable);
	}

	@GetMapping("/kpis")
	public KpiProveedoresDTO kpis() {
		return proveedorService.kpis();
	}

	@GetMapping("/tipos-servicio")
	public List<String> tiposServicio() {
		return proveedorService.tiposServicio();
	}

	@GetMapping("/condiciones-comerciales")
	public List<String> condicionesComerciales() {
		return proveedorService.condicionesComerciales();
	}

	@GetMapping("/activos")
	public List<ProveedorDTO> activos() {
		return proveedorService.listarActivos();
	}

	@GetMapping("/referencias/destinos")
	public List<DestinoDTO> destinos() {
		return proveedorService.destinos();
	}

	@GetMapping("/{id}")
	public ProveedorDetalleDTO detalle(@PathVariable Long id) {
		return proveedorService.detalle(id);
	}

	@PostMapping
	public ResponseEntity<ProveedorDetalleDTO> crear(@Valid @RequestBody ProveedorRequest request) {
		return ResponseEntity.status(HttpStatus.CREATED).body(proveedorService.crear(request));
	}

	@PutMapping("/{id}")
	public ProveedorDetalleDTO actualizar(@PathVariable Long id, @Valid @RequestBody ProveedorRequest request) {
		return proveedorService.actualizar(id, request);
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> eliminar(@PathVariable Long id) {
		proveedorService.eliminar(id);
		return ResponseEntity.noContent().build();
	}
}
