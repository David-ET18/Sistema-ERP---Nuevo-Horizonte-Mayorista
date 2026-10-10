package com.example.demo.modulos.notificaciones.service;

import com.example.demo.exception.NotFoundException;
import com.example.demo.modulos.gestionUsuariosRolesPermisos.entity.Usuario;
import com.example.demo.modulos.gestionUsuariosRolesPermisos.repository.UsuarioRepository;
import com.example.demo.modulos.notificaciones.dto.NotificacionDTO;
import com.example.demo.modulos.notificaciones.entity.Notificacion;
import com.example.demo.modulos.notificaciones.mapper.NotificacionMapper;
import com.example.demo.modulos.notificaciones.repository.NotificacionRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Service
public class NotificacionService {

	public static final String TIPO_PERMISOS = "ROL_PERMISOS";
	public static final String TIPO_ROL_ASIGNADO = "ROL_ASIGNADO";
	public static final String TIPO_ROL_QUITADO = "ROL_QUITADO";

	private final NotificacionRepository notificacionRepository;
	private final UsuarioRepository usuarioRepository;

	public NotificacionService(NotificacionRepository notificacionRepository,
			UsuarioRepository usuarioRepository) {
		this.notificacionRepository = notificacionRepository;
		this.usuarioRepository = usuarioRepository;
	}

	@Transactional
	public Notificacion crearParaUsuario(Long idUsuario, String titulo, String mensaje, String tipo) {
		return notificacionRepository.save(construir(idUsuario, titulo, mensaje, tipo));
	}

	@Transactional
	public void crearParaUsuarios(Collection<Usuario> usuarios, String titulo, String mensaje, String tipo) {
		if (usuarios == null || usuarios.isEmpty()) {
			return;
		}
		usuarios.forEach(usuario -> notificacionRepository.save(construirPorUsuario(usuario, titulo, mensaje, tipo)));
	}

	@Transactional(readOnly = true)
	public List<NotificacionDTO> listarMias() {
		Usuario usuario = usuarioActual();
		return notificacionRepository.findByUsuarioIdOrderByFechaCreacionDesc(usuario.getId()).stream()
				.map(NotificacionMapper::toDTO)
				.toList();
	}

	@Transactional(readOnly = true)
	public long noLeidas() {
		Usuario usuario = usuarioActual();
		return notificacionRepository.countByUsuarioIdAndLeidaFalse(usuario.getId());
	}

	@Transactional
	public void marcarLeidas(List<Long> ids) {
		if (ids == null || ids.isEmpty()) {
			return;
		}
		Usuario usuario = usuarioActual();
		notificacionRepository.marcarLeidas(usuario.getId(), ids);
	}

	private Notificacion construir(Long idUsuario, String titulo, String mensaje, String tipo) {
		Usuario usuario = usuarioRepository.findById(idUsuario)
				.orElseThrow(() -> new NotFoundException("Usuario no encontrado con id " + idUsuario));
		return construirPorUsuario(usuario, titulo, mensaje, tipo);
	}

	private Notificacion construirPorUsuario(Usuario usuario, String titulo, String mensaje, String tipo) {
		Notificacion notificacion = new Notificacion();
		notificacion.setUsuario(usuario);
		notificacion.setTitulo(titulo);
		notificacion.setMensaje(mensaje);
		notificacion.setTipo(tipo);
		notificacion.setLeida(false);
		notificacion.setFechaCreacion(LocalDateTime.now());
		return notificacion;
	}

	private Usuario usuarioActual() {
		String usernameAuth = SecurityContextHolder.getContext().getAuthentication().getName();
		return usuarioRepository.findByUsername(usernameAuth)
				.orElseThrow(() -> new NotFoundException("Usuario actual no encontrado"));
	}
}