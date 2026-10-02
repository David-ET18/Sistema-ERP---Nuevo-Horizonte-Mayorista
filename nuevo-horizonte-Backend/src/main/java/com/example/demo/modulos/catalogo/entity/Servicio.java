package com.example.demo.modulos.catalogo.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "servicio", schema = "catalogo")
public class Servicio {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id_servicio")
	private Long id;

	@Column(name = "nombre", nullable = false, unique = true, length = 100)
	private String nombre;

	@Column(name = "categoria", length = 50)
	private String categoria;

	@Column(name = "descripcion", columnDefinition = "text")
	private String descripcion;

	/** Un servicio inactivo deja de ofrecerse en los formularios pero conserva su historial. */
	@Column(name = "activo", nullable = false, columnDefinition = "boolean not null default true")
	private boolean activo = true;

	@Column(name = "fecha_creacion", nullable = false, columnDefinition = "timestamp not null default now()")
	private LocalDateTime fechaCreacion = LocalDateTime.now();

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

	public String getCategoria() {
		return categoria;
	}

	public void setCategoria(String categoria) {
		this.categoria = categoria;
	}

	public String getDescripcion() {
		return descripcion;
	}

	public void setDescripcion(String descripcion) {
		this.descripcion = descripcion;
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
}
