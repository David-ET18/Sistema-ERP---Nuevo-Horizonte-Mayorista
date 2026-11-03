package com.example.demo.modulos.promociones.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Datos de alta/edicion enviados como multipart/form-data. La imagen viaja
 * aparte como MultipartFile en el controller.
 */
public class PromocionRequest {

	@NotBlank(message = "El nombre es obligatorio")
	@Size(max = 120, message = "El nombre no debe superar 120 caracteres")
	private String nombre;

	@Size(max = 2000, message = "La descripcion no debe superar 2000 caracteres")
	private String descripcion;

	/** Null para promociones generales. */
	private Long servicioId;

	@NotNull(message = "El descuento es obligatorio")
	@DecimalMin(value = "0.01", message = "El descuento debe ser mayor a 0")
	@DecimalMax(value = "100.00", message = "El descuento no puede superar 100%")
	private BigDecimal descuentoPorcentaje;

	@DecimalMin(value = "0.00", message = "El precio original no puede ser negativo")
	private BigDecimal precioOriginal;

	@DecimalMin(value = "0.00", message = "El precio promocional no puede ser negativo")
	private BigDecimal precioPromocional;

	private LocalDate fechaInicio;

	private LocalDate fechaFin;

	private Boolean destacada;

	private Boolean activa;

	/** Marca para quitar la imagen existente durante una edicion. */
	private Boolean quitarImagen;

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

	public Long getServicioId() {
		return servicioId;
	}

	public void setServicioId(Long servicioId) {
		this.servicioId = servicioId;
	}

	public BigDecimal getDescuentoPorcentaje() {
		return descuentoPorcentaje;
	}

	public void setDescuentoPorcentaje(BigDecimal descuentoPorcentaje) {
		this.descuentoPorcentaje = descuentoPorcentaje;
	}

	public BigDecimal getPrecioOriginal() {
		return precioOriginal;
	}

	public void setPrecioOriginal(BigDecimal precioOriginal) {
		this.precioOriginal = precioOriginal;
	}

	public BigDecimal getPrecioPromocional() {
		return precioPromocional;
	}

	public void setPrecioPromocional(BigDecimal precioPromocional) {
		this.precioPromocional = precioPromocional;
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

	public Boolean getDestacada() {
		return destacada;
	}

	public void setDestacada(Boolean destacada) {
		this.destacada = destacada;
	}

	public Boolean getActiva() {
		return activa;
	}

	public void setActiva(Boolean activa) {
		this.activa = activa;
	}

	public Boolean getQuitarImagen() {
		return quitarImagen;
	}

	public void setQuitarImagen(Boolean quitarImagen) {
		this.quitarImagen = quitarImagen;
	}
}
