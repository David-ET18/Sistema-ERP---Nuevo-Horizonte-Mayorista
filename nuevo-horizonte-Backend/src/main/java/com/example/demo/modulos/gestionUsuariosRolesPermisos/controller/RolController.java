package com.example.demo.modulos.gestionUsuariosRolesPermisos.controller;

import com.example.demo.modulos.gestionUsuariosRolesPermisos.dto.RolDTO;
import com.example.demo.modulos.gestionUsuariosRolesPermisos.dto.RolRequest;
import com.example.demo.modulos.gestionUsuariosRolesPermisos.service.RolService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/roles")
public class RolController {

	private final RolService rolService;

	public RolController(RolService rolService) {
		this.rolService = rolService;
	}

	@GetMapping
	@PreAuthorize("@permisoEvaluator.puedeLeer('gestion-usuarios-roles-permisos')")
	public ResponseEntity<List<RolDTO>> listar() {
		return ResponseEntity.ok(rolService.listar());
	}

	@GetMapping("/{id}")
	@PreAuthorize("@permisoEvaluator.puedeLeer('gestion-usuarios-roles-permisos')")
	public ResponseEntity<RolDTO> obtener(@PathVariable Long id) {
		return ResponseEntity.ok(rolService.obtener(id));
	}

	@PostMapping
	@PreAuthorize("@permisoEvaluator.puedeCrear('gestion-usuarios-roles-permisos')")
	public ResponseEntity<RolDTO> crear(@Valid @RequestBody RolRequest request) {
		return ResponseEntity.status(HttpStatus.CREATED).body(rolService.crear(request));
	}

	@PutMapping("/{id}")
	@PreAuthorize("@permisoEvaluator.puedeActualizar('gestion-usuarios-roles-permisos')")
	public ResponseEntity<RolDTO> actualizar(@PathVariable Long id, @Valid @RequestBody RolRequest request) {
		return ResponseEntity.ok(rolService.actualizar(id, request));
	}

	@DeleteMapping("/{id}")
	@PreAuthorize("@permisoEvaluator.puedeEliminar('gestion-usuarios-roles-permisos')")
	public ResponseEntity<Void> eliminar(@PathVariable Long id) {
		rolService.eliminar(id);
		return ResponseEntity.noContent().build();
	}
}