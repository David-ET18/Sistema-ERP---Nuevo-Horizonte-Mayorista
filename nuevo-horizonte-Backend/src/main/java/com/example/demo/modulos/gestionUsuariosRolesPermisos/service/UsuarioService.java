package com.example.demo.modulos.gestionUsuariosRolesPermisos.service;

import com.example.demo.modulos.gestionUsuariosRolesPermisos.dto.UsuarioCreateRequest;
import com.example.demo.modulos.gestionUsuariosRolesPermisos.dto.UsuarioDTO;
import com.example.demo.modulos.gestionUsuariosRolesPermisos.dto.UsuarioUpdateRequest;
import com.example.demo.modulos.gestionUsuariosRolesPermisos.entity.Rol;
import com.example.demo.modulos.gestionUsuariosRolesPermisos.entity.Usuario;
import com.example.demo.modulos.gestionUsuariosRolesPermisos.mapper.UsuarioMapper;
import com.example.demo.modulos.gestionUsuariosRolesPermisos.repository.RolRepository;
import com.example.demo.modulos.gestionUsuariosRolesPermisos.repository.UsuarioRepository;
import com.example.demo.modulos.notificaciones.service.NotificacionService;
import com.example.demo.exception.BusinessException;
import com.example.demo.exception.NotFoundException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class UsuarioService {

	private final UsuarioRepository usuarioRepository;
	private final RolRepository rolRepository;
	private final PasswordEncoder passwordEncoder;
	private final NotificacionService notificacionService;

	public UsuarioService(UsuarioRepository usuarioRepository, RolRepository rolRepository,
			PasswordEncoder passwordEncoder, NotificacionService notificacionService) {
		this.usuarioRepository = usuarioRepository;
		this.rolRepository = rolRepository;
		this.passwordEncoder = passwordEncoder;
		this.notificacionService = notificacionService;
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
			if (request.activo() && usuario.isAnonimizado()) {
				throw new BusinessException("Este usuario fue anonimizado y ya no se puede reactivar");
			}
			usuario.setActivo(request.activo());
		}

		if (request.rolIds() != null) {
			Set<Long> antes = usuario.getUsuarioRoles().stream()
					.map(ur -> ur.getRol().getId())
					.collect(Collectors.toSet());
			usuario.getUsuarioRoles().clear();
			asignarRoles(usuario, request.rolIds());
			Set<Long> despues = new HashSet<>(request.rolIds());
			notificarCambioRoles(usuario, antes, despues);
		}

		return UsuarioMapper.toDTO(usuario);
	}

	@Transactional
	public void desactivar(Long id) {
		Usuario usuario = obtenerUsuario(id);
		String usernameAuth = SecurityContextHolder.getContext().getAuthentication().getName();
		if (usuario.getUsername().equals(usernameAuth)) {
			throw new BusinessException("No puedes desactivar tu propia cuenta");
		}
		usuario.setActivo(false);
	}

	/**
	 * Sobreescribe los datos identificables (username, email, password) sin
	 * tocar la fila: las ventas, cotizaciones y cambios de precio que dejo
	 * siguen apuntando a un usuario valido, pero ya no se puede saber quien
	 * era ni iniciar sesion con esa cuenta. Es la salida para cuando alguien
	 * se va de la empresa y "eliminarDefinitivo" no es viable porque tiene
	 * historial asociado.
	 */
	@Transactional
	public void anonimizar(Long id) {
		Usuario usuario = obtenerUsuario(id);
		if (usuario.isActivo()) {
			throw new BusinessException("Primero debes desactivar al usuario antes de anonimizarlo");
		}
		if (usuario.isAnonimizado()) {
			return;
		}
		usuario.setUsername("usuario_eliminado_" + id);
		usuario.setEmail("eliminado+" + id + "@baja.local");
		usuario.setPasswordHash(passwordEncoder.encode(java.util.UUID.randomUUID().toString()));
		usuario.setAnonimizado(true);
	}

	/**
	 * Borrado fisico, solo para cuando alguien se va de la empresa y ya esta
	 * desactivado. Si el usuario tiene historial real (ventas, cotizaciones,
	 * cambios de precio que registro, etc.) la base rechaza el borrado: ese
	 * historial tiene que conservarse, asi que se queda desactivado para
	 * siempre en lugar de eliminarse.
	 */
	@Transactional
	public void eliminarDefinitivo(Long id) {
		Usuario usuario = obtenerUsuario(id);
		if (usuario.isActivo()) {
			throw new BusinessException("Primero debes desactivar al usuario antes de eliminarlo definitivamente");
		}
		try {
			usuarioRepository.delete(usuario);
			usuarioRepository.flush();
		}
		catch (org.springframework.dao.DataIntegrityViolationException ex) {
			throw new org.springframework.web.server.ResponseStatusException(
					org.springframework.http.HttpStatus.CONFLICT,
					"Este usuario tiene historial asociado (ventas, cotizaciones, cambios de precio, etc.) y no se puede eliminar definitivamente. Debe permanecer desactivado.");
		}
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

	/**
	 * Avisa al usuario de los roles que se le agregaron y de los que se le
	 * quitaron. Cada cambio genera una notificacion individual para el
	 * usuario afectado (solo el ve su propio cambio).
	 */
	private void notificarCambioRoles(Usuario usuario, Set<Long> antes, Set<Long> despues) {
		List<Long> asignados = despues.stream().filter(id -> !antes.contains(id)).toList();
		List<Long> quitados = antes.stream().filter(id -> !despues.contains(id)).toList();

		for (Long rolId : asignados) {
			Rol rol = rolRepository.findById(rolId).orElse(null);
			if (rol != null) {
				notificacionService.crearParaUsuario(usuario.getId(),
						"Rol asignado",
						"Se te asign\u00f3 el rol \u00AB" + rol.getNombre() + "\u00BB",
						NotificacionService.TIPO_ROL_ASIGNADO);
			}
		}
		for (Long rolId : quitados) {
			Rol rol = rolRepository.findById(rolId).orElse(null);
			if (rol != null) {
				notificacionService.crearParaUsuario(usuario.getId(),
						"Rol retirado",
						"Se te quit\u00f3 el rol \u00AB" + rol.getNombre() + "\u00BB",
						NotificacionService.TIPO_ROL_QUITADO);
			}
		}
	}
}