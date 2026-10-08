package com.example.demo.modulos.cotizaciones.controller;

import com.example.demo.modulos.gestionAgencias.dto.AgenciaDTO;
import com.example.demo.modulos.cotizaciones.dto.CambioEstadoRequest;
import com.example.demo.modulos.cotizaciones.dto.CotizacionDTO;
import com.example.demo.modulos.cotizaciones.dto.CotizacionRequest;
import com.example.demo.modulos.catalogo.dto.DestinoDTO;
import com.example.demo.modulos.cotizaciones.dto.KpiCotizacionesDTO;
import com.example.demo.modulos.tarifas.dto.TarifaDTO;
import com.example.demo.modulos.cotizaciones.service.CotizacionService;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/cotizaciones")
@PreAuthorize("@permisoEvaluator.puedeLeer('cotizaciones')")
public class CotizacionController {

	private final CotizacionService cotizacionService;

	public CotizacionController(CotizacionService cotizacionService) {
		this.cotizacionService = cotizacionService;
	}

	@GetMapping
	public Page<com.example.demo.modulos.cotizaciones.dto.CotizacionListaDTO> listar(
			@RequestParam(required = false) String q,
			@RequestParam(required = false) String estado,
			@RequestParam(required = false) Long agenciaId,
			@RequestParam(required = false) Long destinoId,
			@RequestParam(required = false) LocalDate desde,
			@RequestParam(required = false) LocalDate hasta,
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "10") int size) {
		return cotizacionService.listar(q, estado, agenciaId, destinoId,
				normalizarDesde(desde), normalizarHasta(hasta), page, size);
	}

	@GetMapping("/kpis")
	public KpiCotizacionesDTO kpis() {
		return cotizacionService.kpis();
	}

	@GetMapping("/{id}")
	public CotizacionDTO detalle(@PathVariable Long id) {
		return cotizacionService.detalle(id);
	}

	@PostMapping
	@PreAuthorize("@permisoEvaluator.puedeCrear('cotizaciones')")
	public CotizacionDTO crear(@RequestBody CotizacionRequest request) {
		return cotizacionService.crear(request);
	}

	@PutMapping("/{id}")
	@PreAuthorize("@permisoEvaluator.puedeActualizar('cotizaciones')")
	public CotizacionDTO actualizar(@PathVariable Long id, @RequestBody CotizacionRequest request) {
		return cotizacionService.actualizar(id, request);
	}

	@PatchMapping("/{id}/estado")
	@PreAuthorize("@permisoEvaluator.puedeActualizar('cotizaciones')")
	public CotizacionDTO cambiarEstado(@PathVariable Long id, @RequestBody CambioEstadoRequest request) {
		return cotizacionService.cambiarEstado(id, request);
	}

	@GetMapping("/referencias/agencias")
	public List<AgenciaDTO> agencias() {
		return cotizacionService.agencias();
	}

	@GetMapping("/referencias/destinos")
	public List<DestinoDTO> destinos() {
		return cotizacionService.destinos();
	}

	@GetMapping("/referencias/tarifas")
	public List<TarifaDTO> tarifasVigentes() {
		return cotizacionService.tarifasVigentes();
	}

	private LocalDateTime normalizarDesde(LocalDate desde) {
		return desde == null ? null : desde.atStartOfDay();
	}

	private LocalDateTime normalizarHasta(LocalDate hasta) {
		return hasta == null ? null : hasta.plusDays(1).atStartOfDay().minusNanos(1);
	}
}