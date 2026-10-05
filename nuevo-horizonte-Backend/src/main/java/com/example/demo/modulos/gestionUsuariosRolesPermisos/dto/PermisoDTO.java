package com.example.demo.modulos.gestionUsuariosRolesPermisos.dto;

public record PermisoDTO(
		Long id,
		String modulo,
		boolean puedeLeer,
		boolean puedeCrear,
		boolean puedeActualizar,
		boolean puedeEliminar) {
}