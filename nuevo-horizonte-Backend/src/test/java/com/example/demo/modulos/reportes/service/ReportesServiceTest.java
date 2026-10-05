package com.example.demo.modulos.reportes.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.demo.modulos.cotizaciones.entity.Cotizacion;
import com.example.demo.modulos.cotizaciones.repository.CotizacionRepository;
import com.example.demo.modulos.gestionAgencias.entity.Agencia;
import com.example.demo.modulos.paquetes.repository.PaqueteRepository;
import com.example.demo.modulos.proveedores.entity.Proveedor;
import com.example.demo.modulos.tarifas.repository.TarifaRepository;
import com.example.demo.modulos.ventas.entity.Venta;
import com.example.demo.modulos.ventas.repository.VentaRepository;

@ExtendWith(MockitoExtension.class)
class ReportesServiceTest {

	@Mock
	private CotizacionRepository cotizacionRepository;

	@Mock
	private VentaRepository ventaRepository;

	@Mock
	private TarifaRepository tarifaRepository;

	@Mock
	private PaqueteRepository paqueteRepository;

	private ReportesService service;

	@BeforeEach
	void setUp() {
		service = new ReportesService(cotizacionRepository, ventaRepository, tarifaRepository, paqueteRepository);
		org.mockito.Mockito.lenient()
				.when(cotizacionRepository.findByFechaEnvioIsNotNullAndFechaCreacionBetween(any(), any()))
				.thenReturn(List.of());
		org.mockito.Mockito.lenient().when(ventaRepository.sumMontoEntre(any(), any())).thenReturn(BigDecimal.ZERO);
	}

	// --- resumenEjecutivo ---

	@Test
	void resumenEjecutivo_calculaElPorcentajeDeCotizacionesCerradas() {
		when(cotizacionRepository.count()).thenReturn(50L);
		when(cotizacionRepository.countByEstado("CERRADA")).thenReturn(36L);

		var resumen = service.resumenEjecutivo();

		assertThat(resumen.cotizacionesCerradasPct()).isEqualTo(72.0);
	}

	@Test
	void resumenEjecutivo_cotizacionesCerradasEsCeroCuandoNoHayCotizaciones() {
		when(cotizacionRepository.count()).thenReturn(0L);

		var resumen = service.resumenEjecutivo();

		assertThat(resumen.cotizacionesCerradasPct()).isEqualTo(0.0);
	}

	@Test
	void resumenEjecutivo_redondeaElPorcentajeAUnDecimal() {
		when(cotizacionRepository.count()).thenReturn(3L);
		when(cotizacionRepository.countByEstado("CERRADA")).thenReturn(1L);

		var resumen = service.resumenEjecutivo();

		// 1/3 = 33.333...% -> redondeado a 33.3
		assertThat(resumen.cotizacionesCerradasPct()).isEqualTo(33.3);
	}

	@Test
	void resumenEjecutivo_calculaElTiempoPromedioDeRespuestaEnHoras() {
		when(cotizacionRepository.count()).thenReturn(0L);
		Cotizacion rapida = cotizacionConRespuesta(2);
		Cotizacion lenta = cotizacionConRespuesta(4);
		when(cotizacionRepository.findByFechaEnvioIsNotNullAndFechaCreacionBetween(any(), any()))
				.thenReturn(List.of(rapida, lenta))
				.thenReturn(List.of());

		var resumen = service.resumenEjecutivo();

		assertThat(resumen.tiempoRespuestaHoras()).isEqualTo(3.0);
	}

	@Test
	void resumenEjecutivo_tiempoDeRespuestaNullCuandoNoHayCotizacionesEnviadas() {
		when(cotizacionRepository.count()).thenReturn(0L);

		var resumen = service.resumenEjecutivo();

		assertThat(resumen.tiempoRespuestaHoras()).isNull();
		assertThat(resumen.tiempoRespuestaDeltaPct()).isNull();
	}

	@Test
	void resumenEjecutivo_calculaLaVariacionDeVentasVsMesAnterior() {
		when(cotizacionRepository.count()).thenReturn(0L);
		when(ventaRepository.sumMontoEntre(any(), any()))
				.thenReturn(new BigDecimal("186500"))
				.thenReturn(new BigDecimal("162174"));

		var resumen = service.resumenEjecutivo();

		assertThat(resumen.ventasDelPeriodo()).isEqualByComparingTo("186500");
		assertThat(resumen.ventasDeltaPct()).isEqualTo(15.0);
	}

	@Test
	void resumenEjecutivo_deltaDeVentasNullCuandoElMesAnteriorNoTuvoVentas() {
		when(cotizacionRepository.count()).thenReturn(0L);
		when(ventaRepository.sumMontoEntre(any(), any()))
				.thenReturn(new BigDecimal("1000"))
				.thenReturn(BigDecimal.ZERO);

		var resumen = service.resumenEjecutivo();

		assertThat(resumen.ventasDeltaPct()).isNull();
	}

	@Test
	void resumenEjecutivo_ventasDelPeriodoEsCeroCuandoNoHayVentas() {
		when(cotizacionRepository.count()).thenReturn(0L);

		var resumen = service.resumenEjecutivo();

		assertThat(resumen.ventasDelPeriodo()).isEqualByComparingTo(BigDecimal.ZERO);
	}

	// --- rendimientoComercial ---

	@Test
	void rendimientoComercial_7D_devuelveSietePuntosSumandoElMontoDelDiaCorrecto() {
		LocalDateTime hoy = LocalDateTime.now();
		Venta ventaHoy = venta(new BigDecimal("100"), hoy, "CONFIRMADA");
		when(ventaRepository.findByFechaVentaBetweenAndEstadoNot(any(), any(), org.mockito.ArgumentMatchers.eq("ANULADA")))
				.thenReturn(List.of(ventaHoy));

		var serie = service.rendimientoComercial("7D");

		assertThat(serie).hasSize(7);
		assertThat(serie.get(6).valor()).isEqualByComparingTo("100");
	}

	@Test
	void rendimientoComercial_30D_devuelveTreintaPuntos() {
		when(ventaRepository.findByFechaVentaBetweenAndEstadoNot(any(), any(), any())).thenReturn(List.of());

		var serie = service.rendimientoComercial("30D");

		assertThat(serie).hasSize(30);
	}

	@Test
	void rendimientoComercial_mesEsElPeriodoPorDefecto() {
		when(ventaRepository.findByFechaVentaBetweenAndEstadoNot(any(), any(), any())).thenReturn(List.of());

		var serieExplicita = service.rendimientoComercial("MES");
		var serieNull = service.rendimientoComercial(null);
		var serieDesconocida = service.rendimientoComercial("otro-valor-cualquiera");

		assertThat(serieExplicita).hasSize(10);
		assertThat(serieNull).hasSize(10);
		assertThat(serieDesconocida).hasSize(10);
	}

	@Test
	void rendimientoComercial_mes_sumaLasVentasDelMesEnElMismoPunto() {
		LocalDateTime hoy = LocalDateTime.now();
		Venta v1 = venta(new BigDecimal("50000"), hoy, "CONFIRMADA");
		Venta v2 = venta(new BigDecimal("36500"), hoy, "PAGADA");
		when(ventaRepository.findByFechaVentaBetweenAndEstadoNot(any(), any(), any())).thenReturn(List.of(v1, v2));

		var serie = service.rendimientoComercial("MES");

		assertThat(serie.get(serie.size() - 1).valor()).isEqualByComparingTo("86500");
	}

	@Test
	void rendimientoComercial_anio_devuelveCincoPuntos() {
		when(ventaRepository.findByFechaVentaBetweenAndEstadoNot(any(), any(), any())).thenReturn(List.of());

		var serie = service.rendimientoComercial("ANIO");

		assertThat(serie).hasSize(5);
		assertThat(serie.get(serie.size() - 1).label()).isEqualTo(String.valueOf(LocalDate.now().getYear()));
	}

	// --- rankingAgencias ---

	@Test
	void rankingAgencias_mapeaElNombreDeLaAgencia() {
		Agencia agencia = new Agencia();
		agencia.setId(1L);
		agencia.setRazonSocial("Viajes Peru SAC");
		agencia.setNombreComercial("Viajes Peru");
		var proyeccion = rankingAgencia(agencia, new BigDecimal("42500"));
		when(ventaRepository.rankingAgenciasPorVolumen(any())).thenReturn(List.of(proyeccion));

		var ranking = service.rankingAgencias(5);

		assertThat(ranking).hasSize(1);
		assertThat(ranking.get(0).agencia()).isEqualTo("Viajes Peru");
		assertThat(ranking.get(0).monto()).isEqualByComparingTo("42500");
	}

	// --- tarifasPorVencerPorProveedor ---

	@Test
	void tarifasPorVencerPorProveedor_mapeaElNombreDelProveedor() {
		Proveedor proveedor = new Proveedor();
		proveedor.setId(1L);
		proveedor.setRazonSocial("Andes Travel SAC");
		proveedor.setNombreComercial("Andes Travel");
		var proyeccion = tarifasPorProveedor(proveedor, 4L);
		when(tarifaRepository.porVencerAgrupadoPorProveedor(any(), any(), any())).thenReturn(List.of(proyeccion));

		var resultado = service.tarifasPorVencerPorProveedor(5);

		assertThat(resultado).hasSize(1);
		assertThat(resultado.get(0).proveedor()).isEqualTo("Andes Travel");
		assertThat(resultado.get(0).cantidad()).isEqualTo(4L);
	}

	// --- alertas ---

	@Test
	void alertas_construyeLasTresAlertasEnElOrdenEsperado() {
		when(tarifaRepository.countPorVencer(any(), any())).thenReturn(12L);
		when(paqueteRepository.countByEstado("BORRADOR")).thenReturn(4L);
		when(cotizacionRepository.countByEstadoIn(List.of("PENDIENTE", "ENVIADA"))).thenReturn(14L);

		var alertas = service.alertas();

		assertThat(alertas).hasSize(3);
		assertThat(alertas.get(0).cantidad()).isEqualTo(12L);
		assertThat(alertas.get(0).mensaje()).contains("tarifas vencen");
		assertThat(alertas.get(0).severidad()).isEqualTo("WARNING");
		assertThat(alertas.get(1).cantidad()).isEqualTo(4L);
		assertThat(alertas.get(1).mensaje()).contains("productos requieren revisión");
		assertThat(alertas.get(2).cantidad()).isEqualTo(14L);
		assertThat(alertas.get(2).severidad()).isEqualTo("INFO");
	}

	private Cotizacion cotizacionConRespuesta(int horas) {
		Cotizacion cotizacion = new Cotizacion();
		LocalDateTime creacion = LocalDateTime.now().minusDays(1);
		cotizacion.setFechaCreacion(creacion);
		cotizacion.setFechaEnvio(creacion.plusHours(horas));
		return cotizacion;
	}

	private Venta venta(BigDecimal monto, LocalDateTime fecha, String estado) {
		Venta venta = new Venta();
		venta.setMontoAPagar(monto);
		venta.setFechaVenta(fecha);
		venta.setEstado(estado);
		return venta;
	}

	private VentaRepository.RankingAgencia rankingAgencia(Agencia agencia, BigDecimal total) {
		return new VentaRepository.RankingAgencia() {
			@Override
			public Agencia getAgencia() {
				return agencia;
			}

			@Override
			public BigDecimal getTotal() {
				return total;
			}
		};
	}

	private TarifaRepository.TarifasPorProveedor tarifasPorProveedor(Proveedor proveedor, long cantidad) {
		return new TarifaRepository.TarifasPorProveedor() {
			@Override
			public Proveedor getProveedor() {
				return proveedor;
			}

			@Override
			public long getCantidad() {
				return cantidad;
			}
		};
	}
}
