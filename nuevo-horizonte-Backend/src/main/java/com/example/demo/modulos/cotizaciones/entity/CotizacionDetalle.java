package com.example.demo.modulos.cotizaciones.entity;

import jakarta.persistence.Column;
import com.example.demo.modulos.tarifas.entity.Tarifa;
import com.example.demo.modulos.paquetes.entity.Paquete;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.math.BigDecimal;

@Entity
@Table(name = "cotizacion_detalle", schema = "ventas")
public class CotizacionDetalle {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id_detalle")
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "id_cotizacion", nullable = false)
	private Cotizacion cotizacion;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "id_tarifa", nullable = false)
	private Tarifa tarifa;

	@Column(name = "precio_unitario", nullable = false, precision = 10, scale = 2)
	private BigDecimal precioUnitario;

	@Column(name = "cantidad_pax", nullable = false)
	private Integer cantidadPax;

	@Column(name = "id_promocion")
	private Long idPromocion;

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Cotizacion getCotizacion() {
		return cotizacion;
	}

	public void setCotizacion(Cotizacion cotizacion) {
		this.cotizacion = cotizacion;
	}

	public Tarifa getTarifa() {
		return tarifa;
	}

	public void setTarifa(Tarifa tarifa) {
		this.tarifa = tarifa;
	}

	public BigDecimal getPrecioUnitario() {
		return precioUnitario;
	}

	public void setPrecioUnitario(BigDecimal precioUnitario) {
		this.precioUnitario = precioUnitario;
	}

	public Integer getCantidadPax() {
		return cantidadPax;
	}

	public void setCantidadPax(Integer cantidadPax) {
		this.cantidadPax = cantidadPax;
	}

	public Long getIdPromocion() {
		return idPromocion;
	}

	public void setIdPromocion(Long idPromocion) {
		this.idPromocion = idPromocion;
	}
}
