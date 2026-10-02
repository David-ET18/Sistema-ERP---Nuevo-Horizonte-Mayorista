package com.example.demo.modulos.catalogo.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "destino", schema = "catalogo")
public class Destino {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id_destino")
	private Long id;

	@Column(name = "nombre", nullable = false, length = 100)
	private String nombre;

	@Column(name = "pais", nullable = false, length = 100)
	private String pais;

	@Column(name = "descripcion", columnDefinition = "text")
	private String descripcion;

	/** Un destino inactivo deja de ofrecerse en los formularios pero conserva su historial. */
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

	public String getPais() {
		return pais;
	}

	public void setPais(String pais) {
		this.pais = pais;
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
