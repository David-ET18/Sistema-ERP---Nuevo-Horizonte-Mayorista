package com.example.demo.acceso.mapper;

import com.example.demo.acceso.dto.PermisoDTO;
import com.example.demo.acceso.dto.RolDTO;
import com.example.demo.acceso.dto.UsuarioDTO;
import com.example.demo.acceso.entity.RolPermiso;
import com.example.demo.acceso.entity.Usuario;
import com.example.demo.acceso.entity.UsuarioRol;

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
				usuario.getFechaCreacion(),
				roles);
	}
}