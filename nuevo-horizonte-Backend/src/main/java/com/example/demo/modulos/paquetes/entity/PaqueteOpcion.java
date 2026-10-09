package com.example.demo.modulos.paquetes.entity;

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

/**
 * Una fila de la tabla "Opciones y Tarifas": un hotel/servicio del paquete,
 * su vigencia y el precio segun el tipo de ocupacion de la habitacion.
 */
@Entity
@Table(name = "paquete_opcion", schema = "catalogo")
public class PaqueteOpcion {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id_paquete_opcion")
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "id_paquete", nullable = false)
	private Paquete paquete;

	@Column(name = "hotel_servicio", nullable = false, length = 150)
	private String hotelServicio;

	@Column(name = "fecha_desde", nullable = false)
	private LocalDate fechaDesde;

	@Column(name = "fecha_hasta", nullable = false)
	private LocalDate fechaHasta;

	/**
	 * Catalogo controlado (ver PaqueteMapper.OPCIONES_INCLUYE).
	 */
	@Column(name = "incluye", length = 50)
	private String incluye;

	@Column(name = "precio_simple", nullable = false, precision = 10, scale = 2)
	private BigDecimal precioSimple = BigDecimal.ZERO;

	@Column(name = "precio_doble", nullable = false, precision = 10, scale = 2)
	private BigDecimal precioDoble = BigDecimal.ZERO;

	@Column(name = "precio_triple", nullable = false, precision = 10, scale = 2)
	private BigDecimal precioTriple = BigDecimal.ZERO;

	@Column(name = "precio_nino", nullable = false, precision = 10, scale = 2)
	private BigDecimal precioNino = BigDecimal.ZERO;

	@Column(name = "orden", nullable = false)
	private int orden;

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Paquete getPaquete() {
		return paquete;
	}

	public void setPaquete(Paquete paquete) {
		this.paquete = paquete;
	}

	public String getHotelServicio() {
		return hotelServicio;
	}

	public void setHotelServicio(String hotelServicio) {
		this.hotelServicio = hotelServicio;
	}

	public LocalDate getFechaDesde() {
		return fechaDesde;
	}

	public void setFechaDesde(LocalDate fechaDesde) {
		this.fechaDesde = fechaDesde;
	}

	public LocalDate getFechaHasta() {
		return fechaHasta;
	}

	public void setFechaHasta(LocalDate fechaHasta) {
		this.fechaHasta = fechaHasta;
	}

	public String getIncluye() {
		return incluye;
	}

	public void setIncluye(String incluye) {
		this.incluye = incluye;
	}

	public BigDecimal getPrecioSimple() {
		return precioSimple;
	}

	public void setPrecioSimple(BigDecimal precioSimple) {
		this.precioSimple = precioSimple;
	}

	public BigDecimal getPrecioDoble() {
		return precioDoble;
	}

	public void setPrecioDoble(BigDecimal precioDoble) {
		this.precioDoble = precioDoble;
	}

	public BigDecimal getPrecioTriple() {
		return precioTriple;
	}

	public void setPrecioTriple(BigDecimal precioTriple) {
		this.precioTriple = precioTriple;
	}

	public BigDecimal getPrecioNino() {
		return precioNino;
	}

	public void setPrecioNino(BigDecimal precioNino) {
		this.precioNino = precioNino;
	}

	public int getOrden() {
		return orden;
	}

	public void setOrden(int orden) {
		this.orden = orden;
	}
}
