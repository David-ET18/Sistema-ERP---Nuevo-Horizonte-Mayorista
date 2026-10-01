package com.example.demo.modulos.cotizaciones.entity;

import com.example.demo.modulos.gestionUsuariosRolesPermisos.entity.Usuario;
import com.example.demo.modulos.gestionAgencias.entity.Agencia;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
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
@Table(name = "cotizacion", schema = "ventas")
public class Cotizacion {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id_cotizacion")
	private Long id;

	@Column(name = "numero", nullable = false, unique = true, length = 20)
	private String numero;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "id_agencia", nullable = false)
	private Agencia agencia;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "id_asesor", nullable = false)
	private Usuario asesor;

	@Column(name = "fecha_creacion", nullable = false)
	private LocalDateTime fechaCreacion = LocalDateTime.now();

	@Column(name = "fecha_envio")
	private LocalDateTime fechaEnvio;

	@Column(name = "fecha_cierre")
	private LocalDateTime fechaCierre;

	@Column(name = "estado", nullable = false, length = 30)
	private String estado = "PENDIENTE";

	@Column(name = "fecha_viaje")
	private LocalDate fechaViaje;

	@Column(name = "servicios_adicionales", columnDefinition = "text")
	private String serviciosAdicionales;

	@Column(name = "margen_porcentaje", nullable = false, precision = 5, scale = 2)
	private BigDecimal margenPorcentaje = BigDecimal.ZERO;

	@OneToMany(mappedBy = "cotizacion", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<CotizacionDetalle> detalles = new ArrayList<>();

	@OneToMany(mappedBy = "cotizacion", cascade = CascadeType.ALL, orphanRemoval = true)
	@OrderBy("fechaCambio DESC")
	private List<CotizacionHistorialEstado> historial = new ArrayList<>();

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getNumero() {
		return numero;
	}

	public void setNumero(String numero) {
		this.numero = numero;
	}

	public Agencia getAgencia() {
		return agencia;
	}

	public void setAgencia(Agencia agencia) {
		this.agencia = agencia;
	}

	public Usuario getAsesor() {
		return asesor;
	}

	public void setAsesor(Usuario asesor) {
		this.asesor = asesor;
	}

	public LocalDateTime getFechaCreacion() {
		return fechaCreacion;
	}

	public void setFechaCreacion(LocalDateTime fechaCreacion) {
		this.fechaCreacion = fechaCreacion;
	}

	public LocalDateTime getFechaEnvio() {
		return fechaEnvio;
	}

	public void setFechaEnvio(LocalDateTime fechaEnvio) {
		this.fechaEnvio = fechaEnvio;
	}

	public LocalDateTime getFechaCierre() {
		return fechaCierre;
	}

	public void setFechaCierre(LocalDateTime fechaCierre) {
		this.fechaCierre = fechaCierre;
	}

	public String getEstado() {
		return estado;
	}

	public void setEstado(String estado) {
		this.estado = estado;
	}

	public LocalDate getFechaViaje() {
		return fechaViaje;
	}

	public void setFechaViaje(LocalDate fechaViaje) {
		this.fechaViaje = fechaViaje;
	}

	public String getServiciosAdicionales() {
		return serviciosAdicionales;
	}

	public void setServiciosAdicionales(String serviciosAdicionales) {
		this.serviciosAdicionales = serviciosAdicionales;
	}

	public BigDecimal getMargenPorcentaje() {
		return margenPorcentaje;
	}

	public void setMargenPorcentaje(BigDecimal margenPorcentaje) {
		this.margenPorcentaje = margenPorcentaje;
	}

	public List<CotizacionDetalle> getDetalles() {
		return detalles;
	}

	public void setDetalles(List<CotizacionDetalle> detalles) {
		this.detalles = detalles;
	}

	public List<CotizacionHistorialEstado> getHistorial() {
		return historial;
	}

	public void setHistorial(List<CotizacionHistorialEstado> historial) {
		this.historial = historial;
	}

	public void addDetalle(CotizacionDetalle detalle) {
		detalle.setCotizacion(this);
		this.detalles.add(detalle);
	}

	public void addHistorial(CotizacionHistorialEstado h) {
		h.setCotizacion(this);
		this.historial.add(h);
	}
}
