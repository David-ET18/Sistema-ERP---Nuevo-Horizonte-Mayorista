package com.example.demo.acceso.mapper;

import com.example.demo.acceso.dto.PermisoDTO;
import com.example.demo.acceso.dto.RolDTO;
import com.example.demo.acceso.entity.Rol;
import com.example.demo.acceso.entity.RolPermiso;

import java.util.List;

public final class RolMapper {

	private RolMapper() {
	}

	public static RolDTO toDTO(Rol rol) {
		List<PermisoDTO> permisos = rol.getRolPermisos().stream()
				.map(RolMapper::toPermisoDTO)
				.toList();

		return new RolDTO(rol.getId(), rol.getNombre(), rol.getDescripcion(), permisos);
	}

	public static PermisoDTO toPermisoDTO(RolPermiso permiso) {
		return new PermisoDTO(
				permiso.getId(),
				permiso.getModulo(),
				permiso.isPuedeLeer(),
				permiso.isPuedeEscribir());
	}
}