package com.example.demo.modulos.gestionAgencias.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
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
import com.example.demo.modulos.gestionAgencias.entity.InteraccionAgencia;
import com.example.demo.modulos.gestionAgencias.repository.AgenciaRepository;
import com.example.demo.modulos.gestionAgencias.repository.InteraccionAgenciaRepository;
import com.example.demo.modulos.gestionUsuariosRolesPermisos.entity.Usuario;
import com.example.demo.modulos.paquetes.entity.Paquete;
import com.example.demo.modulos.ventas.entity.Venta;
import com.example.demo.modulos.ventas.repository.VentaRepository;

@ExtendWith(MockitoExtension.class)
class AgenciaFichaServiceTest {

	@Mock
	private AgenciaRepository agenciaRepository;

	@Mock
	private VentaRepository ventaRepository;

	@Mock
	private CotizacionRepository cotizacionRepository;

	@Mock
	private InteraccionAgenciaRepository interaccionAgenciaRepository;

	private AgenciaFichaService service;

	@BeforeEach
	void setUp() {
		service = new AgenciaFichaService(agenciaRepository, ventaRepository, cotizacionRepository,
				interaccionAgenciaRepository);
	}

	@Test
	void listar_sinFiltroDevuelveTodasOrdenadas() {
		Agencia a1 = agencia(1L, "Viajes Peru SAC", "Viajes Peru");
		Agencia a2 = agencia(2L, "Andina Tours SAC", null);
		when(agenciaRepository.findAllByOrderByRazonSocialAsc()).thenReturn(List.of(a1, a2));
		when(interaccionAgenciaRepository.findUltimaInteraccionPorAgencias(any())).thenReturn(List.of());

		var resultado = service.listar(null);

		assertThat(resultado).hasSize(2);
		assertThat(resultado.get(0).nombre()).isEqualTo("Viajes Peru");
		assertThat(resultado.get(1).nombre()).isEqualTo("Andina Tours SAC");
	}

	@Test
	void listar_filtraPorRazonSocialNombreComercialORuc_ignorandoMayusculas() {
		Agencia coincidePorNombre = agencia(1L, "Viajes Peru SAC", "Viajes Peru");
		Agencia coincidePorRuc = agencia(2L, "Andina Tours SAC", null);
		coincidePorRuc.setRuc("20999888777");
		Agencia noCoincide = agencia(3L, "Mundo Travel SAC", "Mundo Travel");
		noCoincide.setRuc("20111222333");
		when(agenciaRepository.findAllByOrderByRazonSocialAsc())
				.thenReturn(List.of(coincidePorNombre, coincidePorRuc, noCoincide));
		when(interaccionAgenciaRepository.findUltimaInteraccionPorAgencias(any())).thenReturn(List.of());

		var resultado = service.listar("VIAJES");

		assertThat(resultado).extracting(dto -> dto.id()).containsExactly(1L);
	}

	@Test
	void listar_noConsultaInteraccionesCuandoNoHayAgencias() {
		when(agenciaRepository.findAllByOrderByRazonSocialAsc()).thenReturn(List.of());

		var resultado = service.listar(null);

		assertThat(resultado).isEmpty();
	}

	@Test
	void listar_asignaLaUltimaInteraccionDeCadaAgencia() {
		Agencia a1 = agencia(1L, "Viajes Peru SAC", null);
		LocalDateTime fecha = LocalDateTime.of(2026, 8, 18, 0, 0);
		InteraccionAgenciaRepository.UltimaInteraccion proyeccion = mockUltimaInteraccion(1L, fecha);
		when(agenciaRepository.findAllByOrderByRazonSocialAsc()).thenReturn(List.of(a1));
		when(interaccionAgenciaRepository.findUltimaInteraccionPorAgencias(List.of(1L)))
				.thenReturn(List.of(proyeccion));

		var resultado = service.listar(null);

		assertThat(resultado.get(0).ultimaInteraccion()).isEqualTo(fecha);
	}

	@Test
	void resumenComercial_combinaVentasYCotizacionesDeLaAgencia() {
		when(ventaRepository.sumMontoPorAgencia(1L)).thenReturn(new BigDecimal("85400.00"));
		when(cotizacionRepository.countByAgenciaId(1L)).thenReturn(32L);
		when(ventaRepository.countByAgenciaIdAndEstadoNot(1L, "ANULADA")).thenReturn(18L);
		LocalDateTime ultimaCompra = LocalDateTime.of(2026, 8, 28, 0, 0);
		when(ventaRepository.findUltimaCompra(1L)).thenReturn(ultimaCompra);

		var resumen = service.resumenComercial(1L);

		assertThat(resumen.comprasAcumuladas()).isEqualByComparingTo("85400.00");
		assertThat(resumen.cotizaciones()).isEqualTo(32L);
		assertThat(resumen.ventasCerradas()).isEqualTo(18L);
		assertThat(resumen.ultimaCompra()).isEqualTo(ultimaCompra);
	}

	@Test
	void historialComercial_combinaCotizacionesYVentasOrdenadasPorFechaDescendente() {
		Cotizacion cotizacionVieja = cotizacion("COT-0001", LocalDateTime.of(2026, 1, 1, 0, 0));
		Cotizacion cotizacionNueva = cotizacion("COT-0025", LocalDateTime.of(2026, 9, 2, 0, 0));
		Venta venta = venta("VTA-0010", LocalDateTime.of(2026, 8, 28, 0, 0));
		when(cotizacionRepository.findTop10ByAgenciaIdOrderByFechaCreacionDesc(1L))
				.thenReturn(List.of(cotizacionNueva, cotizacionVieja));
		when(ventaRepository.findTop10ByAgenciaIdOrderByFechaVentaDesc(1L)).thenReturn(List.of(venta));

		var historial = service.historialComercial(1L);

		assertThat(historial).hasSize(3);
		assertThat(historial.get(0).numero()).isEqualTo("COT-0025");
		assertThat(historial.get(1).numero()).isEqualTo("VTA-0010");
		assertThat(historial.get(2).numero()).isEqualTo("COT-0001");
	}

	@Test
	void historialComercial_limitaA15Elementos() {
		List<Cotizacion> cotizaciones = new java.util.ArrayList<>();
		for (int i = 0; i < 10; i++) {
			cotizaciones.add(cotizacion("COT-000" + i, LocalDateTime.now().minusDays(i)));
		}
		List<Venta> ventas = new java.util.ArrayList<>();
		for (int i = 0; i < 10; i++) {
			ventas.add(venta("VTA-000" + i, LocalDateTime.now().minusDays(i)));
		}
		when(cotizacionRepository.findTop10ByAgenciaIdOrderByFechaCreacionDesc(1L)).thenReturn(cotizaciones);
		when(ventaRepository.findTop10ByAgenciaIdOrderByFechaVentaDesc(1L)).thenReturn(ventas);

		var historial = service.historialComercial(1L);

		assertThat(historial).hasSize(15);
	}

	@Test
	void historialComercial_usaNumeroDeVentaComoTituloCuandoNoHayProducto() {
		Venta venta = venta("VTA-0010", LocalDateTime.now());
		venta.setProducto(null);
		when(cotizacionRepository.findTop10ByAgenciaIdOrderByFechaCreacionDesc(1L)).thenReturn(List.of());
		when(ventaRepository.findTop10ByAgenciaIdOrderByFechaVentaDesc(1L)).thenReturn(List.of(venta));

		var historial = service.historialComercial(1L);

		assertThat(historial.get(0).titulo()).isEqualTo("Venta VTA-0010");
	}

	@Test
	void historialComercial_usaElNombreDelPaqueteComoTituloCuandoExiste() {
		Venta venta = venta("VTA-0010", LocalDateTime.now());
		Paquete paquete = new Paquete();
		paquete.setNombre("Cusco Experiencia");
		venta.setProducto(paquete);
		when(cotizacionRepository.findTop10ByAgenciaIdOrderByFechaCreacionDesc(1L)).thenReturn(List.of());
		when(ventaRepository.findTop10ByAgenciaIdOrderByFechaVentaDesc(1L)).thenReturn(List.of(venta));

		var historial = service.historialComercial(1L);

		assertThat(historial.get(0).titulo()).isEqualTo("Cusco Experiencia");
	}

	@Test
	void notasSeguimiento_mapeaElUsernameCuandoHayUsuarioRegistrado() {
		InteraccionAgencia interaccion = new InteraccionAgencia();
		interaccion.setId(1L);
		interaccion.setTipo("LLAMADA");
		interaccion.setNotas("Cliente solicito actualizar propuesta");
		interaccion.setFecha(LocalDateTime.now());
		Usuario usuario = new Usuario();
		usuario.setUsername("ADM");
		interaccion.setUsuarioRegistro(usuario);
		when(interaccionAgenciaRepository.findByAgenciaIdOrderByFechaDesc(org.mockito.ArgumentMatchers.eq(1L),
				any())).thenReturn(List.of(interaccion));

		var notas = service.notasSeguimiento(1L);

		assertThat(notas).hasSize(1);
		assertThat(notas.get(0).usuario()).isEqualTo("ADM");
		assertThat(notas.get(0).tipo()).isEqualTo("LLAMADA");
	}

	@Test
	void notasSeguimiento_usuarioNullCuandoLaInteraccionNoTieneUsuarioRegistrado() {
		InteraccionAgencia interaccion = new InteraccionAgencia();
		interaccion.setId(2L);
		interaccion.setTipo("NOTA");
		interaccion.setFecha(LocalDateTime.now());
		when(interaccionAgenciaRepository.findByAgenciaIdOrderByFechaDesc(org.mockito.ArgumentMatchers.eq(1L),
				any())).thenReturn(List.of(interaccion));

		var notas = service.notasSeguimiento(1L);

		assertThat(notas.get(0).usuario()).isNull();
	}

	private Agencia agencia(Long id, String razonSocial, String nombreComercial) {
		Agencia agencia = new Agencia();
		agencia.setId(id);
		agencia.setRazonSocial(razonSocial);
		agencia.setNombreComercial(nombreComercial);
		agencia.setRuc("2010000000" + id);
		return agencia;
	}

	private Cotizacion cotizacion(String numero, LocalDateTime fechaCreacion) {
		Cotizacion cotizacion = new Cotizacion();
		cotizacion.setNumero(numero);
		cotizacion.setEstado("PENDIENTE");
		cotizacion.setFechaCreacion(fechaCreacion);
		return cotizacion;
	}

	private Venta venta(String numero, LocalDateTime fechaVenta) {
		Venta venta = new Venta();
		venta.setNumero(numero);
		venta.setEstado("CONFIRMADA");
		venta.setFechaVenta(fechaVenta);
		return venta;
	}

	private InteraccionAgenciaRepository.UltimaInteraccion mockUltimaInteraccion(Long agenciaId, LocalDateTime fecha) {
		return new InteraccionAgenciaRepository.UltimaInteraccion() {
			@Override
			public Long getAgenciaId() {
				return agenciaId;
			}

			@Override
			public LocalDateTime getUltimaFecha() {
				return fecha;
			}
		};
	}
}
