package com.example.demo.modulos.gestionAgencias.mapper;

import java.time.LocalDateTime;

import com.example.demo.modulos.gestionAgencias.dto.AgenciaDetalleDTO;
import com.example.demo.modulos.gestionAgencias.dto.AgenciaDTO;
import com.example.demo.modulos.gestionAgencias.dto.AgenciaListaDTO;
import com.example.demo.modulos.gestionAgencias.dto.AgenciaRequest;
import com.example.demo.modulos.gestionAgencias.entity.Agencia;
import com.example.demo.util.Textos;

public final class AgenciaMapper {

	private AgenciaMapper() {
	}

	/**
	 * Nombre a mostrar: nombre comercial si existe, si no la razon social.
	 */
	public static String nombre(Agencia agencia) {
		if (agencia == null) {
			return null;
		}
		return Textos.primeroConContenido(agencia.getNombreComercial(), agencia.getRazonSocial());
	}

	/**
	 * Version resumida que consumen otros modulos (cotizaciones, ventas).
	 */
	public static AgenciaDTO toRefDTO(Agencia agencia) {
		return new AgenciaDTO(
				agencia.getId(),
				agencia.getRazonSocial(),
				agencia.getNombreComercial(),
				nombre(agencia),
				agencia.getRuc(),
				agencia.isActivo());
	}

	public static AgenciaListaDTO toListaDTO(Agencia agencia) {
		return new AgenciaListaDTO(
				agencia.getId(),
				agencia.getRazonSocial(),
				agencia.getNombreComercial(),
				agencia.getRuc(),
				agencia.getCategoria(),
				agencia.getContactoNombre(),
				agencia.getContactoEmail(),
				agencia.getLogoUrl(),
				agencia.isEsPrioritaria(),
				agencia.isActivo(),
				agencia.getFechaCreacion());
	}

	public static AgenciaDetalleDTO toDetalleDTO(Agencia agencia) {
		return new AgenciaDetalleDTO(
				agencia.getId(),
				agencia.getRazonSocial(),
				agencia.getNombreComercial(),
				agencia.getRuc(),
				agencia.getCategoria(),
				agencia.getContactoNombre(),
				agencia.getContactoTelefono(),
				agencia.getContactoEmail(),
				agencia.getCiudad(),
				agencia.getEjecutivoAsignado(),
				agencia.getLogoUrl(),
				agencia.isEsPrioritaria(),
				agencia.isActivo(),
				agencia.getFechaCreacion());
	}

	/**
	 * Proyecta un request sobre la entidad. Los campos booleanos solo se sobrescriben
	 * cuando vienen informados, para no perder el valor actual en una edicion parcial.
	 */
	public static void aplicar(Agencia agencia, AgenciaRequest request) {
		agencia.setRazonSocial(Textos.sinEspacios(request.razonSocial()));
		agencia.setNombreComercial(Textos.sinEspacios(request.nombreComercial()));
		agencia.setRuc(Textos.sinEspacios(request.ruc()));
		agencia.setCategoria(Textos.sinEspacios(request.categoria()));
		agencia.setContactoNombre(Textos.sinEspacios(request.contactoNombre()));
		agencia.setContactoTelefono(Textos.sinEspacios(request.contactoTelefono()));
		agencia.setContactoEmail(Textos.sinEspacios(request.contactoEmail()));
		agencia.setCiudad(Textos.sinEspacios(request.ciudad()));
		agencia.setEjecutivoAsignado(Textos.sinEspacios(request.ejecutivoAsignado()));
		if (request.esPrioritaria() != null) {
			agencia.setEsPrioritaria(request.esPrioritaria());
		}
		if (request.activo() != null) {
			agencia.setActivo(request.activo());
		}
		if (agencia.getId() == null) {
			agencia.setFechaCreacion(LocalDateTime.now());
		}
	}
}
