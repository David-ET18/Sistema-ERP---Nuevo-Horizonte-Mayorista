package com.example.demo.modulos.paquetes.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.CollectionTable;
import com.example.demo.modulos.catalogo.entity.Destino;
import jakarta.persistence.ElementCollection;
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
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "paquete", schema = "catalogo")
public class Paquete {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id_paquete")
	private Long id;

	/** Titulo del paquete. */
	@Column(name = "nombre", nullable = false, unique = true, length = 100)
	private String nombre;

	/** Resumen atractivo para la tarjeta (campo "Informacion del destino" del form). */
	@Column(name = "descripcion", columnDefinition = "text")
	private String descripcion;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "id_destino", nullable = false)
	private Destino destino;

	@Column(name = "fecha_inicio_viaje")
	private LocalDate fechaInicioViaje;

	@Column(name = "fecha_fin_viaje")
	private LocalDate fechaFinViaje;

	@Column(name = "fecha_cierre_venta")
	private LocalDate fechaCierreVenta;

	/** Catalogo sugerido, no restringido (ver PaqueteRepository.findCategorias). */
	@Column(name = "categoria", length = 50)
	private String categoria;

	@Column(name = "moneda", length = 3)
	private String moneda = "PEN";

	@Column(name = "precio_desde", precision = 10, scale = 2)
	private BigDecimal precioDesde;

	/** Texto libre, ej. "5 Dias / 4 Noches". */
	@Column(name = "duracion_texto", length = 50)
	private String duracionTexto;

	@Column(name = "destacado", nullable = false)
	private boolean destacado = false;

	/** ACTIVO (publicado) | INACTIVO | BORRADOR. */
	@Column(name = "estado", nullable = false, length = 20)
	private String estado = "BORRADOR";

	@Column(name = "fecha_creacion", nullable = false)
	private LocalDateTime fechaCreacion = LocalDateTime.now();

	@Column(name = "fecha_actualizacion", nullable = false)
	private LocalDateTime fechaActualizacion = LocalDateTime.now();

	/** Aerolineas aliadas marcadas en el formulario (panel "Aliados"). */
	@ElementCollection
	@CollectionTable(name = "paquete_aliado", schema = "catalogo", joinColumns = @JoinColumn(name = "id_paquete"))
	@Column(name = "aerolinea", length = 100)
	private Set<String> aliados = new LinkedHashSet<>();

	@OneToMany(mappedBy = "paquete", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
	@OrderBy("orden asc")
	private List<PaqueteVuelo> vuelos = new ArrayList<>();

	@OneToMany(mappedBy = "paquete", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
	@OrderBy("orden asc")
	private List<PaqueteOpcion> opciones = new ArrayList<>();

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

	public Destino getDestino() {
		return destino;
	}

	public void setDestino(Destino destino) {
		this.destino = destino;
	}

	public LocalDate getFechaInicioViaje() {
		return fechaInicioViaje;
	}

	public void setFechaInicioViaje(LocalDate fechaInicioViaje) {
		this.fechaInicioViaje = fechaInicioViaje;
	}

	public LocalDate getFechaFinViaje() {
		return fechaFinViaje;
	}

	public void setFechaFinViaje(LocalDate fechaFinViaje) {
		this.fechaFinViaje = fechaFinViaje;
	}

	public LocalDate getFechaCierreVenta() {
		return fechaCierreVenta;
	}

	public void setFechaCierreVenta(LocalDate fechaCierreVenta) {
		this.fechaCierreVenta = fechaCierreVenta;
	}

	public String getCategoria() {
		return categoria;
	}

	public void setCategoria(String categoria) {
		this.categoria = categoria;
	}

	public String getMoneda() {
		return moneda;
	}

	public void setMoneda(String moneda) {
		this.moneda = moneda;
	}

	public BigDecimal getPrecioDesde() {
		return precioDesde;
	}

	public void setPrecioDesde(BigDecimal precioDesde) {
		this.precioDesde = precioDesde;
	}

	public String getDuracionTexto() {
		return duracionTexto;
	}

	public void setDuracionTexto(String duracionTexto) {
		this.duracionTexto = duracionTexto;
	}

	public boolean isDestacado() {
		return destacado;
	}

	public void setDestacado(boolean destacado) {
		this.destacado = destacado;
	}

	public String getEstado() {
		return estado;
	}

	public void setEstado(String estado) {
		this.estado = estado;
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

	public Set<String> getAliados() {
		return aliados;
	}

	public void setAliados(Set<String> aliados) {
		this.aliados = aliados;
	}

	public List<PaqueteVuelo> getVuelos() {
		return vuelos;
	}

	public List<PaqueteOpcion> getOpciones() {
		return opciones;
	}
}
