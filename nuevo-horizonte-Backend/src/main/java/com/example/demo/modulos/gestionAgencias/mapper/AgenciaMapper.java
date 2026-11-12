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

	public static String nombre(Agencia agencia) {
		if (agencia == null) {
			return null;
		}
		return Textos.primeroConContenido(agencia.getNombreComercial(), agencia.getRazonSocial());
	}

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
		// Corregido: se incluye "gestion-agencias" en la ruta
		String logoUrl = (agencia.getLogo() != null) ? "/api/gestion-agencias/" + agencia.getId() + "/logo" : null;

		return new AgenciaListaDTO(
				agencia.getId(),
				agencia.getRazonSocial(),
				agencia.getNombreComercial(),
				agencia.getRuc(),
				agencia.getCategoria(),
				agencia.getContactoNombre(),
				agencia.getContactoEmail(),
				logoUrl,
				agencia.isEsPrioritaria(),
				agencia.isActivo(),
				agencia.getFechaCreacion());
	}

	public static AgenciaDetalleDTO toDetalleDTO(Agencia agencia) {
		// Corregido: se incluye "gestion-agencias" en la ruta
		String logoUrl = (agencia.getLogo() != null) ? "/api/gestion-agencias/" + agencia.getId() + "/logo" : null;

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
				logoUrl,
				agencia.isEsPrioritaria(),
				agencia.isActivo(),
				agencia.getFechaCreacion());
	}

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