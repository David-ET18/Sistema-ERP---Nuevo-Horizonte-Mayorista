package com.example.demo.modulos.ventas.entity;

import com.example.demo.modulos.gestionAgencias.entity.Agencia;
import com.example.demo.modulos.cotizaciones.entity.Cotizacion;
import com.example.demo.modulos.paquetes.entity.Paquete;
import com.example.demo.modulos.tarifas.entity.Tarifa;
import com.example.demo.modulos.gestionUsuariosRolesPermisos.entity.Usuario;
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
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "venta", schema = "ventas")
public class Venta {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id_venta")
	private Long id;

	@Column(name = "numero", nullable = false, unique = true, length = 20)
	private String numero;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "id_cotizacion")
	private Cotizacion cotizacion;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "id_producto")
	private Paquete producto;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "id_tarifa")
	private Tarifa tarifa;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "id_agencia", nullable = false)
	private Agencia agencia;

	@Column(name = "id_detalle_pagos")
	private Long idDetallePagos;

	@Column(name = "monto_a_pagar", nullable = false, precision = 12, scale = 2)
	private BigDecimal montoAPagar = BigDecimal.ZERO;

	@Column(name = "comision", nullable = false, precision = 12, scale = 2)
	private BigDecimal comision = BigDecimal.ZERO;

	@Column(name = "igv", nullable = false, precision = 12, scale = 2)
	private BigDecimal igv = BigDecimal.ZERO;

	@Column(name = "notas_operativas", columnDefinition = "text")
	private String notasOperativas;

	@Column(name = "estado", nullable = false, length = 30)
	private String estado = "CONFIRMADA";

	@Column(name = "fecha_venta", nullable = false)
	private LocalDateTime fechaVenta = LocalDateTime.now();

	@Column(name = "fecha_culminada")
	private LocalDateTime fechaCulminada;

	@Column(name = "fecha_creacion", nullable = false)
	private LocalDateTime fechaCreacion = LocalDateTime.now();

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "id_usuario_registro")
	private Usuario usuarioRegistro;

	@OneToMany(mappedBy = "venta", cascade = CascadeType.ALL, orphanRemoval = true)
	@OrderBy("fechaCambio DESC")
	private List<VentaHistorialEstado> historial = new ArrayList<>();

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

	public Cotizacion getCotizacion() {
		return cotizacion;
	}

	public void setCotizacion(Cotizacion cotizacion) {
		this.cotizacion = cotizacion;
	}

	public Paquete getProducto() {
		return producto;
	}

	public void setProducto(Paquete producto) {
		this.producto = producto;
	}

	public Tarifa getTarifa() {
		return tarifa;
	}

	public void setTarifa(Tarifa tarifa) {
		this.tarifa = tarifa;
	}

	public Agencia getAgencia() {
		return agencia;
	}

	public void setAgencia(Agencia agencia) {
		this.agencia = agencia;
	}

	public Long getIdDetallePagos() {
		return idDetallePagos;
	}

	public void setIdDetallePagos(Long idDetallePagos) {
		this.idDetallePagos = idDetallePagos;
	}

	public BigDecimal getMontoAPagar() {
		return montoAPagar;
	}

	public void setMontoAPagar(BigDecimal montoAPagar) {
		this.montoAPagar = montoAPagar;
	}

	public BigDecimal getComision() {
		return comision;
	}

	public void setComision(BigDecimal comision) {
		this.comision = comision;
	}

	public BigDecimal getIgv() {
		return igv;
	}

	public void setIgv(BigDecimal igv) {
		this.igv = igv;
	}

	public String getNotasOperativas() {
		return notasOperativas;
	}

	public void setNotasOperativas(String notasOperativas) {
		this.notasOperativas = notasOperativas;
	}

	public String getEstado() {
		return estado;
	}

	public void setEstado(String estado) {
		this.estado = estado;
	}

	public LocalDateTime getFechaVenta() {
		return fechaVenta;
	}

	public void setFechaVenta(LocalDateTime fechaVenta) {
		this.fechaVenta = fechaVenta;
	}

	public LocalDateTime getFechaCulminada() {
		return fechaCulminada;
	}

	public void setFechaCulminada(LocalDateTime fechaCulminada) {
		this.fechaCulminada = fechaCulminada;
	}

	public LocalDateTime getFechaCreacion() {
		return fechaCreacion;
	}

	public void setFechaCreacion(LocalDateTime fechaCreacion) {
		this.fechaCreacion = fechaCreacion;
	}

	public Usuario getUsuarioRegistro() {
		return usuarioRegistro;
	}

	public void setUsuarioRegistro(Usuario usuarioRegistro) {
		this.usuarioRegistro = usuarioRegistro;
	}

	public List<VentaHistorialEstado> getHistorial() {
		return historial;
	}

	public void setHistorial(List<VentaHistorialEstado> historial) {
		this.historial = historial;
	}

	public void addHistorial(VentaHistorialEstado h) {
		h.setVenta(this);
		this.historial.add(h);
	}
}
