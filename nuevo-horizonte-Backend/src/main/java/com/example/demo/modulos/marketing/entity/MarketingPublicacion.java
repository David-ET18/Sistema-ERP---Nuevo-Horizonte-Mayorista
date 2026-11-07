package com.example.demo.modulos.marketing.entity;

import jakarta.persistence.Basic;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

/**
 * Historial de publicaciones enviadas por el modulo de difusion y marketing.
 * La imagen se guarda en la misma fila como bytea, igual que
 * catalogo.promocion, y se sirve por separado desde el controller.
 */
@Entity
@Table(name = "publicacion", schema = "marketing")
public class MarketingPublicacion {

	public enum Canal {
		TELEGRAM
	}

	public enum Estado {
		PUBLICADO,
		ERROR
	}

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id_publicacion")
	private Long id;

	@Column(name = "texto_original", nullable = false, columnDefinition = "text")
	private String textoOriginal;

	@Column(name = "texto_publicado", columnDefinition = "text")
	private String textoPublicado;

	@Enumerated(EnumType.STRING)
	@Column(name = "canal", nullable = false, length = 20)
	private Canal canal = Canal.TELEGRAM;

	@Enumerated(EnumType.STRING)
	@Column(name = "estado", nullable = false, length = 20)
	private Estado estado;

	@Column(name = "mensaje_error", columnDefinition = "text")
	private String mensajeError;

	@Basic(fetch = FetchType.LAZY)
	@Column(name = "imagen", columnDefinition = "bytea")
	private byte[] imagen;

	@Column(name = "imagen_content_type", length = 60)
	private String imagenContentType;

	@Column(name = "imagen_nombre", length = 200)
	private String imagenNombre;

	@Column(name = "imagen_tamano")
	private Long imagenTamano;

	@Column(name = "responsable_username", length = 50)
	private String responsableUsername;

	@Column(name = "responsable_nombre", length = 100)
	private String responsableNombre;

	@Column(name = "fecha_publicacion", nullable = false)
	private LocalDateTime fechaPublicacion = LocalDateTime.now();

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getTextoOriginal() {
		return textoOriginal;
	}

	public void setTextoOriginal(String textoOriginal) {
		this.textoOriginal = textoOriginal;
	}

	public String getTextoPublicado() {
		return textoPublicado;
	}

	public void setTextoPublicado(String textoPublicado) {
		this.textoPublicado = textoPublicado;
	}

	public Canal getCanal() {
		return canal;
	}

	public void setCanal(Canal canal) {
		this.canal = canal;
	}

	public Estado getEstado() {
		return estado;
	}

	public void setEstado(Estado estado) {
		this.estado = estado;
	}

	public String getMensajeError() {
		return mensajeError;
	}

	public void setMensajeError(String mensajeError) {
		this.mensajeError = mensajeError;
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

	public String getResponsableUsername() {
		return responsableUsername;
	}

	public void setResponsableUsername(String responsableUsername) {
		this.responsableUsername = responsableUsername;
	}

	public String getResponsableNombre() {
		return responsableNombre;
	}

	public void setResponsableNombre(String responsableNombre) {
		this.responsableNombre = responsableNombre;
	}

	public LocalDateTime getFechaPublicacion() {
		return fechaPublicacion;
	}

	public void setFechaPublicacion(LocalDateTime fechaPublicacion) {
		this.fechaPublicacion = fechaPublicacion;
	}
}
