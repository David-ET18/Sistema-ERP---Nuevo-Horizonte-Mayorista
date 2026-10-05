package com.example.demo.modulos.gestionUsuariosRolesPermisos.entity;

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
@Table(name = "password_reset_token", schema = "seguridad")
public class PasswordResetToken {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id_token")
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "id_usuario")
	private Usuario usuario;

	@Column(name = "token", nullable = false, unique = true, length = 64)
	private String token;

	@Column(name = "fecha_expiracion", nullable = false)
	private LocalDateTime fechaExpiracion;

	@Column(name = "usado", nullable = false)
	private boolean usado = false;

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

	public String getToken() {
		return token;
	}

	public void setToken(String token) {
		this.token = token;
	}

	public LocalDateTime getFechaExpiracion() {
		return fechaExpiracion;
	}

	public void setFechaExpiracion(LocalDateTime fechaExpiracion) {
		this.fechaExpiracion = fechaExpiracion;
	}

	public boolean isUsado() {
		return usado;
	}

	public void setUsado(boolean usado) {
		this.usado = usado;
	}

	public LocalDateTime getFechaCreacion() {
		return fechaCreacion;
	}

	public void setFechaCreacion(LocalDateTime fechaCreacion) {
		this.fechaCreacion = fechaCreacion;
	}
}