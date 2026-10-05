package com.example.demo.modulos.ventas.mapper;

import java.math.BigDecimal;
import java.util.List;

import com.example.demo.modulos.cotizaciones.entity.Cotizacion;
import com.example.demo.modulos.gestionAgencias.entity.Agencia;
import com.example.demo.modulos.gestionAgencias.mapper.AgenciaMapper;
import com.example.demo.modulos.ventas.dto.CotizacionVentaRefDTO;
import com.example.demo.modulos.ventas.dto.VentaDTO;
import com.example.demo.modulos.ventas.dto.VentaHistorialDTO;
import com.example.demo.modulos.ventas.dto.VentaListaDTO;
import com.example.demo.modulos.ventas.dto.VentaRequest;
import com.example.demo.modulos.ventas.entity.Venta;
import com.example.demo.modulos.ventas.entity.VentaHistorialEstado;

public final class VentaMapper {

	private static final String SIN_DATO = "-";

	private VentaMapper() {
	}

	public static VentaHistorialDTO toHistorialDTO(VentaHistorialEstado historial) {
		return new VentaHistorialDTO(
				historial.getId(),
				historial.getEstadoAnterior(),
				historial.getEstadoNuevo(),
				historial.getFechaCambio(),
				historial.getUsuarioCambio() != null ? historial.getUsuarioCambio().getUsername() : null);
	}

	/**
	 * Proyeccion de una cotizacion cerrada para la pantalla de ventas.
	 * El monto lo calcula CotizacionMapper, que es quien conoce la regla de precio.
	 */
	public static CotizacionVentaRefDTO toCotizacionRefDTO(Cotizacion cotizacion, BigDecimal montoEstimado) {
		return new CotizacionVentaRefDTO(
				cotizacion.getId(),
				cotizacion.getNumero(),
				AgenciaMapper.nombre(cotizacion.getAgencia()),
				montoEstimado);
	}

	public static VentaListaDTO toListaDTO(Venta venta) {
		return new VentaListaDTO(
				venta.getId(),
				venta.getNumero(),
				AgenciaMapper.nombre(venta.getAgencia()),
				venta.getProducto() != null ? venta.getProducto().getNombre() : SIN_DATO,
				descripcionTarifa(venta),
				venta.getMontoAPagar(),
				venta.getComision(),
				venta.getIgv(),
				venta.getEstado(),
				venta.getFechaVenta());
	}

	public static VentaDTO toDTO(Venta venta) {
		List<VentaHistorialDTO> historial = venta.getHistorial().stream()
				.map(VentaMapper::toHistorialDTO)
				.toList();

		BigDecimal total = venta.getMontoAPagar().add(venta.getIgv());
		Agencia agencia = venta.getAgencia();

		return new VentaDTO(
				venta.getId(),
				venta.getNumero(),
				venta.getCotizacion() != null ? venta.getCotizacion().getId() : null,
				venta.getCotizacion() != null ? venta.getCotizacion().getNumero() : null,
				venta.getProducto() != null ? venta.getProducto().getId() : null,
				venta.getProducto() != null ? venta.getProducto().getNombre() : null,
				venta.getTarifa() != null ? venta.getTarifa().getId() : null,
				descripcionTarifa(venta),
				venta.getTarifa() != null ? venta.getTarifa().getPrecio() : null,
				agencia != null ? agencia.getId() : null,
				AgenciaMapper.nombre(agencia),
				agencia != null ? agencia.getRuc() : null,
				venta.getIdDetallePagos(),
				venta.getMontoAPagar(),
				venta.getComision(),
				venta.getIgv(),
				total,
				venta.getNotasOperativas(),
				venta.getEstado(),
				venta.getFechaVenta(),
				venta.getFechaCulminada(),
				venta.getFechaCreacion(),
				venta.getUsuarioRegistro() != null ? venta.getUsuarioRegistro().getUsername() : null,
				historial);
	}

	/**
	 * Proyecta los campos escalares del request sobre la entidad.
	 * Las relaciones (cotizacion, agencia, producto, tarifa) las resuelve la service
	 * porque requieren acceso a la base de datos.
	 */
	public static void aplicar(Venta venta, VentaRequest request) {
		venta.setIdDetallePagos(request.idDetallePagos());
		venta.setMontoAPagar(valorODefecto(request.montoAPagar()));
		venta.setComision(valorODefecto(request.comision()));
		venta.setIgv(valorODefecto(request.igv()));
		venta.setNotasOperativas(request.notasOperativas());
	}

	/**
	 * "Servicio · Destino" de la tarifa asociada, o null si la venta no tiene tarifa.
	 */
	private static String descripcionTarifa(Venta venta) {
		if (venta.getTarifa() == null) {
			return null;
		}
		return venta.getTarifa().getServicio().getNombre()
				+ " · " + venta.getTarifa().getDestino().getNombre();
	}

	private static BigDecimal valorODefecto(BigDecimal valor) {
		return valor != null ? valor : BigDecimal.ZERO;
	}
}
