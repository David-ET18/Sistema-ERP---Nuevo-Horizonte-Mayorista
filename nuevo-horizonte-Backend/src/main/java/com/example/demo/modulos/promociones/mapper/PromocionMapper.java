package com.example.demo.modulos.promociones.mapper;

import com.example.demo.modulos.catalogo.entity.Servicio;
import com.example.demo.modulos.promociones.dto.PromocionDTO;
import com.example.demo.modulos.promociones.dto.PromocionRequest;
import com.example.demo.modulos.promociones.entity.Promocion;
import com.example.demo.util.Textos;

import java.time.LocalDate;
import java.time.LocalDateTime;

public final class PromocionMapper {

	private PromocionMapper() {
	}

	public static PromocionDTO toDTO(Promocion promocion) {
		Servicio servicio = promocion.getServicio();
		return new PromocionDTO(
				promocion.getId(),
				promocion.getNombre(),
				promocion.getDescripcion(),
				promocion.getDescuentoPorcentaje(),
				promocion.getPrecioOriginal(),
				promocion.getPrecioPromocional(),
				promocion.getFechaInicio(),
				promocion.getFechaFin(),
				promocion.isDestacada(),
				promocion.isActiva(),
				servicio == null ? null : servicio.getId(),
				servicio == null ? null : servicio.getNombre(),
				promocion.getImagen() != null && promocion.getImagen().length > 0,
				estadoVigencia(promocion, LocalDate.now()),
				promocion.getFechaCreacion(),
				promocion.getFechaActualizacion());
	}

	public static String estadoVigencia(Promocion promocion, LocalDate hoy) {
		if (!promocion.isActiva()) {
			return "INACTIVA";
		}
		if (promocion.getFechaInicio() != null && promocion.getFechaInicio().isAfter(hoy)) {
			return "PROGRAMADA";
		}
		if (promocion.getFechaFin() != null && promocion.getFechaFin().isBefore(hoy)) {
			return "VENCIDA";
		}
		return "VIGENTE";
	}

	public static void aplicar(Promocion promocion, PromocionRequest request, Servicio servicio) {
		promocion.setNombre(Textos.sinEspacios(request.getNombre()));
		promocion.setDescripcion(Textos.sinEspacios(request.getDescripcion()));
		promocion.setServicio(servicio);
		promocion.setDescuentoPorcentaje(request.getDescuentoPorcentaje());
		promocion.setPrecioOriginal(request.getPrecioOriginal());
		promocion.setPrecioPromocional(request.getPrecioPromocional());
		promocion.setFechaInicio(request.getFechaInicio());
		promocion.setFechaFin(request.getFechaFin());
		if (request.getDestacada() != null) {
			promocion.setDestacada(request.getDestacada());
		}
		if (request.getActiva() != null) {
			promocion.setActiva(request.getActiva());
		}
		promocion.setFechaActualizacion(LocalDateTime.now());
	}
}
