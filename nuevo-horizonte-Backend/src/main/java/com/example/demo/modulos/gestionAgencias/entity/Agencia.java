package com.example.demo.modulos.gestionAgencias.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "agencia", schema = "ventas")
public class Agencia {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id_agencia")
	private Long id;

	@Column(name = "razon_social", nullable = false, length = 200)
	private String razonSocial;

	@Column(name = "nombre_comercial", length = 200)
	private String nombreComercial;

	@Column(name = "ruc", nullable = false, unique = true, length = 11)
	private String ruc;

	@Column(name = "categoria", length = 50)
	private String categoria;

	@Column(name = "es_prioritaria", nullable = false)
	private boolean esPrioritaria = false;

	@Column(name = "contacto_nombre", length = 100)
	private String contactoNombre;

	@Column(name = "contacto_telefono", length = 20)
	private String contactoTelefono;

	@Column(name = "contacto_email", length = 100)
	private String contactoEmail;

	@Column(name = "ciudad", length = 100)
	private String ciudad;

	/**
	 * Nombre del ejecutivo comercial a cargo de la cuenta. Texto libre porque
	 * Usuario todavia no tiene un campo de nombre completo (solo username).
	 */
	@Column(name = "ejecutivo_asignado", length = 150)
	private String ejecutivoAsignado;

	@Column(name = "activo", nullable = false)
	private boolean activo = true;

	@Column(name = "logo_url", length = 300)
	private String logoUrl;

	@Column(name = "fecha_creacion", nullable = false)
	private LocalDateTime fechaCreacion = LocalDateTime.now();

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getRazonSocial() {
		return razonSocial;
	}

	public void setRazonSocial(String razonSocial) {
		this.razonSocial = razonSocial;
	}

	public String getNombreComercial() {
		return nombreComercial;
	}

	public void setNombreComercial(String nombreComercial) {
		this.nombreComercial = nombreComercial;
	}

	public String getRuc() {
		return ruc;
	}

	public void setRuc(String ruc) {
		this.ruc = ruc;
	}

	public String getCategoria() {
		return categoria;
	}

	public void setCategoria(String categoria) {
		this.categoria = categoria;
	}

	public boolean isEsPrioritaria() {
		return esPrioritaria;
	}

	public void setEsPrioritaria(boolean esPrioritaria) {
		this.esPrioritaria = esPrioritaria;
	}

	public String getContactoNombre() {
		return contactoNombre;
	}

	public void setContactoNombre(String contactoNombre) {
		this.contactoNombre = contactoNombre;
	}

	public String getContactoTelefono() {
		return contactoTelefono;
	}

	public void setContactoTelefono(String contactoTelefono) {
		this.contactoTelefono = contactoTelefono;
	}

	public String getContactoEmail() {
		return contactoEmail;
	}

	public void setContactoEmail(String contactoEmail) {
		this.contactoEmail = contactoEmail;
	}

	public String getCiudad() {
		return ciudad;
	}

	public void setCiudad(String ciudad) {
		this.ciudad = ciudad;
	}

	public String getEjecutivoAsignado() {
		return ejecutivoAsignado;
	}

	public void setEjecutivoAsignado(String ejecutivoAsignado) {
		this.ejecutivoAsignado = ejecutivoAsignado;
	}

	public boolean isActivo() {
		return activo;
	}

	public void setActivo(boolean activo) {
		this.activo = activo;
	}

	public String getLogoUrl() {
		return logoUrl;
	}

	public void setLogoUrl(String logoUrl) {
		this.logoUrl = logoUrl;
	}

	public LocalDateTime getFechaCreacion() {
		return fechaCreacion;
	}

	public void setFechaCreacion(LocalDateTime fechaCreacion) {
		this.fechaCreacion = fechaCreacion;
	}
}