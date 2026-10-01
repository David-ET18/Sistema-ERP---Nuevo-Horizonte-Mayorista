package com.example.demo.acceso.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "rol_permiso")
public class RolPermiso {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id_permiso")
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "id_rol", nullable = false)
	private Rol rol;

	@Column(name = "modulo", nullable = false, length = 60)
	private String modulo;

	@Column(name = "puede_leer", nullable = false)
	private boolean puedeLeer = true;

	@Column(name = "puede_escribir", nullable = false)
	private boolean puedeEscribir = false;

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Rol getRol() {
		return rol;
	}

	public void setRol(Rol rol) {
		this.rol = rol;
	}

	public String getModulo() {
		return modulo;
	}

	public void setModulo(String modulo) {
		this.modulo = modulo;
	}

	public boolean isPuedeLeer() {
		return puedeLeer;
	}

	public void setPuedeLeer(boolean puedeLeer) {
		this.puedeLeer = puedeLeer;
	}

	public boolean isPuedeEscribir() {
		return puedeEscribir;
	}

	public void setPuedeEscribir(boolean puedeEscribir) {
		this.puedeEscribir = puedeEscribir;
	}
}