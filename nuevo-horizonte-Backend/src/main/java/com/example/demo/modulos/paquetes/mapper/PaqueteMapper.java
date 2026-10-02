package com.example.demo.modulos.paquetes.mapper;

import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.List;

import com.example.demo.modulos.catalogo.entity.Destino;
import com.example.demo.modulos.paquetes.dto.KpiPaquetesDTO;
import com.example.demo.modulos.paquetes.dto.PaqueteDTO;
import com.example.demo.modulos.paquetes.dto.PaqueteDetalleDTO;
import com.example.demo.modulos.paquetes.dto.PaqueteListaDTO;
import com.example.demo.modulos.paquetes.dto.PaqueteOpcionDTO;
import com.example.demo.modulos.paquetes.dto.PaqueteOpcionRequest;
import com.example.demo.modulos.paquetes.dto.PaqueteRequest;
import com.example.demo.modulos.paquetes.dto.PaqueteVueloDTO;
import com.example.demo.modulos.paquetes.dto.PaqueteVueloRequest;
import com.example.demo.modulos.paquetes.entity.Paquete;
import com.example.demo.modulos.paquetes.entity.PaqueteOpcion;
import com.example.demo.modulos.paquetes.entity.PaqueteVuelo;
import com.example.demo.util.Textos;

public final class PaqueteMapper {

	/** Catalogo controlado del select "Incluye" de las opciones de hotel/servicio. */
	public static final List<String> OPCIONES_INCLUYE = List.of(
			"Solo habitacion",
			"Desayuno incluido",
			"Media pension",
			"Pension completa",
			"Todo incluido");

	/** Catalogo sugerido de aerolineas aliadas (panel "Aliados" del formulario). */
	public static final List<String> AEROLINEAS_SUGERIDAS = List.of(
			"JETSMART", "ARAJET", "COPA AIRLINES", "LATAM AIRLINES", "SKY AIRLINE", "AVIANCA");

	public static final List<String> MONEDAS = List.of("PEN", "USD", "EUR");

	private PaqueteMapper() {
	}

	/** Version resumida que consumen otros modulos (ventas, cotizaciones). */
	public static PaqueteDTO toDTO(Paquete paquete) {
		return new PaqueteDTO(
				paquete.getId(),
				paquete.getNombre(),
				paquete.getDestino() != null ? paquete.getDestino().getNombre() : null);
	}

	public static PaqueteListaDTO toListaDTO(Paquete paquete) {
		Destino destino = paquete.getDestino();
		return new PaqueteListaDTO(
				paquete.getId(),
				paquete.getNombre(),
				destino == null ? null : destino.getNombre(),
				paquete.getCategoria(),
				paquete.getDuracionTexto(),
				paquete.getMoneda(),
				paquete.getPrecioDesde(),
				paquete.getEstado(),
				paquete.isDestacado(),
				paquete.getFechaActualizacion());
	}

	public static PaqueteDetalleDTO toDetalleDTO(Paquete paquete) {
		Destino destino = paquete.getDestino();
		return new PaqueteDetalleDTO(
				paquete.getId(),
				paquete.getNombre(),
				paquete.getDescripcion(),
				destino == null ? null : destino.getId(),
				destino == null ? null : destino.getNombre(),
				paquete.getFechaInicioViaje(),
				paquete.getFechaFinViaje(),
				paquete.getFechaCierreVenta(),
				paquete.getCategoria(),
				paquete.getMoneda(),
				paquete.getPrecioDesde(),
				paquete.getDuracionTexto(),
				paquete.isDestacado(),
				paquete.getEstado(),
				paquete.getAliados(),
				paquete.getVuelos().stream().map(PaqueteMapper::toVueloDTO).toList(),
				paquete.getOpciones().stream().map(PaqueteMapper::toOpcionDTO).toList(),
				paquete.getFechaCreacion(),
				paquete.getFechaActualizacion());
	}

	public static PaqueteVueloDTO toVueloDTO(PaqueteVuelo vuelo) {
		return new PaqueteVueloDTO(
				vuelo.getId(),
				vuelo.getAerolinea(),
				vuelo.getOrigen(),
				vuelo.getDestino(),
				vuelo.getFechaSalida(),
				vuelo.getFechaLlegada());
	}

	public static PaqueteOpcionDTO toOpcionDTO(PaqueteOpcion opcion) {
		return new PaqueteOpcionDTO(
				opcion.getId(),
				opcion.getHotelServicio(),
				opcion.getFechaDesde(),
				opcion.getFechaHasta(),
				opcion.getIncluye(),
				opcion.getPrecioSimple(),
				opcion.getPrecioDoble(),
				opcion.getPrecioTriple(),
				opcion.getPrecioNino());
	}

	/**
	 * Proyecta un request sobre la entidad (campos simples + destino, ya resuelto).
	 * Los hijos (vuelos, opciones) se sincronizan aparte en el service porque
	 * requieren orphanRemoval sobre la coleccion ya persistida.
	 */
	public static void aplicar(Paquete paquete, PaqueteRequest request, Destino destino) {
		paquete.setNombre(Textos.sinEspacios(request.nombre()));
		paquete.setDescripcion(Textos.sinEspacios(request.descripcion()));
		paquete.setDestino(destino);
		paquete.setFechaInicioViaje(request.fechaInicioViaje());
		paquete.setFechaFinViaje(request.fechaFinViaje());
		paquete.setFechaCierreVenta(request.fechaCierreVenta());
		paquete.setCategoria(Textos.sinEspacios(request.categoria()));
		paquete.setMoneda(request.moneda() == null || request.moneda().isBlank() ? "PEN" : request.moneda());
		paquete.setPrecioDesde(request.precioDesde());
		paquete.setDuracionTexto(Textos.sinEspacios(request.duracionTexto()));
		if (request.destacado() != null) {
			paquete.setDestacado(request.destacado());
		}
		paquete.setEstado(request.estado());
		paquete.setAliados(request.aliados() == null ? new LinkedHashSet<>() : new LinkedHashSet<>(request.aliados()));

		LocalDateTime ahora = LocalDateTime.now();
		if (paquete.getId() == null) {
			paquete.setFechaCreacion(ahora);
		}
		paquete.setFechaActualizacion(ahora);
	}

	public static PaqueteVuelo nuevoVuelo(Paquete paquete, PaqueteVueloRequest request, int orden) {
		PaqueteVuelo vuelo = new PaqueteVuelo();
		vuelo.setPaquete(paquete);
		vuelo.setAerolinea(Textos.sinEspacios(request.aerolinea()));
		vuelo.setOrigen(Textos.sinEspacios(request.origen()));
		vuelo.setDestino(Textos.sinEspacios(request.destino()));
		vuelo.setFechaSalida(request.fechaSalida());
		vuelo.setFechaLlegada(request.fechaLlegada());
		vuelo.setOrden(orden);
		return vuelo;
	}

	public static PaqueteOpcion nuevaOpcion(Paquete paquete, PaqueteOpcionRequest request, int orden) {
		PaqueteOpcion opcion = new PaqueteOpcion();
		opcion.setPaquete(paquete);
		opcion.setHotelServicio(Textos.sinEspacios(request.hotelServicio()));
		opcion.setFechaDesde(request.fechaDesde());
		opcion.setFechaHasta(request.fechaHasta());
		opcion.setIncluye(Textos.sinEspacios(request.incluye()));
		opcion.setPrecioSimple(request.precioSimple() == null ? java.math.BigDecimal.ZERO : request.precioSimple());
		opcion.setPrecioDoble(request.precioDoble() == null ? java.math.BigDecimal.ZERO : request.precioDoble());
		opcion.setPrecioTriple(request.precioTriple() == null ? java.math.BigDecimal.ZERO : request.precioTriple());
		opcion.setPrecioNino(request.precioNino() == null ? java.math.BigDecimal.ZERO : request.precioNino());
		opcion.setOrden(orden);
		return opcion;
	}
}
