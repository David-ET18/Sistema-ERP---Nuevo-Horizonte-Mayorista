package com.example.demo.modulos.gestionUsuariosRolesPermisos.service;

import com.example.demo.exception.BusinessException;
import com.example.demo.exception.NotFoundException;
import com.example.demo.modulos.gestionUsuariosRolesPermisos.dto.CambiarPasswordRequest;
import com.example.demo.modulos.gestionUsuariosRolesPermisos.dto.LoginRequest;
import com.example.demo.modulos.gestionUsuariosRolesPermisos.dto.LoginResponse;
import com.example.demo.modulos.gestionUsuariosRolesPermisos.dto.MessageResponse;
import com.example.demo.modulos.gestionUsuariosRolesPermisos.dto.PerfilUpdateRequest;
import com.example.demo.modulos.gestionUsuariosRolesPermisos.dto.RegisterRequest;
import com.example.demo.modulos.gestionUsuariosRolesPermisos.dto.UsuarioDTO;
import com.example.demo.modulos.gestionUsuariosRolesPermisos.entity.HistorialPassword;
import com.example.demo.modulos.gestionUsuariosRolesPermisos.entity.Usuario;
import com.example.demo.modulos.gestionUsuariosRolesPermisos.mapper.UsuarioMapper;
import com.example.demo.modulos.gestionUsuariosRolesPermisos.repository.HistorialPasswordRepository;
import com.example.demo.modulos.gestionUsuariosRolesPermisos.repository.UsuarioRepository;
import com.example.demo.security.JwtService;
import org.springframework.security.core.context.SecurityContextHolder;
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
	private final HistorialPasswordRepository historialPasswordRepository;

	public AuthService(UsuarioRepository usuarioRepository,
					   PasswordEncoder passwordEncoder,
					   JwtService jwtService,
					   HistorialPasswordRepository historialPasswordRepository) {
		this.usuarioRepository = usuarioRepository;
		this.passwordEncoder = passwordEncoder;
		this.jwtService = jwtService;
		this.historialPasswordRepository = historialPasswordRepository;
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

	@Transactional(readOnly = true)
	public UsuarioDTO obtenerPerfil() {
		String usernameAuth = SecurityContextHolder.getContext().getAuthentication().getName();
		Usuario usuario = usuarioRepository.findByUsername(usernameAuth)
				.orElseThrow(() -> new NotFoundException("Usuario no encontrado"));
		return UsuarioMapper.toDTO(usuario);
	}

	@Transactional
	public UsuarioDTO actualizarPerfil(PerfilUpdateRequest request) {
		String usernameAuth = SecurityContextHolder.getContext().getAuthentication().getName();
		Usuario usuario = usuarioRepository.findByUsername(usernameAuth)
				.orElseThrow(() -> new NotFoundException("Usuario no encontrado"));

		if (!usuario.getUsername().equals(request.username())
				&& usuarioRepository.existsByUsername(request.username())) {
			throw new BusinessException("El nombre de usuario ya existe");
		}
		if (!usuario.getEmail().equals(request.email())
				&& usuarioRepository.existsByEmail(request.email())) {
			throw new BusinessException("El correo electrónico ya está registrado");
		}

		usuario.setUsername(request.username());
		usuario.setEmail(request.email());
		return UsuarioMapper.toDTO(usuario);
	}

	@Transactional
	public MessageResponse cambiarPassword(CambiarPasswordRequest request) {
		if (!request.nuevaContrasena().equals(request.confirmarContrasena())) {
			throw new BusinessException("La nueva contraseña y su confirmación no coinciden");
		}

		String usernameAuth = SecurityContextHolder.getContext().getAuthentication().getName();
		Usuario usuario = usuarioRepository.findByUsername(usernameAuth)
				.orElseThrow(() -> new NotFoundException("Usuario no encontrado"));

		if (!passwordEncoder.matches(request.passwordActual(), usuario.getPasswordHash())) {
			throw new BusinessException("La contraseña actual es incorrecta");
		}

		String nuevoHash = passwordEncoder.encode(request.nuevaContrasena());
		List<HistorialPassword> ultimos3 = historialPasswordRepository
				.findTop3ByUsuario_IdOrderByFechaCambioDesc(usuario.getId());
		for (HistorialPassword hp : ultimos3) {
			if (passwordEncoder.matches(request.nuevaContrasena(), hp.getHashPassword())) {
				throw new BusinessException("No puedes reutilizar una contraseña reciente");
			}
		}

		usuario.setPasswordHash(nuevoHash);

		HistorialPassword hp = new HistorialPassword();
		hp.setUsuario(usuario);
		hp.setHashPassword(nuevoHash);
		hp.setFechaCambio(LocalDateTime.now());
		historialPasswordRepository.save(hp);

		return new MessageResponse("Contraseña actualizada correctamente");
	}
}