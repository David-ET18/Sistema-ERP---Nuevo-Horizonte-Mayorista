package com.example.demo.modulos.reportes.controller;

import com.example.demo.modulos.reportes.dto.AlertaDTO;
import com.example.demo.modulos.reportes.dto.PuntoSerieDTO;
import com.example.demo.modulos.reportes.dto.RankingAgenciaDTO;
import com.example.demo.modulos.reportes.dto.ResumenEjecutivoDTO;
import com.example.demo.modulos.reportes.dto.TarifasPorProveedorDTO;
import com.example.demo.modulos.reportes.service.ReportesService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Vista "Resumen Ejecutivo" del modulo Dashboard y Reportes. El controller
 * {@link ReportesController} (en /api/modulos/reportes) solo expone la
 * ficha del catalogo general de modulos, igual que en los demas modulos.
 */
@RestController
@RequestMapping("/api/reportes")
@PreAuthorize("@permisoEvaluator.puedeLeer('reportes')")
public class ReportesDashboardController {

	private final ReportesService reportesService;

	public ReportesDashboardController(ReportesService reportesService) {
		this.reportesService = reportesService;
	}

	@GetMapping("/resumen-ejecutivo")
	public ResumenEjecutivoDTO resumenEjecutivo() {
		return reportesService.resumenEjecutivo();
	}

	@GetMapping("/rendimiento-comercial")
	public List<PuntoSerieDTO> rendimientoComercial(@RequestParam(defaultValue = "MES") String periodo) {
		return reportesService.rendimientoComercial(periodo);
	}

	@GetMapping("/ranking-agencias")
	public List<RankingAgenciaDTO> rankingAgencias(@RequestParam(defaultValue = "5") int limite) {
		return reportesService.rankingAgencias(limite);
	}

	@GetMapping("/tarifas-por-vencer-proveedor")
	public List<TarifasPorProveedorDTO> tarifasPorVencerPorProveedor(@RequestParam(defaultValue = "5") int limite) {
		return reportesService.tarifasPorVencerPorProveedor(limite);
	}

	@GetMapping("/alertas")
	public List<AlertaDTO> alertas() {
		return reportesService.alertas();
	}
}
