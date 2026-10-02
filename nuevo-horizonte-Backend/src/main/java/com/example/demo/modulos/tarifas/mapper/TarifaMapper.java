package com.example.demo.modulos.tarifas.mapper;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import com.example.demo.modulos.catalogo.entity.Destino;
import com.example.demo.modulos.catalogo.entity.Servicio;
import com.example.demo.modulos.gestionUsuariosRolesPermisos.entity.Usuario;
import com.example.demo.modulos.proveedores.entity.Proveedor;
import com.example.demo.modulos.proveedores.mapper.ProveedorMapper;
import com.example.demo.modulos.tarifas.dto.TarifaDTO;
import com.example.demo.modulos.tarifas.dto.TarifaDetalleDTO;
import com.example.demo.modulos.tarifas.dto.TarifaHistorialDTO;
import com.example.demo.modulos.tarifas.dto.TarifaListaDTO;
import com.example.demo.modulos.tarifas.dto.TarifaRequest;
import com.example.demo.modulos.tarifas.entity.Tarifa;
import com.example.demo.modulos.tarifas.entity.TarifaHistorial;
import com.example.demo.util.Textos;

public final class TarifaMapper {

	public static final String ESTADO_VIGENTE = "VIGENTE";
	public static final String ESTADO_POR_VENCER = "POR_VENCER";
	public static final String ESTADO_VENCIDA = "VENCIDA";

	/** Dias de antelacion para marcar una tarifa como "Por vencer". */
	private static final long DIAS_POR_VENCER = 7;

	/** Catalogo sugerido del select "Tipo de tarifa" del formulario. */
	public static final List<String> TIPOS_TARIFA = List.of(
			"Estandar", "Promocional", "Por temporada", "Corporativa");

	private TarifaMapper() {
	}

	public static String calcularEstado(LocalDate fechaHasta) {
		if (fechaHasta == null) {
			return ESTADO_VIGENTE;
		}
		LocalDate hoy = LocalDate.now();
		if (fechaHasta.isBefore(hoy)) {
			return ESTADO_VENCIDA;
		}
		if (!fechaHasta.isAfter(hoy.plusDays(DIAS_POR_VENCER))) {
			return ESTADO_POR_VENCER;
		}
		return ESTADO_VIGENTE;
	}

	/** Version resumida que consumen otros modulos (cotizaciones, ventas). */
	public static TarifaDTO toDTO(Tarifa tarifa) {
		return new TarifaDTO(
				tarifa.getId(),
				tarifa.getServicio().getNombre(),
				tarifa.getDestino().getNombre(),
				tarifa.getDestino().getId(),
				ProveedorMapper.nombre(tarifa.getProveedor()),
				tarifa.getPrecio(),
				tarifa.getMoneda(),
				tarifa.getFechaDesde(),
				tarifa.getFechaHasta());
	}

	public static TarifaListaDTO toListaDTO(Tarifa tarifa) {
		return new TarifaListaDTO(
				tarifa.getId(),
				ProveedorMapper.nombre(tarifa.getProveedor()),
				tarifa.getServicio().getNombre(),
				tarifa.getDestino().getNombre(),
				tarifa.getPrecio(),
				tarifa.getMoneda(),
				tarifa.getFechaDesde(),
				tarifa.getFechaHasta(),
				calcularEstado(tarifa.getFechaHasta()),
				tarifa.getFechaActualizacion());
	}

	public static TarifaDetalleDTO toDetalleDTO(Tarifa tarifa) {
		Proveedor proveedor = tarifa.getProveedor();
		Servicio servicio = tarifa.getServicio();
		Destino destino = tarifa.getDestino();
		return new TarifaDetalleDTO(
				tarifa.getId(),
				proveedor.getId(),
				ProveedorMapper.nombre(proveedor),
				servicio.getId(),
				servicio.getNombre(),
				destino.getId(),
				destino.getNombre(),
				tarifa.getTipoTarifa(),
				tarifa.getPrecio(),
				tarifa.getMoneda(),
				tarifa.getFechaDesde(),
				tarifa.getFechaHasta(),
				tarifa.getCondiciones(),
				tarifa.getObservaciones(),
				tarifa.getArchivoRespaldoUrl(),
				calcularEstado(tarifa.getFechaHasta()),
				tarifa.getHistorial().stream().map(TarifaMapper::toHistorialDTO).toList(),
				tarifa.getFechaCreacion(),
				tarifa.getFechaActualizacion());
	}

	public static TarifaHistorialDTO toHistorialDTO(TarifaHistorial historial) {
		Usuario usuario = historial.getUsuarioCambio();
		return new TarifaHistorialDTO(
				historial.getPrecioAnterior(),
				historial.getPrecioNuevo(),
				historial.getFechaCambio(),
				usuario == null ? null : usuario.getUsername());
	}

	/**
	 * Proyecta un request sobre la entidad (campos simples + relaciones, ya
	 * resueltas). El historial de precio se registra aparte en el service.
	 */
	public static void aplicar(Tarifa tarifa, TarifaRequest request, Proveedor proveedor, Servicio servicio,
			Destino destino) {
		tarifa.setProveedor(proveedor);
		tarifa.setServicio(servicio);
		tarifa.setDestino(destino);
		tarifa.setTipoTarifa(Textos.sinEspacios(request.tipoTarifa()));
		tarifa.setPrecio(request.precio());
		tarifa.setMoneda(request.moneda() == null || request.moneda().isBlank() ? "PEN" : request.moneda());
		tarifa.setFechaDesde(request.fechaDesde());
		tarifa.setFechaHasta(request.fechaHasta());
		tarifa.setCondiciones(Textos.sinEspacios(request.condiciones()));
		tarifa.setObservaciones(Textos.sinEspacios(request.observaciones()));

		LocalDateTime ahora = LocalDateTime.now();
		if (tarifa.getId() == null) {
			tarifa.setFechaCreacion(ahora);
		}
		tarifa.setFechaActualizacion(ahora);
	}
}
