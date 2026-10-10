package com.example.demo.modulos.notificaciones.controller;

import com.example.demo.modulos.notificaciones.dto.MarcarLeidasRequest;
import com.example.demo.modulos.notificaciones.dto.NotificacionDTO;
import com.example.demo.modulos.notificaciones.service.NotificacionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/notificaciones")
public class NotificacionController {

	private final NotificacionService notificacionService;

	public NotificacionController(NotificacionService notificacionService) {
		this.notificacionService = notificacionService;
	}

	@GetMapping
	public ResponseEntity<List<NotificacionDTO>> listar() {
		return ResponseEntity.ok(notificacionService.listarMias());
	}

	@GetMapping("/no-leidas")
	public ResponseEntity<Long> noLeidas() {
		return ResponseEntity.ok(notificacionService.noLeidas());
	}

	@PostMapping("/leidas")
	public ResponseEntity<Void> marcarLeidas(@RequestBody MarcarLeidasRequest request) {
		notificacionService.marcarLeidas(request.ids());
		return ResponseEntity.noContent().build();
	}
}