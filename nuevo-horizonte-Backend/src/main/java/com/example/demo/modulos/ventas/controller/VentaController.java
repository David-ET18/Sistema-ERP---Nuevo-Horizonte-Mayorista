package com.example.demo.modulos.ventas.controller;

import com.example.demo.modulos.gestionAgencias.dto.AgenciaDTO;
import com.example.demo.modulos.tarifas.dto.TarifaDTO;
import com.example.demo.modulos.ventas.dto.CambioEstadoVentaRequest;
import com.example.demo.modulos.ventas.dto.CotizacionVentaRefDTO;
import com.example.demo.modulos.ventas.dto.KpiVentasDTO;
import com.example.demo.modulos.ventas.dto.PaqueteDTO;
import com.example.demo.modulos.ventas.dto.VentaDTO;
import com.example.demo.modulos.ventas.dto.VentaListaDTO;
import com.example.demo.modulos.ventas.dto.VentaRequest;
import com.example.demo.modulos.ventas.service.VentaService;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
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
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/ventas")
@PreAuthorize("@permisoEvaluator.puedeLeer('ventas')")
public class VentaController {

	private final VentaService ventaService;

	public VentaController(VentaService ventaService) {
		this.ventaService = ventaService;
	}

	@GetMapping
	public Page<VentaListaDTO> listar(
			@RequestParam(required = false) String q,
			@RequestParam(required = false) String estado,
			@RequestParam(required = false) Long agenciaId,
			@RequestParam(required = false) LocalDate desde,
			@RequestParam(required = false) LocalDate hasta,
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "10") int size) {
		return ventaService.listar(q, estado, agenciaId,
				normalizarDesde(desde), normalizarHasta(hasta), page, size);
	}

	@GetMapping("/kpis")
	public KpiVentasDTO kpis() {
		return ventaService.kpis();
	}

	@GetMapping("/{id}")
	public VentaDTO detalle(@PathVariable Long id) {
		return ventaService.detalle(id);
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	@PreAuthorize("@permisoEvaluator.puedeCrear('ventas')")
	public VentaDTO crear(@RequestBody VentaRequest request) {
		return ventaService.crear(request);
	}

	@PutMapping("/{id}")
	@PreAuthorize("@permisoEvaluator.puedeActualizar('ventas')")
	public VentaDTO actualizar(@PathVariable Long id, @RequestBody VentaRequest request) {
		return ventaService.actualizar(id, request);
	}

	@PatchMapping("/{id}/estado")
	@PreAuthorize("@permisoEvaluator.puedeActualizar('ventas')")
	public VentaDTO cambiarEstado(@PathVariable Long id, @RequestBody CambioEstadoVentaRequest request) {
		return ventaService.cambiarEstado(id, request);
	}

	@DeleteMapping("/{id}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	@PreAuthorize("@permisoEvaluator.puedeEliminar('ventas')")
	public void eliminar(@PathVariable Long id) {
		ventaService.eliminar(id);
	}

	@GetMapping("/referencias/agencias")
	public List<AgenciaDTO> agencias() {
		return ventaService.agencias();
	}

	@GetMapping("/referencias/productos")
	public List<PaqueteDTO> productos() {
		return ventaService.productos();
	}

	@GetMapping("/referencias/tarifas")
	public List<TarifaDTO> tarifasVigentes() {
		return ventaService.tarifasVigentes();
	}

	@GetMapping("/referencias/cotizaciones")
	public List<CotizacionVentaRefDTO> cotizacionesCerradas() {
		return ventaService.cotizacionesCerradas();
	}

	private LocalDateTime normalizarDesde(LocalDate desde) {
		return desde == null ? null : desde.atStartOfDay();
	}

	private LocalDateTime normalizarHasta(LocalDate hasta) {
		return hasta == null ? null : hasta.plusDays(1).atStartOfDay().minusNanos(1);
	}
}
