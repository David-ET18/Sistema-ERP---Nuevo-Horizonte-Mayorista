package com.example.demo.modulos.promociones.mapper;

import com.example.demo.modulos.promociones.dto.PromocionDTO;
import com.example.demo.modulos.promociones.entity.Promocion;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneOffset;

public final class PromocionMapper {

	public static final String ESTADO_VIGENTE = "VIGENTE";
	public static final String ESTADO_PROGRAMADA = "PROGRAMADA";
	public static final String ESTADO_VENCIDA = "VENCIDA";
	public static final String ESTADO_INACTIVA = "INACTIVA";

	private PromocionMapper() {
	}

	public static PromocionDTO toDTO(Promocion promocion) {
		var servicio = promocion.getServicio();
		return new PromocionDTO(
				promocion.getId(),
				promocion.getTitulo(),
				promocion.getDescripcion(),
				promocion.getDescuento(),
				promocion.getFechaInicio(),
				promocion.getFechaFin(),
				promocion.isActivo(),
				promocion.isDestacada(),
				servicio == null ? null : servicio.getId(),
				servicio == null ? null : servicio.getNombre(),
				servicio == null ? null : servicio.getCategoria(),
				imagenUrl(promocion),
				promocion.getImagenNombre(),
				estado(promocion),
				promocion.getFechaCreacion(),
				promocion.getFechaActualizacion());
	}

	public static String estado(Promocion promocion) {
		if (!promocion.isActivo()) {
			return ESTADO_INACTIVA;
		}
		LocalDate hoy = LocalDate.now();
		if (promocion.getFechaInicio() != null && hoy.isBefore(promocion.getFechaInicio())) {
			return ESTADO_PROGRAMADA;
		}
		if (promocion.getFechaFin() != null && hoy.isAfter(promocion.getFechaFin())) {
			return ESTADO_VENCIDA;
		}
		return ESTADO_VIGENTE;
	}

	private static String imagenUrl(Promocion promocion) {
		if (promocion.getImagen() == null || promocion.getImagen().length == 0) {
			return null;
		}
		LocalDateTime versionFecha = promocion.getFechaActualizacion() != null
				? promocion.getFechaActualizacion()
				: promocion.getFechaCreacion();
		long version = versionFecha == null ? 0 : versionFecha.toEpochSecond(ZoneOffset.UTC);
		return "/promociones/" + promocion.getId() + "/imagen?v=" + version;
	}
}
