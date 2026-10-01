package com.example.demo.acceso.service;

import com.example.demo.acceso.dto.UsuarioCreateRequest;
import com.example.demo.acceso.dto.UsuarioDTO;
import com.example.demo.acceso.dto.UsuarioUpdateRequest;
import com.example.demo.acceso.entity.Rol;
import com.example.demo.acceso.entity.Usuario;
import com.example.demo.acceso.mapper.UsuarioMapper;
import com.example.demo.acceso.repository.RolRepository;
import com.example.demo.acceso.repository.UsuarioRepository;
import com.example.demo.exception.BusinessException;
import com.example.demo.exception.NotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UsuarioService {

	private final UsuarioRepository usuarioRepository;
	private final RolRepository rolRepository;
	private final PasswordEncoder passwordEncoder;

	public UsuarioService(UsuarioRepository usuarioRepository, RolRepository rolRepository,
			PasswordEncoder passwordEncoder) {
		this.usuarioRepository = usuarioRepository;
		this.rolRepository = rolRepository;
		this.passwordEncoder = passwordEncoder;
	}

	@Transactional(readOnly = true)
	public List<UsuarioDTO> listar() {
		return usuarioRepository.findAll().stream()
				.map(UsuarioMapper::toDTO)
				.toList();
	}

	@Transactional(readOnly = true)
	public UsuarioDTO obtener(Long id) {
		return UsuarioMapper.toDTO(obtenerUsuario(id));
	}

	@Transactional
	public UsuarioDTO crear(UsuarioCreateRequest request) {
		if (usuarioRepository.existsByUsername(request.username())) {
			throw new BusinessException("El username ya esta en uso");
		}
		if (request.email() != null && !request.email().isBlank()
				&& usuarioRepository.existsByEmail(request.email())) {
			throw new BusinessException("El email ya esta en uso");
		}

		Usuario usuario = new Usuario();
		usuario.setUsername(request.username());
		usuario.setPasswordHash(passwordEncoder.encode(request.password()));
		usuario.setEmail(request.email());
		usuario.setActivo(true);
		usuario.setFechaCreacion(java.time.LocalDateTime.now());

		asignarRoles(usuario, request.rolIds());
		return UsuarioMapper.toDTO(usuarioRepository.save(usuario));
	}

	@Transactional
	public UsuarioDTO actualizar(Long id, UsuarioUpdateRequest request) {
		Usuario usuario = obtenerUsuario(id);

		if (request.email() != null && !request.email().isBlank()) {
			usuarioRepository.findByEmail(request.email()).ifPresent(existente -> {
				if (!existente.getId().equals(id)) {
					throw new BusinessException("El email ya esta en uso");
				}
			});
			usuario.setEmail(request.email());
		}

		if (request.password() != null && !request.password().isBlank()) {
			usuario.setPasswordHash(passwordEncoder.encode(request.password()));
		}

		if (request.activo() != null) {
			usuario.setActivo(request.activo());
		}

		if (request.rolIds() != null) {
			usuario.getUsuarioRoles().clear();
			asignarRoles(usuario, request.rolIds());
		}

		return UsuarioMapper.toDTO(usuario);
	}

	@Transactional
	public void desactivar(Long id) {
		Usuario usuario = obtenerUsuario(id);
		usuario.setActivo(false);
	}

	private Usuario obtenerUsuario(Long id) {
		return usuarioRepository.findById(id)
				.orElseThrow(() -> new NotFoundException("Usuario no encontrado con id " + id));
	}

	private void asignarRoles(Usuario usuario, List<Long> rolIds) {
		if (rolIds == null) {
			return;
		}
		for (Long rolId : rolIds) {
			Rol rol = rolRepository.findById(rolId)
					.orElseThrow(() -> new NotFoundException("Rol no encontrado con id " + rolId));
			usuario.addRol(rol);
		}
	}
}