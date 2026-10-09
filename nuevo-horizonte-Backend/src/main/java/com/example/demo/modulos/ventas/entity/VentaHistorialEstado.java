package com.example.demo.modulos.ventas.entity;

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

import java.time.LocalDateTime;

@Entity
@Table(name = "venta_historial_estado", schema = "ventas")
public class VentaHistorialEstado {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id_historial")
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "id_venta", nullable = false)
	private Venta venta;

	@Column(name = "estado_anterior", length = 30)
	private String estadoAnterior;

	@Column(name = "estado_nuevo", nullable = false, length = 30)
	private String estadoNuevo;

	@Column(name = "fecha_cambio", nullable = false)
	private LocalDateTime fechaCambio = LocalDateTime.now();

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "id_usuario_cambio", nullable = false)
	private Usuario usuarioCambio;

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Venta getVenta() {
		return venta;
	}

	public void setVenta(Venta venta) {
		this.venta = venta;
	}

	public String getEstadoAnterior() {
		return estadoAnterior;
	}

	public void setEstadoAnterior(String estadoAnterior) {
		this.estadoAnterior = estadoAnterior;
	}

	public String getEstadoNuevo() {
		return estadoNuevo;
	}

	public void setEstadoNuevo(String estadoNuevo) {
		this.estadoNuevo = estadoNuevo;
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
