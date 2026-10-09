package com.example.demo.modulos.tarifas.entity;

import com.example.demo.modulos.gestionUsuariosRolesPermisos.entity.Usuario;
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
import java.time.LocalDateTime;

/** Registra cada cambio de precio de una tarifa ("Historial de versiones" del Figma). */
@Entity
@Table(name = "tarifa_historial", schema = "catalogo")
public class TarifaHistorial {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id_historial")
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "id_tarifa", nullable = false)
	private Tarifa tarifa;

	@Column(name = "precio_anterior", precision = 10, scale = 2)
	private BigDecimal precioAnterior;

	@Column(name = "precio_nuevo", nullable = false, precision = 10, scale = 2)
	private BigDecimal precioNuevo;

	@Column(name = "fecha_cambio", nullable = false)
	private LocalDateTime fechaCambio = LocalDateTime.now();

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "id_usuario_cambio")
	private Usuario usuarioCambio;

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Tarifa getTarifa() {
		return tarifa;
	}

	public void setTarifa(Tarifa tarifa) {
		this.tarifa = tarifa;
	}

	public BigDecimal getPrecioAnterior() {
		return precioAnterior;
	}

	public void setPrecioAnterior(BigDecimal precioAnterior) {
		this.precioAnterior = precioAnterior;
	}

	public BigDecimal getPrecioNuevo() {
		return precioNuevo;
	}

	public void setPrecioNuevo(BigDecimal precioNuevo) {
		this.precioNuevo = precioNuevo;
	}

	public LocalDateTime getFechaCambio() {
		return fechaCambio;
	}

	public void setFechaCambio(LocalDateTime fechaCambio) {
		this.fechaCambio = fechaCambio;
	}

	public Usuario getUsuarioCambio() {
		return usuarioCambio;
	}

	public void setUsuarioCambio(Usuario usuarioCambio) {
		this.usuarioCambio = usuarioCambio;
	}
}
