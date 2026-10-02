package com.example.demo.modulos.tarifas.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import com.example.demo.modulos.catalogo.entity.Servicio;
import com.example.demo.modulos.catalogo.entity.Destino;
import com.example.demo.modulos.proveedores.entity.Proveedor;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "tarifa", schema = "catalogo")
public class Tarifa {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id_tarifa")
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "id_proveedor", nullable = false)
	private Proveedor proveedor;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "id_servicio", nullable = false)
	private Servicio servicio;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "id_destino", nullable = false)
	private Destino destino;

	/** Catalogo sugerido, no restringido (ver TarifaRepository.findTiposTarifa). */
	@Column(name = "tipo_tarifa", length = 50)
	private String tipoTarifa;

	@Column(name = "precio", nullable = false, precision = 10, scale = 2)
	private BigDecimal precio;

	@Column(name = "moneda", nullable = false, length = 3)
	private String moneda = "PEN";

	@Column(name = "fecha_desde", nullable = false)
	private LocalDate fechaDesde;

	@Column(name = "fecha_hasta", nullable = false)
	private LocalDate fechaHasta;

	@Column(name = "condiciones", columnDefinition = "text")
	private String condiciones;

	@Column(name = "observaciones", columnDefinition = "text")
	private String observaciones;

	@Column(name = "archivo_respaldo_url", length = 300)
	private String archivoRespaldoUrl;

	@Column(name = "fecha_creacion", nullable = false)
	private LocalDateTime fechaCreacion = LocalDateTime.now();

	@Column(name = "fecha_actualizacion", nullable = false)
	private LocalDateTime fechaActualizacion = LocalDateTime.now();

	@OneToMany(mappedBy = "tarifa", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
	@OrderBy("fechaCambio desc")
	private List<TarifaHistorial> historial = new ArrayList<>();

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Proveedor getProveedor() {
		return proveedor;
	}

	public void setProveedor(Proveedor proveedor) {
		this.proveedor = proveedor;
	}

	public Servicio getServicio() {
		return servicio;
	}

	public void setServicio(Servicio servicio) {
		this.servicio = servicio;
	}

	public Destino getDestino() {
		return destino;
	}

	public void setDestino(Destino destino) {
		this.destino = destino;
	}

	public String getTipoTarifa() {
		return tipoTarifa;
	}

	public void setTipoTarifa(String tipoTarifa) {
		this.tipoTarifa = tipoTarifa;
	}

	public BigDecimal getPrecio() {
		return precio;
	}

	public void setPrecio(BigDecimal precio) {
		this.precio = precio;
	}

	public String getMoneda() {
		return moneda;
	}

	public void setMoneda(String moneda) {
		this.moneda = moneda;
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

	public String getCondiciones() {
		return condiciones;
	}

	public void setCondiciones(String condiciones) {
		this.condiciones = condiciones;
	}

	public String getObservaciones() {
		return observaciones;
	}

	public void setObservaciones(String observaciones) {
		this.observaciones = observaciones;
	}

	public String getArchivoRespaldoUrl() {
		return archivoRespaldoUrl;
	}

	public void setArchivoRespaldoUrl(String archivoRespaldoUrl) {
		this.archivoRespaldoUrl = archivoRespaldoUrl;
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

	public List<TarifaHistorial> getHistorial() {
		return historial;
	}
}
