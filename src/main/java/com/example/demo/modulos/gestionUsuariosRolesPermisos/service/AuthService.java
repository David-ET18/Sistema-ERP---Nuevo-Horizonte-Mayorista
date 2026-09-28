package com.example.demo.modulos.gestionUsuariosRolesPermisos.service;

import com.example.demo.modulos.gestionUsuariosRolesPermisos.dto.LoginRequest;
import com.example.demo.modulos.gestionUsuariosRolesPermisos.dto.LoginResponse;
import com.example.demo.modulos.gestionUsuariosRolesPermisos.dto.RegisterRequest;
import com.example.demo.modulos.gestionUsuariosRolesPermisos.entity.Usuario;
import com.example.demo.modulos.gestionUsuariosRolesPermisos.mapper.UsuarioMapper;
import com.example.demo.modulos.gestionUsuariosRolesPermisos.repository.UsuarioRepository;
import com.example.demo.exception.BusinessException;
import com.example.demo.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AuthService {

	private final UsuarioRepository usuarioRepository;
	private final PasswordEncoder passwordEncoder;
	private final JwtService jwtService;

	public AuthService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
		this.usuarioRepository = usuarioRepository;
		this.passwordEncoder = passwordEncoder;
		this.jwtService = jwtService;
	}

	@Transactional(readOnly = true)
	public LoginResponse login(LoginRequest request) {
		Usuario usuario = usuarioRepository.findByEmail(request.email())
				.orElseThrow(() -> new BusinessException("Credenciales invalidas"));

		if (!usuario.isActivo()) {
			throw new BusinessException("El usuario esta desactivado");
		}

		if (!passwordEncoder.matches(request.password(), usuario.getPasswordHash())) {
			throw new BusinessException("Credenciales invalidas");
		}

		List<String> roles = usuario.getUsuarioRoles().stream()
				.map(usuarioRol -> usuarioRol.getRol().getNombre())
				.toList();

		String token = jwtService.generateToken(usuario, roles);
		return new LoginResponse(token, UsuarioMapper.toDTO(usuario));
	}

	@Transactional
	public LoginResponse register(RegisterRequest request) {
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
		usuario.setFechaCreacion(LocalDateTime.now());
		usuarioRepository.save(usuario);

		String token = jwtService.generateToken(usuario, List.of());
		return new LoginResponse(token, UsuarioMapper.toDTO(usuario));
	}
}