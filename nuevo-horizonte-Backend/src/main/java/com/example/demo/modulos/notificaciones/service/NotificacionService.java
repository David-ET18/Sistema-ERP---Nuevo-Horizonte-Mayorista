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
	public static final String TIPO_PROMOCION = "PROMOCION";
	public static final String TIPO_SISTEMA = "SISTEMA";

	private final NotificacionRepository notificacionRepository;
	private final UsuarioRepository usuarioRepository;

	public NotificacionService(NotificacionRepository notificacionRepository,
			UsuarioRepository usuarioRepository) {
		this.notificacionRepository = notificacionRepository;
		this.usuarioRepository = usuarioRepository;
	}

	@Transactional
	public Notificacion crearParaUsuario(Long idUsuario, String titulo, String mensaje, String tipo) {
		return crearParaUsuario(idUsuario, titulo, mensaje, tipo, null);
	}

	@Transactional
	public Notificacion crearParaUsuario(Long idUsuario, String titulo, String mensaje, String tipo,
			String enlace) {
		return notificacionRepository.save(construir(idUsuario, titulo, mensaje, tipo, enlace));
	}

	@Transactional
	public void crearParaUsuarios(Collection<Usuario> usuarios, String titulo, String mensaje, String tipo) {
		crearParaUsuarios(usuarios, titulo, mensaje, tipo, null);
	}

	@Transactional
	public void crearParaUsuarios(Collection<Usuario> usuarios, String titulo, String mensaje, String tipo,
			String enlace) {
		if (usuarios == null || usuarios.isEmpty()) {
			return;
		}
		usuarios.forEach(usuario -> notificacionRepository
				.save(construirPorUsuario(usuario, titulo, mensaje, tipo, enlace)));
	}

	/**
	 * Aviso global: se crea una fila por cada usuario activo para que cada uno
	 * pueda marcarlo o eliminarlo sin afectar la bandeja de los demas.
	 */
	@Transactional
	public void crearParaTodos(String titulo, String mensaje, String tipo, String enlace) {
		crearParaUsuarios(usuarioRepository.findByActivoTrue(), titulo, mensaje, tipo, enlace);
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
	public void marcarLeida(Long id) {
		Usuario usuario = usuarioActual();
		Notificacion notificacion = notificacionRepository.findByIdAndUsuarioId(id, usuario.getId())
				.orElseThrow(() -> new NotFoundException("Notificacion no encontrada con id " + id));
		if (!notificacion.isLeida()) {
			notificacion.setLeida(true);
			notificacion.setFechaLeida(LocalDateTime.now());
			notificacionRepository.save(notificacion);
		}
	}

	@Transactional
	public void marcarLeidas(List<Long> ids) {
		if (ids == null || ids.isEmpty()) {
			return;
		}
		Usuario usuario = usuarioActual();
		notificacionRepository.marcarLeidas(usuario.getId(), ids, LocalDateTime.now());
	}

	@Transactional
	public void marcarTodasLeidas() {
		Usuario usuario = usuarioActual();
		notificacionRepository.marcarTodasLeidas(usuario.getId(), LocalDateTime.now());
	}

	@Transactional
	public void eliminar(Long id) {
		Usuario usuario = usuarioActual();
		Notificacion notificacion = notificacionRepository.findByIdAndUsuarioId(id, usuario.getId())
				.orElseThrow(() -> new NotFoundException("Notificacion no encontrada con id " + id));
		notificacionRepository.delete(notificacion);
	}

	@Transactional
	public void eliminarLeidas() {
		Usuario usuario = usuarioActual();
		notificacionRepository.eliminarLeidas(usuario.getId());
	}

	private Notificacion construir(Long idUsuario, String titulo, String mensaje, String tipo, String enlace) {
		Usuario usuario = usuarioRepository.findById(idUsuario)
				.orElseThrow(() -> new NotFoundException("Usuario no encontrado con id " + idUsuario));
		return construirPorUsuario(usuario, titulo, mensaje, tipo, enlace);
	}

	private Notificacion construirPorUsuario(Usuario usuario, String titulo, String mensaje, String tipo,
			String enlace) {
		Notificacion notificacion = new Notificacion();
		notificacion.setUsuario(usuario);
		notificacion.setTitulo(titulo);
		notificacion.setMensaje(mensaje);
		notificacion.setTipo(tipo);
		notificacion.setEnlace(enlace);
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
