package com.example.demo.modulos.reportes.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.modulos.cotizaciones.entity.Cotizacion;
import com.example.demo.modulos.cotizaciones.repository.CotizacionRepository;
import com.example.demo.modulos.gestionAgencias.mapper.AgenciaMapper;
import com.example.demo.modulos.paquetes.repository.PaqueteRepository;
import com.example.demo.modulos.proveedores.mapper.ProveedorMapper;
import com.example.demo.modulos.reportes.dto.AlertaDTO;
import com.example.demo.modulos.reportes.dto.PuntoSerieDTO;
import com.example.demo.modulos.reportes.dto.RankingAgenciaDTO;
import com.example.demo.modulos.reportes.dto.ResumenEjecutivoDTO;
import com.example.demo.modulos.reportes.dto.TarifasPorProveedorDTO;
import com.example.demo.modulos.tarifas.repository.TarifaRepository;
import com.example.demo.modulos.ventas.entity.Venta;
import com.example.demo.modulos.ventas.repository.VentaRepository;

/**
 * Arma la vista "Resumen Ejecutivo" (Dashboard y Reportes) leyendo de
 * cotizaciones, ventas, tarifas y paquetes. Es puramente de lectura: no
 * modifica datos de ningun otro modulo.
 */
@Service
@Transactional(readOnly = true)
public class ReportesService {

	private static final long DIAS_POR_VENCER = 7;

	private final CotizacionRepository cotizacionRepository;
	private final VentaRepository ventaRepository;
	private final TarifaRepository tarifaRepository;
	private final PaqueteRepository paqueteRepository;

	public ReportesService(CotizacionRepository cotizacionRepository, VentaRepository ventaRepository,
			TarifaRepository tarifaRepository, PaqueteRepository paqueteRepository) {
		this.cotizacionRepository = cotizacionRepository;
		this.ventaRepository = ventaRepository;
		this.tarifaRepository = tarifaRepository;
		this.paqueteRepository = paqueteRepository;
	}

	public ResumenEjecutivoDTO resumenEjecutivo() {
		long totalCotizaciones = cotizacionRepository.count();
		long cerradas = cotizacionRepository.countByEstado("CERRADA");
		double cotizacionesCerradasPct = totalCotizaciones == 0 ? 0
				: redondear(cerradas * 100.0 / totalCotizaciones);

		LocalDateTime inicioMes = inicioDeMes(0);
		LocalDateTime inicioMesAnterior = inicioDeMes(-1);

		Double tiempoRespuestaMes = tiempoPromedioRespuestaHoras(inicioMes, inicioDeMes(1));
		Double tiempoRespuestaMesAnterior = tiempoPromedioRespuestaHoras(inicioMesAnterior, inicioMes);
		Double tiempoDeltaPct = variacionPct(tiempoRespuestaMesAnterior, tiempoRespuestaMes);

		BigDecimal ventasMes = ventaRepository.sumMontoEntre(inicioMes, inicioDeMes(1));
		BigDecimal ventasMesAnterior = ventaRepository.sumMontoEntre(inicioMesAnterior, inicioMes);
		Double ventasDeltaPct = variacionPct(
				ventasMesAnterior == null ? null : ventasMesAnterior.doubleValue(),
				ventasMes == null ? null : ventasMes.doubleValue());

		return new ResumenEjecutivoDTO(
				cotizacionesCerradasPct,
				tiempoRespuestaMes,
				tiempoDeltaPct,
				ventasMes == null ? BigDecimal.ZERO : ventasMes,
				ventasDeltaPct);
	}

	/** periodo: "7D" | "30D" | "MES" (por defecto) | "ANIO". */
	public List<PuntoSerieDTO> rendimientoComercial(String periodo) {
		LocalDateTime ahora = LocalDateTime.now();
		String p = periodo == null ? "MES" : periodo.toUpperCase(Locale.ROOT);

		return switch (p) {
			case "7D" -> serieDiaria(ahora.minusDays(6));
			case "30D" -> serieDiaria(ahora.minusDays(29));
			case "ANIO" -> serieAnual(ahora.minusYears(4));
			default -> serieMensual(ahora.minusMonths(9));
		};
	}

	private List<PuntoSerieDTO> serieDiaria(LocalDateTime desde) {
		LocalDateTime inicio = desde.toLocalDate().atStartOfDay();
		List<Venta> ventas = ventaRepository.findByFechaVentaBetweenAndEstadoNot(inicio, LocalDateTime.now().plusDays(1),
				"ANULADA");

		Map<LocalDate, BigDecimal> porDia = new LinkedHashMap<>();
		for (LocalDate d = inicio.toLocalDate(); !d.isAfter(LocalDate.now()); d = d.plusDays(1)) {
			porDia.put(d, BigDecimal.ZERO);
		}
		for (Venta v : ventas) {
			LocalDate dia = v.getFechaVenta().toLocalDate();
			porDia.merge(dia, v.getMontoAPagar(), BigDecimal::add);
		}
		List<PuntoSerieDTO> serie = new ArrayList<>();
		porDia.forEach((dia, total) -> serie.add(new PuntoSerieDTO(
				dia.getDayOfMonth() + " " + dia.getMonth().getDisplayName(TextStyle.SHORT, new Locale("es")), total)));
		return serie;
	}

	private List<PuntoSerieDTO> serieMensual(LocalDateTime desde) {
		LocalDateTime inicio = desde.toLocalDate().withDayOfMonth(1).atStartOfDay();
		List<Venta> ventas = ventaRepository.findByFechaVentaBetweenAndEstadoNot(inicio, LocalDateTime.now().plusDays(1),
				"ANULADA");

		Map<String, BigDecimal> porMes = new LinkedHashMap<>();
		LocalDate cursor = inicio.toLocalDate();
		LocalDate limite = LocalDate.now().withDayOfMonth(1);
		while (!cursor.isAfter(limite)) {
			porMes.put(claveMes(cursor), BigDecimal.ZERO);
			cursor = cursor.plusMonths(1);
		}
		for (Venta v : ventas) {
			porMes.merge(claveMes(v.getFechaVenta().toLocalDate()), v.getMontoAPagar(), BigDecimal::add);
		}
		List<PuntoSerieDTO> serie = new ArrayList<>();
		porMes.forEach((clave, total) -> serie.add(new PuntoSerieDTO(etiquetaMes(clave), total)));
		return serie;
	}

	private List<PuntoSerieDTO> serieAnual(LocalDateTime desde) {
		List<Venta> ventas = ventaRepository.findByFechaVentaBetweenAndEstadoNot(
				desde.toLocalDate().withDayOfYear(1).atStartOfDay(), LocalDateTime.now().plusDays(1), "ANULADA");

		Map<Integer, BigDecimal> porAnio = new LinkedHashMap<>();
		for (int a = desde.getYear(); a <= LocalDate.now().getYear(); a++) {
			porAnio.put(a, BigDecimal.ZERO);
		}
		for (Venta v : ventas) {
			porAnio.merge(v.getFechaVenta().getYear(), v.getMontoAPagar(), BigDecimal::add);
		}
		List<PuntoSerieDTO> serie = new ArrayList<>();
		porAnio.forEach((anio, total) -> serie.add(new PuntoSerieDTO(String.valueOf(anio), total)));
		return serie;
	}

	public List<RankingAgenciaDTO> rankingAgencias(int limite) {
		return ventaRepository.rankingAgenciasPorVolumen(PageRequest.of(0, limite)).stream()
				.map(r -> new RankingAgenciaDTO(r.getAgencia().getId(), AgenciaMapper.nombre(r.getAgencia()), r.getTotal()))
				.toList();
	}

	public List<TarifasPorProveedorDTO> tarifasPorVencerPorProveedor(int limite) {
		LocalDate hoy = LocalDate.now();
		LocalDate limiteFecha = hoy.plusDays(DIAS_POR_VENCER);
		return tarifaRepository.porVencerAgrupadoPorProveedor(hoy, limiteFecha, PageRequest.of(0, limite)).stream()
				.map(r -> new TarifasPorProveedorDTO(r.getProveedor().getId(), ProveedorMapper.nombre(r.getProveedor()),
						r.getCantidad()))
				.toList();
	}

	public List<AlertaDTO> alertas() {
		LocalDate hoy = LocalDate.now();
		long tarifasPorVencer = tarifaRepository.countPorVencer(hoy, hoy.plusDays(DIAS_POR_VENCER));
		long productosEnBorrador = paqueteRepository.countByEstado("BORRADOR");
		long cotizacionesPendientes = cotizacionRepository.countByEstadoIn(List.of("PENDIENTE", "ENVIADA"));

		List<AlertaDTO> alertas = new ArrayList<>();
		alertas.add(new AlertaDTO("WARNING", tarifasPorVencer, "tarifas vencen esta semana"));
		alertas.add(new AlertaDTO("WARNING", productosEnBorrador, "productos requieren revisión"));
		alertas.add(new AlertaDTO("INFO", cotizacionesPendientes, "cotizaciones pendientes de seguimiento"));
		return alertas;
	}

	private Double tiempoPromedioRespuestaHoras(LocalDateTime desde, LocalDateTime hasta) {
		List<Cotizacion> cotizaciones = cotizacionRepository
				.findByFechaEnvioIsNotNullAndFechaCreacionBetween(desde, hasta);
		if (cotizaciones.isEmpty()) {
			return null;
		}
		double totalHoras = 0;
		for (Cotizacion c : cotizaciones) {
			totalHoras += Duration.between(c.getFechaCreacion(), c.getFechaEnvio()).toMinutes() / 60.0;
		}
		return redondear(totalHoras / cotizaciones.size());
	}

	private Double variacionPct(Double anterior, Double actual) {
		if (anterior == null || actual == null || anterior == 0) {
			return null;
		}
		return redondear((actual - anterior) * 100.0 / anterior);
	}

	private double redondear(double valor) {
		return BigDecimal.valueOf(valor).setScale(1, RoundingMode.HALF_UP).doubleValue();
	}

	private LocalDateTime inicioDeMes(int desplazamientoMeses) {
		return LocalDate.now().withDayOfMonth(1).plusMonths(desplazamientoMeses).atStartOfDay();
	}

	private String claveMes(LocalDate fecha) {
		return fecha.getYear() + "-" + String.format("%02d", fecha.getMonthValue());
	}

	private String etiquetaMes(String clave) {
		int mes = Integer.parseInt(clave.substring(5, 7));
		return LocalDate.of(2000, mes, 1).getMonth().getDisplayName(TextStyle.SHORT, new Locale("es"));
	}
}
