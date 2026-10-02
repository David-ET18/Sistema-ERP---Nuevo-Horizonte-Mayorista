package com.example.demo.modulos.gestionAgencias.controller;

import com.example.demo.modulos.gestionAgencias.dto.AgenciaFichaResumenDTO;
import com.example.demo.modulos.gestionAgencias.dto.HistorialComercialItemDTO;
import com.example.demo.modulos.gestionAgencias.dto.NotaSeguimientoDTO;
import com.example.demo.modulos.gestionAgencias.dto.ResumenComercialDTO;
import com.example.demo.modulos.gestionAgencias.service.AgenciaFichaService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Vista "Agencias / Clientes B2B": panel maestro-detalle tipo CRM, adicional
 * al listado tabular de {@link AgenciaController}. Solo lectura: no
 * reemplaza el CRUD de Agencia (sigue en AgenciaController), y las notas de
 * seguimiento se crean desde el modulo Seguimiento Comercial.
 */
@RestController
@RequestMapping("/api/gestion-agencias/ficha")
public class AgenciaFichaController {

	private final AgenciaFichaService agenciaFichaService;

	public AgenciaFichaController(AgenciaFichaService agenciaFichaService) {
		this.agenciaFichaService = agenciaFichaService;
	}

	@GetMapping
	public List<AgenciaFichaResumenDTO> listar(@RequestParam(required = false) String q) {
		return agenciaFichaService.listar(q);
	}

	@GetMapping("/{id}/resumen-comercial")
	public ResumenComercialDTO resumenComercial(@PathVariable Long id) {
		return agenciaFichaService.resumenComercial(id);
	}

	@GetMapping("/{id}/historial-comercial")
	public List<HistorialComercialItemDTO> historialComercial(@PathVariable Long id) {
		return agenciaFichaService.historialComercial(id);
	}

	@GetMapping("/{id}/notas-seguimiento")
	public List<NotaSeguimientoDTO> notasSeguimiento(@PathVariable Long id) {
		return agenciaFichaService.notasSeguimiento(id);
	}
}
