package com.example.demo.modulos.promociones.dto;

import org.springframework.format.annotation.DateTimeFormat;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Datos de alta/edicion de una promocion. Se enlaza automaticamente desde los
 * campos del formulario multipart (la imagen viaja aparte como MultipartFile).
 */
public class PromocionRequest {

	private String titulo;

	private String descripcion;

	private BigDecimal descuento;

	@DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
	private LocalDate fechaInicio;

	@DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
	private LocalDate fechaFin;

	private Boolean activo;

	private Boolean destacada;

	private Long servicioId;

	/** Si es true, la imagen actual se elimina aunque no se suba otra. */
	private Boolean quitarImagen;

	public String getTitulo() {
		return titulo;
	}

	public void setTitulo(String titulo) {
		this.titulo = titulo;
	}

	public String getDescripcion() {
		return descripcion;
	}

	public void setDescripcion(String descripcion) {
		this.descripcion = descripcion;
	}

	public BigDecimal getDescuento() {
		return descuento;
	}

	public void setDescuento(BigDecimal descuento) {
		this.descuento = descuento;
	}

	public LocalDate getFechaInicio() {
		return fechaInicio;
	}

	public void setFechaInicio(LocalDate fechaInicio) {
		this.fechaInicio = fechaInicio;
	}

	public LocalDate getFechaFin() {
		return fechaFin;
	}

	public void setFechaFin(LocalDate fechaFin) {
		this.fechaFin = fechaFin;
	}

	public Boolean getActivo() {
		return activo;
	}

	public void setActivo(Boolean activo) {
		this.activo = activo;
	}

	public Boolean getDestacada() {
		return destacada;
	}

	public void setDestacada(Boolean destacada) {
		this.destacada = destacada;
	}

	public Long getServicioId() {
		return servicioId;
	}

	public void setServicioId(Long servicioId) {
		this.servicioId = servicioId;
	}

	public Boolean getQuitarImagen() {
		return quitarImagen;
	}

	public void setQuitarImagen(Boolean quitarImagen) {
		this.quitarImagen = quitarImagen;
	}
}
