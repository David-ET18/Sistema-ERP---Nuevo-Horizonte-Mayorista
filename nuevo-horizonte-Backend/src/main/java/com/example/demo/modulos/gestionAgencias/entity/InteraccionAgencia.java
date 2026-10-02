package com.example.demo.modulos.gestionAgencias.entity;

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

/**
 * Bitacora de interacciones con una agencia (llamadas, correos, reuniones,
 * notas). Es el modelo INTERACCION_AGENCIA del diseno. Este modulo
 * (gestionAgencias) solo LEE esta tabla para mostrar el panel "Notas de
 * seguimiento" de la ficha 360; crearlas/editarlas es responsabilidad del
 * modulo "Seguimiento Comercial" (ModuloCatalogo.SEGUIMIENTO_COMERCIAL).
 */
@Entity
@Table(name = "interaccion_agencia", schema = "ventas")
public class InteraccionAgencia {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id_interaccion")
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "id_agencia", nullable = false)
	private Agencia agencia;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "id_usuario_registro")
	private Usuario usuarioRegistro;

	/** LLAMADA | EMAIL | REUNION | NOTA. */
	@Column(name = "tipo", nullable = false, length = 50)
	private String tipo;

	@Column(name = "notas", columnDefinition = "text")
	private String notas;

	@Column(name = "fecha", nullable = false)
	private LocalDateTime fecha = LocalDateTime.now();

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Agencia getAgencia() {
		return agencia;
	}

	public void setAgencia(Agencia agencia) {
		this.agencia = agencia;
	}

	public Usuario getUsuarioRegistro() {
		return usuarioRegistro;
	}

	public void setUsuarioRegistro(Usuario usuarioRegistro) {
		this.usuarioRegistro = usuarioRegistro;
	}

	public String getTipo() {
		return tipo;
	}

	public void setTipo(String tipo) {
		this.tipo = tipo;
	}

	public String getNotas() {
		return notas;
	}

	public void setNotas(String notas) {
		this.notas = notas;
	}

	public LocalDateTime getFecha() {
		return fecha;
	}

	public void setFecha(LocalDateTime fecha) {
		this.fecha = fecha;
	}
}
