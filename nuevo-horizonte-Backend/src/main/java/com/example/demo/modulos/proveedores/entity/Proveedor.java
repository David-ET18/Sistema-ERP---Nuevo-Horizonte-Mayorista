package com.example.demo.modulos.proveedores.entity;

import jakarta.persistence.Column;
import com.example.demo.modulos.catalogo.entity.Destino;
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
@Table(name = "proveedor", schema = "catalogo")
public class Proveedor {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id_proveedor")
	private Long id;

	@Column(name = "razon_social", nullable = false, length = 200)
	private String razonSocial;

	@Column(name = "nombre_comercial", length = 200)
	private String nombreComercial;

	@Column(name = "ruc", nullable = false, unique = true, length = 11)
	private String ruc;

	@Column(name = "tipo_proveedor", length = 50)
	private String tipoProveedor;

	@Column(name = "contacto_nombre", length = 100)
	private String contactoNombre;

	@Column(name = "contacto_telefono", length = 20)
	private String contactoTelefono;

	@Column(name = "contacto_email", length = 100)
	private String contactoEmail;

	/**
	 * Destino principal del proveedor. Es informativo: las tarifas que ofrece
	 * pueden cubrir otros destinos, pero este es el que se usa para filtrar
	 * en el listado antes de que existan tarifas cargadas.
	 */
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "id_destino")
	private Destino destino;

	/**
	 * Catalogo controlado (ver ProveedorMapper.CONDICIONES_COMERCIALES).
	 */
	@Column(name = "condiciones_comerciales", length = 50)
	private String condicionesComerciales;

	@Column(name = "observaciones", columnDefinition = "text")
	private String observaciones;

	@Column(name = "activo", nullable = false)
	private boolean activo = true;

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

	public String getRazonSocial() {
		return razonSocial;
	}

	public void setRazonSocial(String razonSocial) {
		this.razonSocial = razonSocial;
	}

	public String getNombreComercial() {
		return nombreComercial;
	}

	public void setNombreComercial(String nombreComercial) {
		this.nombreComercial = nombreComercial;
	}

	public String getRuc() {
		return ruc;
	}

	public void setRuc(String ruc) {
		this.ruc = ruc;
	}

	public String getTipoProveedor() {
		return tipoProveedor;
	}

	public void setTipoProveedor(String tipoProveedor) {
		this.tipoProveedor = tipoProveedor;
	}

	public String getContactoNombre() {
		return contactoNombre;
	}

	public void setContactoNombre(String contactoNombre) {
		this.contactoNombre = contactoNombre;
	}

	public String getContactoTelefono() {
		return contactoTelefono;
	}

	public void setContactoTelefono(String contactoTelefono) {
		this.contactoTelefono = contactoTelefono;
	}

	public String getContactoEmail() {
		return contactoEmail;
	}

	public void setContactoEmail(String contactoEmail) {
		this.contactoEmail = contactoEmail;
	}

	public Destino getDestino() {
		return destino;
	}

	public void setDestino(Destino destino) {
		this.destino = destino;
	}

	public String getCondicionesComerciales() {
		return condicionesComerciales;
	}

	public void setCondicionesComerciales(String condicionesComerciales) {
		this.condicionesComerciales = condicionesComerciales;
	}

	public String getObservaciones() {
		return observaciones;
	}

	public void setObservaciones(String observaciones) {
		this.observaciones = observaciones;
	}

	public boolean isActivo() {
		return activo;
	}

	public void setActivo(boolean activo) {
		this.activo = activo;
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
