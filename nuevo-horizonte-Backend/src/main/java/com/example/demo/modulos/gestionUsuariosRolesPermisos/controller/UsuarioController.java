package com.example.demo.modulos.gestionUsuariosRolesPermisos.controller;

import com.example.demo.modulos.gestionUsuariosRolesPermisos.dto.UsuarioCreateRequest;
import com.example.demo.modulos.gestionUsuariosRolesPermisos.dto.UsuarioDTO;
import com.example.demo.modulos.gestionUsuariosRolesPermisos.dto.UsuarioUpdateRequest;
import com.example.demo.modulos.gestionUsuariosRolesPermisos.service.UsuarioService;
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
@RequestMapping("/api/usuarios")
public class UsuarioController {

	private final UsuarioService usuarioService;

	public UsuarioController(UsuarioService usuarioService) {
		this.usuarioService = usuarioService;
	}

	@GetMapping
	@PreAuthorize("@permisoEvaluator.puedeLeer('gestion-usuarios-roles-permisos')")
	public ResponseEntity<List<UsuarioDTO>> listar() {
		return ResponseEntity.ok(usuarioService.listar());
	}

	@GetMapping("/{id}")
	@PreAuthorize("@permisoEvaluator.puedeLeer('gestion-usuarios-roles-permisos')")
	public ResponseEntity<UsuarioDTO> obtener(@PathVariable Long id) {
		return ResponseEntity.ok(usuarioService.obtener(id));
	}

	@PostMapping
	@PreAuthorize("@permisoEvaluator.puedeCrear('gestion-usuarios-roles-permisos')")
	public ResponseEntity<UsuarioDTO> crear(@Valid @RequestBody UsuarioCreateRequest request) {
		return ResponseEntity.status(HttpStatus.CREATED).body(usuarioService.crear(request));
	}

	@PutMapping("/{id}")
	@PreAuthorize("@permisoEvaluator.puedeActualizar('gestion-usuarios-roles-permisos')")
	public ResponseEntity<UsuarioDTO> actualizar(@PathVariable Long id,
			@Valid @RequestBody UsuarioUpdateRequest request) {
		return ResponseEntity.ok(usuarioService.actualizar(id, request));
	}

	@DeleteMapping("/{id}")
	@PreAuthorize("@permisoEvaluator.puedeEliminar('gestion-usuarios-roles-permisos')")
	public ResponseEntity<Void> desactivar(@PathVariable Long id) {
		usuarioService.desactivar(id);
		return ResponseEntity.noContent().build();
	}
}