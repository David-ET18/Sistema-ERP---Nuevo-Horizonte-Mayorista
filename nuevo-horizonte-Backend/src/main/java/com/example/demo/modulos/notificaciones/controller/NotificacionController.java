package com.example.demo.modulos.notificaciones.controller;

import com.example.demo.modulos.notificaciones.dto.KpiNotificacionesDTO;
import com.example.demo.modulos.notificaciones.dto.MarcarLeidasRequest;
import com.example.demo.modulos.notificaciones.dto.NotificacionDTO;
import com.example.demo.modulos.notificaciones.service.NotificacionService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/**
 * Notificaciones del usuario autenticado. Cada consulta queda acotada al
 * usuario actual, por eso no exige el permiso del modulo completo: el topbar
 * debe funcionar para cualquier cuenta con sesion.
 */
@RestController
@RequestMapping("/api/notificaciones")
public class NotificacionController {

	private final NotificacionService notificacionService;

	public NotificacionController(NotificacionService notificacionService) {
		this.notificacionService = notificacionService;
	}

	@GetMapping
	public ResponseEntity<List<NotificacionDTO>> listar(
			@RequestParam(required = false) String q,
			@RequestParam(required = false) Boolean leida,
			@RequestParam(required = false) String tipo) {
		if (q == null && leida == null && tipo == null) {
			return ResponseEntity.ok(notificacionService.listarMias());
		}
		return ResponseEntity.ok(notificacionService
				.paginar(q, leida, tipo, PageRequest.of(0, 200, Sort.by("fechaCreacion").descending()))
				.getContent());
	}

	@GetMapping("/paginado")
	public Page<NotificacionDTO> paginado(
			@RequestParam(required = false) String q,
			@RequestParam(required = false) Boolean leida,
			@RequestParam(required = false) String tipo,
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "10") int size) {
		return notificacionService.paginar(q, leida, tipo,
				PageRequest.of(page, size, Sort.by("fechaCreacion").descending()));
	}

	@GetMapping("/kpis")
	public KpiNotificacionesDTO kpis() {
		return notificacionService.kpis();
	}

	@GetMapping("/no-leidas")
	public ResponseEntity<Long> noLeidas() {
		return ResponseEntity.ok(notificacionService.noLeidas());
	}

	/** Compatibilidad con el modal anterior, que marcaba por lote de ids. */
	@PostMapping("/leidas")
	public ResponseEntity<Void> marcarLeidas(@RequestBody MarcarLeidasRequest request) {
		notificacionService.marcarLeidas(request.ids());
		return ResponseEntity.noContent().build();
	}

	@PatchMapping("/{id}/leida")
	public ResponseEntity<Void> marcarUna(@PathVariable Long id) {
		notificacionService.marcarUna(id);
		return ResponseEntity.noContent().build();
	}

	@PostMapping("/marcar-todas")
	public ResponseEntity<Map<String, Integer>> marcarTodas() {
		return ResponseEntity.ok(Map.of("actualizadas", notificacionService.marcarTodas()));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> eliminarUna(@PathVariable Long id) {
		notificacionService.eliminarUna(id);
		return ResponseEntity.noContent().build();
	}

	@DeleteMapping("/leidas")
	public ResponseEntity<Map<String, Integer>> eliminarLeidas() {
		return ResponseEntity.ok(Map.of("eliminadas", notificacionService.eliminarLeidas()));
	}
}
