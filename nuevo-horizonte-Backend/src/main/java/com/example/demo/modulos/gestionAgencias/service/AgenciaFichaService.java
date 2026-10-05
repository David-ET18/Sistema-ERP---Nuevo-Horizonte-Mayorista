package com.example.demo.modulos.gestionAgencias.service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.example.demo.modulos.cotizaciones.entity.Cotizacion;
import com.example.demo.modulos.cotizaciones.repository.CotizacionRepository;
import com.example.demo.modulos.gestionAgencias.dto.AgenciaFichaResumenDTO;
import com.example.demo.modulos.gestionAgencias.dto.HistorialComercialItemDTO;
import com.example.demo.modulos.gestionAgencias.dto.NotaSeguimientoDTO;
import com.example.demo.modulos.gestionAgencias.dto.ResumenComercialDTO;
import com.example.demo.modulos.gestionAgencias.entity.Agencia;
import com.example.demo.modulos.gestionAgencias.entity.InteraccionAgencia;
import com.example.demo.modulos.gestionAgencias.mapper.AgenciaMapper;
import com.example.demo.modulos.gestionAgencias.repository.AgenciaRepository;
import com.example.demo.modulos.gestionAgencias.repository.InteraccionAgenciaRepository;
import com.example.demo.modulos.ventas.entity.Venta;
import com.example.demo.modulos.ventas.repository.VentaRepository;

/**
 * Arma la vista "Agencias / Clientes B2B" (lista + panel de detalle tipo
 * CRM). Lee de ventas, cotizaciones e interacciones (solo lectura: crear o
 * editar notas de seguimiento es responsabilidad del modulo Seguimiento
 * Comercial), ademas de los datos propios de Agencia.
 */
@Service
@Transactional(readOnly = true)
public class AgenciaFichaService {

	private final AgenciaRepository agenciaRepository;
	private final VentaRepository ventaRepository;
	private final CotizacionRepository cotizacionRepository;
	private final InteraccionAgenciaRepository interaccionAgenciaRepository;

	public AgenciaFichaService(AgenciaRepository agenciaRepository, VentaRepository ventaRepository,
			CotizacionRepository cotizacionRepository, InteraccionAgenciaRepository interaccionAgenciaRepository) {
		this.agenciaRepository = agenciaRepository;
		this.ventaRepository = ventaRepository;
		this.cotizacionRepository = cotizacionRepository;
		this.interaccionAgenciaRepository = interaccionAgenciaRepository;
	}

	public List<AgenciaFichaResumenDTO> listar(String q) {
		List<Agencia> agencias = StringUtils.hasText(q)
				? agenciaRepository.findAllByOrderByRazonSocialAsc().stream()
						.filter(a -> coincide(a, q))
						.toList()
				: agenciaRepository.findAllByOrderByRazonSocialAsc();

		List<Long> ids = agencias.stream().map(Agencia::getId).toList();
		Map<Long, java.time.LocalDateTime> ultimasInteracciones = ids.isEmpty()
				? Map.of()
				: interaccionAgenciaRepository.findUltimaInteraccionPorAgencias(ids).stream()
						.collect(Collectors.toMap(
								InteraccionAgenciaRepository.UltimaInteraccion::getAgenciaId,
								InteraccionAgenciaRepository.UltimaInteraccion::getUltimaFecha));

		return agencias.stream()
				.map(a -> new AgenciaFichaResumenDTO(
						a.getId(),
						AgenciaMapper.nombre(a),
						a.getLogoUrl(),
						a.isEsPrioritaria(),
						a.isActivo(),
						ultimasInteracciones.get(a.getId())))
				.toList();
	}

	private boolean coincide(Agencia agencia, String q) {
		String patron = q.trim().toLowerCase();
		return (agencia.getRazonSocial() != null && agencia.getRazonSocial().toLowerCase().contains(patron))
				|| (agencia.getNombreComercial() != null && agencia.getNombreComercial().toLowerCase().contains(patron))
				|| (agencia.getRuc() != null && agencia.getRuc().contains(patron));
	}

	public ResumenComercialDTO resumenComercial(Long agenciaId) {
		BigDecimal comprasAcumuladas = ventaRepository.sumMontoPorAgencia(agenciaId);
		long cotizaciones = cotizacionRepository.countByAgenciaId(agenciaId);
		long ventasCerradas = ventaRepository.countByAgenciaIdAndEstadoNot(agenciaId, "ANULADA");
		var ultimaCompra = ventaRepository.findUltimaCompra(agenciaId);
		return new ResumenComercialDTO(comprasAcumuladas, cotizaciones, ventasCerradas, ultimaCompra);
	}

	public List<HistorialComercialItemDTO> historialComercial(Long agenciaId) {
		List<HistorialComercialItemDTO> items = new ArrayList<>();

		for (Cotizacion c : cotizacionRepository.findTop10ByAgenciaIdOrderByFechaCreacionDesc(agenciaId)) {
			items.add(new HistorialComercialItemDTO(
					"COTIZACION", c.getNumero(), "Cotizacion " + c.getNumero(), c.getEstado(), c.getFechaCreacion()));
		}
		for (Venta v : ventaRepository.findTop10ByAgenciaIdOrderByFechaVentaDesc(agenciaId)) {
			String titulo = v.getProducto() != null ? v.getProducto().getNombre() : "Venta " + v.getNumero();
			items.add(new HistorialComercialItemDTO("VENTA", v.getNumero(), titulo, v.getEstado(), v.getFechaVenta()));
		}

		return items.stream()
				.sorted(Comparator.comparing(HistorialComercialItemDTO::fecha).reversed())
				.limit(15)
				.toList();
	}

	public List<NotaSeguimientoDTO> notasSeguimiento(Long agenciaId) {
		return interaccionAgenciaRepository
				.findByAgenciaIdOrderByFechaDesc(agenciaId, PageRequest.of(0, 20))
				.stream()
				.map(this::toNotaDTO)
				.toList();
	}

	private NotaSeguimientoDTO toNotaDTO(InteraccionAgencia interaccion) {
		return new NotaSeguimientoDTO(
				interaccion.getId(),
				interaccion.getTipo(),
				interaccion.getNotas(),
				interaccion.getUsuarioRegistro() != null ? interaccion.getUsuarioRegistro().getUsername() : null,
				interaccion.getFecha());
	}
}
