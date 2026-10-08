package com.example.demo.modulos.gestionUsuariosRolesPermisos.dto;

import java.util.List;

public record RolDTO(
		Long id,
		String nombre,
		String descripcion,
		String color,
		boolean esSistema,
		boolean activo,
		List<PermisoDTO> permisos) {
}