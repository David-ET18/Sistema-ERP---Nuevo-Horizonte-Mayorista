package com.example.demo.modulos.gestionUsuariosRolesPermisos.mapper;

import com.example.demo.modulos.gestionUsuariosRolesPermisos.dto.PermisoDTO;
import com.example.demo.modulos.gestionUsuariosRolesPermisos.dto.RolDTO;
import com.example.demo.modulos.gestionUsuariosRolesPermisos.entity.Rol;
import com.example.demo.modulos.gestionUsuariosRolesPermisos.entity.RolPermiso;

import java.util.List;

public final class RolMapper {

	private RolMapper() {
	}

	public static RolDTO toDTO(Rol rol) {
		List<PermisoDTO> permisos = rol.getRolPermisos().stream()
				.map(RolMapper::toPermisoDTO)
				.toList();

		return new RolDTO(
				rol.getId(),
				rol.getNombre(),
				rol.getDescripcion(),
				rol.getTipoBase(),
				rol.getColor(),
				rol.isEsSistema(),
				rol.isActivo(),
				permisos);
	}

	public static PermisoDTO toPermisoDTO(RolPermiso permiso) {
		return new PermisoDTO(
				permiso.getId(),
				permiso.getModulo(),
				permiso.isPuedeLeer(),
				permiso.isPuedeCrear(),
				permiso.isPuedeActualizar(),
				permiso.isPuedeEliminar());
	}
}