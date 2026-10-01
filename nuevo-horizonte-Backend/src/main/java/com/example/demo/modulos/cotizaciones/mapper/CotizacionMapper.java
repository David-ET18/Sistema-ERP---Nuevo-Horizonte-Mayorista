package com.example.demo.modulos.cotizaciones.mapper;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

import com.example.demo.modulos.cotizaciones.dto.CotizacionDTO;
import com.example.demo.modulos.cotizaciones.dto.CotizacionDetalleDTO;
import com.example.demo.modulos.cotizaciones.dto.CotizacionHistorialDTO;
import com.example.demo.modulos.cotizaciones.dto.CotizacionListaDTO;
import com.example.demo.modulos.cotizaciones.entity.Cotizacion;
import com.example.demo.modulos.cotizaciones.entity.CotizacionDetalle;
import com.example.demo.modulos.cotizaciones.entity.CotizacionHistorialEstado;
import com.example.demo.modulos.gestionAgencias.entity.Agencia;
import com.example.demo.modulos.gestionAgencias.mapper.AgenciaMapper;
import com.example.demo.modulos.proveedores.mapper.ProveedorMapper;

public final class CotizacionMapper {

	private CotizacionMapper() {
	}

	public static CotizacionHistorialDTO toHistorialDTO(CotizacionHistorialEstado historial) {
		return new CotizacionHistorialDTO(
				historial.getId(),
				historial.getEstadoAnterior(),
				historial.getEstadoNuevo(),
				historial.getFechaCambio(),
				historial.getUsuarioCambio() != null ? historial.getUsuarioCambio().getUsername() : null);
	}

	public static CotizacionDetalleDTO toDetalleDTO(CotizacionDetalle detalle) {
		BigDecimal monto = detalle.getPrecioUnitario()
				.multiply(BigDecimal.valueOf(detalle.getCantidadPax()));
		return new CotizacionDetalleDTO(
				detalle.getId(),
				detalle.getTarifa().getId(),
				detalle.getTarifa().getServicio().getNombre(),
				detalle.getTarifa().getDestino().getNombre(),
				ProveedorMapper.nombre(detalle.getTarifa().getProveedor()),
				detalle.getPrecioUnitario(),
				detalle.getCantidadPax(),
				monto,
				detalle.getTarifa().getMoneda());
	}

	/**
	 * Proyeccion para el listado: una linea por cotizacion ya con sus totales calculados.
	 */
	public static CotizacionListaDTO toListaDTO(Cotizacion cotizacion,
			List<CotizacionDetalle> lineas) {
		Set<String> productos = new LinkedHashSet<>();
		String destino = "";
		BigDecimal costoBase = BigDecimal.ZERO;

		for (CotizacionDetalle detalle : lineas) {
			productos.add(detalle.getTarifa().getServicio().getNombre());
			if (destino.isBlank()) {
				destino = detalle.getTarifa().getDestino().getNombre();
			}
			costoBase = costoBase.add(
					detalle.getPrecioUnitario().multiply(BigDecimal.valueOf(detalle.getCantidadPax())));
		}

		BigDecimal precioVenta = calcularPrecioVenta(costoBase, cotizacion.getMargenPorcentaje());

		return new CotizacionListaDTO(
				cotizacion.getId(),
				cotizacion.getNumero(),
				AgenciaMapper.nombre(cotizacion.getAgencia()),
				destino,
				String.join(" + ", productos),
				precioVenta,
				cotizacion.getEstado(),
				cotizacion.getFechaCreacion());
	}

	public static CotizacionDTO toDTO(Cotizacion cotizacion) {
		List<CotizacionDetalleDTO> lineas = cotizacion.getDetalles().stream()
				.map(CotizacionMapper::toDetalleDTO)
				.toList();

		BigDecimal costoBase = lineas.stream()
				.map(CotizacionDetalleDTO::monto)
				.reduce(BigDecimal.ZERO, BigDecimal::add);

		BigDecimal margenPct = cotizacion.getMargenPorcentaje() != null
				? cotizacion.getMargenPorcentaje()
				: BigDecimal.ZERO;
		BigDecimal margenMonto = calcularMargen(costoBase, margenPct);
		BigDecimal precioVenta = costoBase.add(margenMonto);

		Set<String> productos = new LinkedHashSet<>();
		cotizacion.getDetalles()
				.forEach(d -> productos.add(d.getTarifa().getServicio().getNombre()));
		String destino = cotizacion.getDetalles().isEmpty()
				? ""
				: cotizacion.getDetalles().get(0).getTarifa().getDestino().getNombre();

		List<CotizacionHistorialDTO> historial = cotizacion.getHistorial().stream()
				.map(CotizacionMapper::toHistorialDTO)
				.toList();

		Agencia agencia = cotizacion.getAgencia();

		return new CotizacionDTO(
				cotizacion.getId(),
				cotizacion.getNumero(),
				agencia.getId(),
				AgenciaMapper.nombre(agencia),
				agencia.getRuc(),
				cotizacion.getAsesor() != null ? cotizacion.getAsesor().getUsername() : null,
				cotizacion.getFechaCreacion(),
				cotizacion.getFechaEnvio(),
				cotizacion.getFechaCierre(),
				cotizacion.getFechaViaje(),
				cotizacion.getServiciosAdicionales(),
				margenPct,
				costoBase,
				margenMonto,
				precioVenta,
				cotizacion.getEstado(),
				destino,
				String.join(" + ", productos),
				precioVenta,
				lineas,
				historial);
	}

	/**
	 * Monto estimado que ventas muestra como referencia al crear una venta
	 * desde una cotizacion cerrada.
	 */
	public static BigDecimal montoEstimado(Cotizacion cotizacion) {
		BigDecimal costoBase = cotizacion.getDetalles().stream()
				.map(d -> d.getPrecioUnitario().multiply(BigDecimal.valueOf(d.getCantidadPax())))
				.reduce(BigDecimal.ZERO, BigDecimal::add);
		return calcularPrecioVenta(costoBase, cotizacion.getMargenPorcentaje());
	}

	public static BigDecimal calcularMargen(BigDecimal costoBase, BigDecimal margenPorcentaje) {
		return costoBase.multiply(margenPorcentaje)
				.divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
	}

	public static BigDecimal calcularPrecioVenta(BigDecimal costoBase, BigDecimal margenPorcentaje) {
		BigDecimal pct = margenPorcentaje != null ? margenPorcentaje : BigDecimal.ZERO;
		return costoBase.add(calcularMargen(costoBase, pct));
	}
}
