package com.example.demo.modulos.promociones.entity;

import com.example.demo.modulos.catalogo.entity.Servicio;
import jakarta.persistence.Basic;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Promocion comercial. La imagen se guarda en la misma fila como bytea
 * (catalogo.promocion.imagen) y se sirve por separado desde el controller
 * para no cargar binarios en los listados.
 */
@Entity
@Table(name = "promocion", schema = "catalogo")
public class Promocion {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id_promocion")
	private Long id;

	@Column(name = "nombre", nullable = false, length = 120)
	private String nombre;

	@Column(name = "descripcion", columnDefinition = "text")
	private String descripcion;

	/** Servicio del catalogo al que aplica. Null = promocion general. */
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "id_servicio")
	private Servicio servicio;

	@Column(name = "descuento_porcentaje", nullable = false, precision = 5, scale = 2)
	private BigDecimal descuentoPorcentaje;

	@Column(name = "precio_original", precision = 10, scale = 2)
	private BigDecimal precioOriginal;

	@Column(name = "precio_promocional", precision = 10, scale = 2)
	private BigDecimal precioPromocional;

	@Column(name = "fecha_inicio")
	private LocalDate fechaInicio;

	@Column(name = "fecha_fin")
	private LocalDate fechaFin;

	@Column(name = "destacada", nullable = false)
	private boolean destacada = false;

	@Column(name = "activa", nullable = false)
	private boolean activa = true;

	@Basic(fetch = FetchType.LAZY)
	@Column(name = "imagen", columnDefinition = "bytea")
	private byte[] imagen;

	@Column(name = "imagen_content_type", length = 60)
	private String imagenContentType;

	@Column(name = "imagen_nombre", length = 200)
	private String imagenNombre;

	@Column(name = "imagen_tamano")
	private Long imagenTamano;

	@Column(name = "fecha_creacion", nullable = false)
	private LocalDateTime fechaCreacion = LocalDateTime.now();

	@Column(name = "fecha_actualizacion", nullable = false)
	private LocalDateTime fechaActualizacion = LocalDateTime.now();

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

	public Servicio getServicio() {
		return servicio;
	}

	public void setServicio(Servicio servicio) {
		this.servicio = servicio;
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

	public boolean isDestacada() {
		return destacada;
	}

	public void setDestacada(boolean destacada) {
		this.destacada = destacada;
	}

	public boolean isActiva() {
		return activa;
	}

	public void setActiva(boolean activa) {
		this.activa = activa;
	}

	public byte[] getImagen() {
		return imagen;
	}

	public void setImagen(byte[] imagen) {
		this.imagen = imagen;
	}

	public String getImagenContentType() {
		return imagenContentType;
	}

	public void setImagenContentType(String imagenContentType) {
		this.imagenContentType = imagenContentType;
	}

	public String getImagenNombre() {
		return imagenNombre;
	}

	public void setImagenNombre(String imagenNombre) {
		this.imagenNombre = imagenNombre;
	}

	public Long getImagenTamano() {
		return imagenTamano;
	}

	public void setImagenTamano(Long imagenTamano) {
		this.imagenTamano = imagenTamano;
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
}
