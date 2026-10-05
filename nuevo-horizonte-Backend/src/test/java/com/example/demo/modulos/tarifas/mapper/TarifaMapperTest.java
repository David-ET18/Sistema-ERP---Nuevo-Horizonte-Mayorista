package com.example.demo.modulos.tarifas.mapper;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import org.junit.jupiter.api.Test;

import com.example.demo.modulos.catalogo.entity.Destino;
import com.example.demo.modulos.catalogo.entity.Servicio;
import com.example.demo.modulos.proveedores.entity.Proveedor;
import com.example.demo.modulos.tarifas.dto.TarifaRequest;
import com.example.demo.modulos.tarifas.entity.Tarifa;
import com.example.demo.modulos.tarifas.entity.TarifaHistorial;

class TarifaMapperTest {

	// --- calcularEstado: la pieza de logica mas delicada del modulo ---

	@Test
	void calcularEstado_vencidaCuandoLaFechaHastaEsAyer() {
		LocalDate ayer = LocalDate.now().minusDays(1);

		assertThat(TarifaMapper.calcularEstado(ayer)).isEqualTo(TarifaMapper.ESTADO_VENCIDA);
	}

	@Test
	void calcularEstado_porVencerCuandoLaFechaHastaEsHoy() {
		assertThat(TarifaMapper.calcularEstado(LocalDate.now())).isEqualTo(TarifaMapper.ESTADO_POR_VENCER);
	}

	@Test
	void calcularEstado_porVencerCuandoFaltanExactamente7Dias() {
		LocalDate limite = LocalDate.now().plusDays(7);

		assertThat(TarifaMapper.calcularEstado(limite)).isEqualTo(TarifaMapper.ESTADO_POR_VENCER);
	}

	@Test
	void calcularEstado_vigenteCuandoFaltan8Dias() {
		LocalDate masDeUnaSemana = LocalDate.now().plusDays(8);

		assertThat(TarifaMapper.calcularEstado(masDeUnaSemana)).isEqualTo(TarifaMapper.ESTADO_VIGENTE);
	}

	@Test
	void calcularEstado_vigenteCuandoFaltaMuchoTiempo() {
		LocalDate lejos = LocalDate.now().plusMonths(6);

		assertThat(TarifaMapper.calcularEstado(lejos)).isEqualTo(TarifaMapper.ESTADO_VIGENTE);
	}

	@Test
	void calcularEstado_vigentePorDefectoCuandoLaFechaEsNull() {
		assertThat(TarifaMapper.calcularEstado(null)).isEqualTo(TarifaMapper.ESTADO_VIGENTE);
	}

	// --- Mapeo de DTOs ---

	@Test
	void toListaDTO_incluyeElEstadoCalculado() {
		Tarifa tarifa = tarifaCompleta();
		tarifa.setFechaHasta(LocalDate.now().minusDays(1));

		var dto = TarifaMapper.toListaDTO(tarifa);

		assertThat(dto.estado()).isEqualTo(TarifaMapper.ESTADO_VENCIDA);
		assertThat(dto.proveedor()).isEqualTo("Andes Travel");
	}

	@Test
	void toDetalleDTO_incluyeElHistorialMapeado() {
		Tarifa tarifa = tarifaCompleta();
		TarifaHistorial historial = new TarifaHistorial();
		historial.setPrecioAnterior(new BigDecimal("300.00"));
		historial.setPrecioNuevo(new BigDecimal("320.00"));
		historial.setFechaCambio(LocalDateTime.now());
		tarifa.getHistorial().add(historial);

		var dto = TarifaMapper.toDetalleDTO(tarifa);

		assertThat(dto.historial()).hasSize(1);
		assertThat(dto.historial().get(0).precioAnterior()).isEqualByComparingTo("300.00");
		assertThat(dto.historial().get(0).usuarioCambio()).isNull();
	}

	@Test
	void toHistorialDTO_incluyeElUsernameCuandoHayUsuario() {
		TarifaHistorial historial = new TarifaHistorial();
		historial.setPrecioNuevo(new BigDecimal("100.00"));
		historial.setFechaCambio(LocalDateTime.now());
		com.example.demo.modulos.gestionUsuariosRolesPermisos.entity.Usuario usuario =
				new com.example.demo.modulos.gestionUsuariosRolesPermisos.entity.Usuario();
		usuario.setUsername("ADM");
		historial.setUsuarioCambio(usuario);

		var dto = TarifaMapper.toHistorialDTO(historial);

		assertThat(dto.usuarioCambio()).isEqualTo("ADM");
	}

	// --- aplicar() ---

	@Test
	void aplicar_usaPenPorDefectoCuandoNoSeIndicaMoneda() {
		Tarifa tarifa = new Tarifa();

		TarifaMapper.aplicar(tarifa, requestConMoneda(null), proveedor(), servicio(), destino());

		assertThat(tarifa.getMoneda()).isEqualTo("PEN");
	}

	@Test
	void aplicar_respetaLaMonedaIndicada() {
		Tarifa tarifa = new Tarifa();

		TarifaMapper.aplicar(tarifa, requestConMoneda("USD"), proveedor(), servicio(), destino());

		assertThat(tarifa.getMoneda()).isEqualTo("USD");
	}

	@Test
	void aplicar_asignaLasTresRelaciones() {
		Tarifa tarifa = new Tarifa();
		Proveedor proveedor = proveedor();
		Servicio servicio = servicio();
		Destino destino = destino();

		TarifaMapper.aplicar(tarifa, requestConMoneda("PEN"), proveedor, servicio, destino);

		assertThat(tarifa.getProveedor()).isSameAs(proveedor);
		assertThat(tarifa.getServicio()).isSameAs(servicio);
		assertThat(tarifa.getDestino()).isSameAs(destino);
	}

	@Test
	void aplicar_asignaFechaCreacionSoloEnAlta() {
		Tarifa nueva = new Tarifa();
		TarifaMapper.aplicar(nueva, requestConMoneda("PEN"), proveedor(), servicio(), destino());
		assertThat(nueva.getFechaCreacion()).isNotNull();

		Tarifa existente = new Tarifa();
		existente.setId(5L);
		LocalDateTime original = LocalDateTime.of(2020, 1, 1, 0, 0);
		existente.setFechaCreacion(original);

		TarifaMapper.aplicar(existente, requestConMoneda("PEN"), proveedor(), servicio(), destino());

		assertThat(existente.getFechaCreacion()).isEqualTo(original);
		assertThat(existente.getFechaActualizacion()).isAfter(original);
	}

	private TarifaRequest requestConMoneda(String moneda) {
		return new TarifaRequest(1L, 2L, 3L, "Estandar", new BigDecimal("320.00"), moneda,
				LocalDate.now(), LocalDate.now().plusMonths(1), "Condiciones", "Observaciones");
	}

	private Tarifa tarifaCompleta() {
		Tarifa tarifa = new Tarifa();
		tarifa.setId(1L);
		tarifa.setProveedor(proveedor());
		tarifa.setServicio(servicio());
		tarifa.setDestino(destino());
		tarifa.setPrecio(new BigDecimal("320.00"));
		tarifa.setMoneda("PEN");
		tarifa.setFechaDesde(LocalDate.now());
		tarifa.setFechaHasta(LocalDate.now().plusMonths(1));
		tarifa.setFechaActualizacion(LocalDateTime.now());
		return tarifa;
	}

	private Proveedor proveedor() {
		Proveedor proveedor = new Proveedor();
		proveedor.setId(1L);
		proveedor.setNombreComercial("Andes Travel");
		proveedor.setRazonSocial("Andes Travel SAC");
		return proveedor;
	}

	private Servicio servicio() {
		Servicio servicio = new Servicio();
		servicio.setId(2L);
		servicio.setNombre("Tour Machu Picchu");
		return servicio;
	}

	private Destino destino() {
		Destino destino = new Destino();
		destino.setId(3L);
		destino.setNombre("Cusco");
		return destino;
	}
}
