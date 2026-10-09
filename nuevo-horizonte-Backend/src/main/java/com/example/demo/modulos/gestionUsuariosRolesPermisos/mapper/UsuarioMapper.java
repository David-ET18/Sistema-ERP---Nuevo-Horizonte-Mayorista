package com.example.demo.modulos.gestionUsuariosRolesPermisos.mapper;

import com.example.demo.modulos.gestionUsuariosRolesPermisos.dto.PermisoDTO;
import com.example.demo.modulos.gestionUsuariosRolesPermisos.dto.RolDTO;
import com.example.demo.modulos.gestionUsuariosRolesPermisos.dto.UsuarioDTO;
import com.example.demo.modulos.gestionUsuariosRolesPermisos.entity.RolPermiso;
import com.example.demo.modulos.gestionUsuariosRolesPermisos.entity.Usuario;
import com.example.demo.modulos.gestionUsuariosRolesPermisos.entity.UsuarioRol;

import java.util.List;

public final class UsuarioMapper {

	private UsuarioMapper() {
	}

	public static UsuarioDTO toDTO(Usuario usuario) {
		List<RolDTO> roles = usuario.getUsuarioRoles().stream()
				.map(UsuarioRol::getRol)
				.map(RolMapper::toDTO)
				.toList();

		return new UsuarioDTO(
				usuario.getId(),
				usuario.getUsername(),
				usuario.getEmail(),
				usuario.isActivo(),
				usuario.isAnonimizado(),
				usuario.getFechaCreacion(),
				roles);
	}
}