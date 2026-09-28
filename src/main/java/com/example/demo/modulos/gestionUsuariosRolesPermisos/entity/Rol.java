package com.example.demo.modulos.gestionUsuariosRolesPermisos.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "rol", schema = "seguridad")
public class Rol {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id_rol")
	private Long id;

	@Column(name = "nombre", nullable = false, unique = true, length = 60)
	private String nombre;

	@Column(name = "descripcion", length = 200)
	private String descripcion;

	@Column(name = "tipo_base", nullable = false, length = 30)
	private String tipoBase = "custom";

	@Column(name = "color", length = 7)
	private String color;

	@Column(name = "es_sistema", nullable = false)
	private boolean esSistema = false;

	@Column(name = "activo", nullable = false)
	private boolean activo = true;

	@Column(name = "fecha_creacion", nullable = false)
	private LocalDateTime fechaCreacion = LocalDateTime.now();

	@Column(name = "fecha_actualizacion", nullable = false)
	private LocalDateTime fechaActualizacion = LocalDateTime.now();

	@OneToMany(mappedBy = "rol", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<UsuarioRol> usuarioRoles = new ArrayList<>();

	@OneToMany(mappedBy = "rol", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<RolPermiso> rolPermisos = new ArrayList<>();

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getNombre() {
		return nombre;
	}

	public void setNombre(String nombre) {
		this.nombre = nombre;
	}

	public String getDescripcion() {
		return descripcion;
	}

	public void setDescripcion(String descripcion) {
		this.descripcion = descripcion;
	}

	public String getTipoBase() {
		return tipoBase;
	}

	public void setTipoBase(String tipoBase) {
		this.tipoBase = tipoBase;
	}

	public String getColor() {
		return color;
	}

	public void setColor(String color) {
		this.color = color;
	}

	public boolean isEsSistema() {
		return esSistema;
	}

	public void setEsSistema(boolean esSistema) {
		this.esSistema = esSistema;
	}

	public boolean isActivo() {
		return activo;
	}

	public void setActivo(boolean activo) {
		this.activo = activo;
	}

	public LocalDateTime getFechaCreacion() {
		return fechaCreacion;
	}

	public void setFechaCreacion(LocalDateTime fechaCreacion) {
		this.fechaCreacion = fechaCreacion;
	}

	public LocalDateTime getFechaActualizacion() {
		return fechaActualizacion;
	}

	public void setFechaActualizacion(LocalDateTime fechaActualizacion) {
		this.fechaActualizacion = fechaActualizacion;
	}

	public List<UsuarioRol> getUsuarioRoles() {
		return usuarioRoles;
	}

	public void setUsuarioRoles(List<UsuarioRol> usuarioRoles) {
		this.usuarioRoles = usuarioRoles;
	}

	public List<RolPermiso> getRolPermisos() {
		return rolPermisos;
	}

	public void setRolPermisos(List<RolPermiso> rolPermisos) {
		this.rolPermisos = rolPermisos;
	}
}