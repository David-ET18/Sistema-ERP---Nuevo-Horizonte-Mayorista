package com.example.demo.modulos.notificaciones.entity;

import com.example.demo.modulos.gestionUsuariosRolesPermisos.entity.Usuario;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "notificacion", schema = "seguridad")
public class Notificacion {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id_notificacion")
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "id_usuario", nullable = false)
	private Usuario usuario;

	@Column(name = "titulo", nullable = false, length = 120)
	private String titulo;

	@Column(name = "mensaje", nullable = false, length = 500)
	private String mensaje;

	/** Tipo de fuente: ROL_PERMISOS, ROL_ASIGNADO, ROL_QUITADO, PROMOCION, SISTEMA. */
	@Column(name = "tipo", nullable = false, length = 40)
	private String tipo = "SISTEMA";

	@Column(name = "leida", nullable = false)
	private boolean leida = false;

	/** Ruta interna del modulo relacionado (ej. /promociones). */
	@Column(name = "enlace", length = 255)
	private String enlace;

	/** Usuario que provoco el cambio (null en avisos automaticos del sistema). */
	@Column(name = "actor_nombre", length = 120)
	private String actorNombre;

	/** Detalle ampliado con el antes/despues del cambio. */
	@Column(name = "detalle", length = 1000)
	private String detalle;

	/** Se completa cuando el usuario marca la notificacion como leida. */
	@Column(name = "fecha_leida")
	private LocalDateTime fechaLeida;

	@Column(name = "fecha_creacion", nullable = false)
	private LocalDateTime fechaCreacion = LocalDateTime.now();

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Usuario getUsuario() {
		return usuario;
	}

	public void setUsuario(Usuario usuario) {
		this.usuario = usuario;
	}

	public String getTitulo() {
		return titulo;
	}

	public void setTitulo(String titulo) {
		this.titulo = titulo;
	}

	public String getMensaje() {
		return mensaje;
	}

	public void setMensaje(String mensaje) {
		this.mensaje = mensaje;
	}

	public String getTipo() {
		return tipo;
	}

	public void setTipo(String tipo) {
		this.tipo = tipo;
	}

	public boolean isLeida() {
		return leida;
	}

	public void setLeida(boolean leida) {
		this.leida = leida;
	}

	public String getEnlace() {
		return enlace;
	}

	public void setEnlace(String enlace) {
		this.enlace = enlace;
	}

	public String getActorNombre() {
		return actorNombre;
	}

	public void setActorNombre(String actorNombre) {
		this.actorNombre = actorNombre;
	}

	public String getDetalle() {
		return detalle;
	}

	public void setDetalle(String detalle) {
		this.detalle = detalle;
	}

	public LocalDateTime getFechaLeida() {
		return fechaLeida;
	}

	public void setFechaLeida(LocalDateTime fechaLeida) {
		this.fechaLeida = fechaLeida;
	}

	public LocalDateTime getFechaCreacion() {
		return fechaCreacion;
	}

	public void setFechaCreacion(LocalDateTime fechaCreacion) {
		this.fechaCreacion = fechaCreacion;
	}
}