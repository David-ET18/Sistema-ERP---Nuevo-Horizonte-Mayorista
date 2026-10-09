package com.example.demo.modulos.gestionUsuariosRolesPermisos.dto;

import java.time.LocalDateTime;
import java.util.List;

public record UsuarioDTO(
		Long id,
		String username,
		String email,
		boolean activo,
		boolean anonimizado,
		LocalDateTime fechaCreacion,
		List<RolDTO> roles) {
}