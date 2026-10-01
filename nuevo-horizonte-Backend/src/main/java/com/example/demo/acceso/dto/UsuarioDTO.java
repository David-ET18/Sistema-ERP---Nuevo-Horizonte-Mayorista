package com.example.demo.acceso.dto;

import java.time.LocalDateTime;
import java.util.List;

public record UsuarioDTO(
		Long id,
		String username,
		String email,
		boolean activo,
		LocalDateTime fechaCreacion,
		List<RolDTO> roles) {
}