package com.example.demo.modulos.notificaciones.service;

import com.example.demo.exception.NotFoundException;
import com.example.demo.modulos.gestionUsuariosRolesPermisos.entity.Usuario;
import com.example.demo.modulos.gestionUsuariosRolesPermisos.repository.UsuarioRepository;
import com.example.demo.modulos.notificaciones.dto.KpiNotificacionesDTO;
import com.example.demo.modulos.notificaciones.dto.NotificacionDTO;
import com.example.demo.modulos.notificaciones.entity.Notificacion;
import com.example.demo.modulos.notificaciones.mapper.NotificacionMapper;
import com.example.demo.modulos.notificaciones.repository.NotificacionRepository;
import com.example.demo.util.Textos;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Locale;

@Service
public class NotificacionService {

	public static final String TIPO_PERMISOS = "ROL_PERMISOS";
	public static final String TIPO_ROL_ASIGNADO = "ROL_ASIGNADO";
	public static final String TIPO_ROL_QUITADO = "ROL_QUITADO";
	public static final String TIPO_PROMOCION = "PROMOCION";
	public static final String TIPO_SISTEMA = "SISTEMA";
	public static final String TIPO_COTIZACION = "COTIZACION";
	public static final String TIPO_VENTA = "VENTA";
	public static final String TIPO_AGENCIA = "AGENCIA";
	public static final String TIPO_TARIFA = "TARIFA";
	public static final String TIPO_PROVEEDOR = "PROVEEDOR";
	public static final String TIPO_PAQUETE = "PAQUETE";
	public static final String TIPO_CATALOGO = "CATALOGO";
	public static final String TIPO_MARKETING = "MARKETING";

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
	public Notificacion crearParaUsuario(Long idUsuario, String titulo, String mensaje, String tipo, String enlace) {
		return crearParaUsuario(idUsuario, titulo, mensaje, tipo, enlace, null, null);
	}

	/**
	 * Crea una notificacion con contexto ampliado: quien la provoco
	 * (actorNombre) y el detalle largo del cambio (detalle). Ambos pueden ser
	 * null; el panel de detalle del frontend cae al mensaje cuando faltan.
	 */
	@Transactional
	public Notificacion crearParaUsuario(Long idUsuario, String titulo, String mensaje, String tipo, String enlace,
			String actorNombre, String detalle) {
		Usuario usuario = usuarioRepository.findById(idUsuario)
				.orElseThrow(() -> new NotFoundException("Usuario no encontrado con id " + idUsuario));
		return notificacionRepository
				.save(construirPorUsuario(usuario, titulo, mensaje, tipo, enlace, actorNombre, detalle));
	}

	@Transactional
	public void crearParaUsuarios(Collection<Usuario> usuarios, String titulo, String mensaje, String tipo) {
		crearParaUsuarios(usuarios, titulo, mensaje, tipo, null, null, null);
	}

	@Transactional
	public void crearParaUsuarios(Collection<Usuario> usuarios, String titulo, String mensaje, String tipo,
			String enlace) {
		crearParaUsuarios(usuarios, titulo, mensaje, tipo, enlace, null, null);
	}

	@Transactional
	public void crearParaUsuarios(Collection<Usuario> usuarios, String titulo, String mensaje, String tipo,
			String enlace, String actorNombre, String detalle) {
		if (usuarios == null || usuarios.isEmpty()) {
			return;
		}
		List<Notificacion> nuevas = usuarios.stream()
				.map(usuario -> construirPorUsuario(usuario, titulo, mensaje, tipo, enlace, actorNombre, detalle))
				.toList();
		notificacionRepository.saveAll(nuevas);
	}

	/** Notificacion masiva para todos los usuarios con la cuenta activa. */
	@Transactional
	public void crearParaUsuariosActivos(String titulo, String mensaje, String tipo, String enlace) {
		crearParaUsuariosActivos(titulo, mensaje, tipo, enlace, null, null);
	}

	@Transactional
	public void crearParaUsuariosActivos(String titulo, String mensaje, String tipo, String enlace,
			String actorNombre, String detalle) {
		crearParaUsuarios(usuarioRepository.findByActivoTrue(), titulo, mensaje, tipo, enlace, actorNombre, detalle);
	}

	@Transactional(readOnly = true)
	public List<NotificacionDTO> listarMias() {
		Usuario usuario = usuarioActual();
		return notificacionRepository.findByUsuarioIdOrderByFechaCreacionDesc(usuario.getId()).stream()
				.map(NotificacionMapper::toDTO)
				.toList();
	}

	@Transactional(readOnly = true)
	public Page<NotificacionDTO> paginar(String q, Boolean leida, String tipo, Pageable pageable) {
		Usuario usuario = usuarioActual();
		String patron = Textos.patronContiene(q);
		String tipoNormalizado = Textos.noVacio(tipo) ? tipo.trim().toUpperCase(Locale.ROOT) : null;
		return notificacionRepository.buscar(usuario.getId(), patron, leida, tipoNormalizado, pageable)
				.map(NotificacionMapper::toDTO);
	}

	@Transactional(readOnly = true)
	public KpiNotificacionesDTO kpis() {
		Long idUsuario = usuarioActual().getId();
		return new KpiNotificacionesDTO(
				notificacionRepository.countByUsuarioId(idUsuario),
				notificacionRepository.countByUsuarioIdAndLeidaFalse(idUsuario),
				notificacionRepository.countByUsuarioIdAndLeidaTrue(idUsuario),
				notificacionRepository.countByUsuarioIdAndTipo(idUsuario, TIPO_PROMOCION));
	}

	@Transactional(readOnly = true)
	public long noLeidas() {
		Usuario usuario = usuarioActual();
		return notificacionRepository.countByUsuarioIdAndLeidaFalse(usuario.getId());
	}

	@Transactional
	public void marcarUna(Long id) {
		Usuario usuario = usuarioActual();
		int filas = notificacionRepository.marcarUnaLeida(usuario.getId(), id);
		if (filas == 0) {
			throw new NotFoundException("Notificación no encontrada con id " + id);
		}
	}

	@Transactional
	public int marcarTodas() {
		return notificacionRepository.marcarTodasLeidas(usuarioActual().getId());
	}

	@Transactional
	public void marcarLeidas(List<Long> ids) {
		if (ids == null || ids.isEmpty()) {
			return;
		}
		Usuario usuario = usuarioActual();
		notificacionRepository.marcarLeidas(usuario.getId(), ids);
	}

	@Transactional
	public void eliminarUna(Long id) {
		Usuario usuario = usuarioActual();
		int filas = notificacionRepository.eliminarUna(usuario.getId(), id);
		if (filas == 0) {
			throw new NotFoundException("Notificación no encontrada con id " + id);
		}
	}

	@Transactional
	public int eliminarLeidas() {
		return notificacionRepository.eliminarLeidas(usuarioActual().getId());
	}

	private Notificacion construirPorUsuario(Usuario usuario, String titulo, String mensaje, String tipo,
			String enlace, String actorNombre, String detalle) {
		Notificacion notificacion = new Notificacion();
		notificacion.setUsuario(usuario);
		notificacion.setTitulo(titulo);
		notificacion.setMensaje(mensaje);
		notificacion.setTipo(tipo);
		notificacion.setEnlace(Textos.sinEspacios(enlace));
		notificacion.setActorNombre(Textos.noVacio(actorNombre) ? recortar(actorNombre.trim(), 120) : null);
		notificacion.setDetalle(Textos.noVacio(detalle) ? recortar(detalle.trim(), 1000) : null);
		notificacion.setLeida(false);
		notificacion.setFechaCreacion(LocalDateTime.now());
		return notificacion;
	}

	/**
	 * Usuario autenticado que ejecuta la accion, para mostrarlo como autor del
	 * cambio. Devuelve null en procesos automaticos (sin sesion).
	 */
	public String actorActual() {
		var autenticacion = SecurityContextHolder.getContext().getAuthentication();
		if (autenticacion == null || !autenticacion.isAuthenticated()) {
			return null;
		}
		String nombre = autenticacion.getName();
		if (!Textos.noVacio(nombre) || "anonymousUser".equalsIgnoreCase(nombre)) {
			return null;
		}
		return nombre.trim();
	}

	private String recortar(String valor, int maximo) {
		return valor.length() <= maximo ? valor : valor.substring(0, maximo);
	}

	private Usuario usuarioActual() {
		String usernameAuth = SecurityContextHolder.getContext().getAuthentication().getName();
		return usuarioRepository.findByUsername(usernameAuth)
				.orElseThrow(() -> new NotFoundException("Usuario actual no encontrado"));
	}
}
