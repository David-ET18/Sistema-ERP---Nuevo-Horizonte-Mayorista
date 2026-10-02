package com.example.demo.modulos.paquetes.mapper;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

import org.junit.jupiter.api.Test;

import com.example.demo.modulos.catalogo.entity.Destino;
import com.example.demo.modulos.paquetes.dto.PaqueteOpcionRequest;
import com.example.demo.modulos.paquetes.dto.PaqueteRequest;
import com.example.demo.modulos.paquetes.dto.PaqueteVueloRequest;
import com.example.demo.modulos.paquetes.entity.Paquete;
import com.example.demo.modulos.paquetes.entity.PaqueteOpcion;
import com.example.demo.modulos.paquetes.entity.PaqueteVuelo;

class PaqueteMapperTest {

	@Test
	void aplicar_usaPenPorDefectoCuandoNoSeIndicaMoneda() {
		Paquete paquete = new Paquete();

		PaqueteMapper.aplicar(paquete, requestMinimo(null), destino());

		assertThat(paquete.getMoneda()).isEqualTo("PEN");
	}

	@Test
	void aplicar_usaPenPorDefectoCuandoLaMonedaEsSoloEspacios() {
		Paquete paquete = new Paquete();

		PaqueteMapper.aplicar(paquete, requestMinimo("   "), destino());

		assertThat(paquete.getMoneda()).isEqualTo("PEN");
	}

	@Test
	void aplicar_respetaLaMonedaIndicada() {
		Paquete paquete = new Paquete();

		PaqueteMapper.aplicar(paquete, requestMinimo("USD"), destino());

		assertThat(paquete.getMoneda()).isEqualTo("USD");
	}

	@Test
	void aplicar_noSobrescribeDestacadoCuandoVieneNull() {
		Paquete paquete = new Paquete();
		paquete.setDestacado(true);
		PaqueteRequest request = new PaqueteRequest("Cusco Magico", null, 1L, null, null, null, null, "PEN", null,
				null, null, "BORRADOR", Set.of(), List.of(), List.of());

		PaqueteMapper.aplicar(paquete, request, destino());

		assertThat(paquete.isDestacado()).isTrue();
	}

	@Test
	void aplicar_sobrescribeDestacadoCuandoVieneInformado() {
		Paquete paquete = new Paquete();
		paquete.setDestacado(true);

		PaqueteMapper.aplicar(paquete, requestConDestacado(false), destino());

		assertThat(paquete.isDestacado()).isFalse();
	}

	@Test
	void aplicar_copiaElSetDeAliadosEnUnoNuevo() {
		Paquete paquete = new Paquete();
		Set<String> aliadosOriginales = Set.of("LATAM AIRLINES", "SKY AIRLINE");
		PaqueteRequest request = new PaqueteRequest("Cusco Magico", null, 1L, null, null, null, null, "PEN", null,
				null, true, "BORRADOR", aliadosOriginales, List.of(), List.of());

		PaqueteMapper.aplicar(paquete, request, destino());

		assertThat(paquete.getAliados()).containsExactlyInAnyOrder("LATAM AIRLINES", "SKY AIRLINE");
		assertThat(paquete.getAliados()).isNotSameAs(aliadosOriginales);
	}

	@Test
	void aplicar_aliadosVacioCuandoElRequestTraeNull() {
		Paquete paquete = new Paquete();
		paquete.getAliados().add("ALGO_VIEJO");

		PaqueteMapper.aplicar(paquete, requestMinimo("PEN"), destino());

		assertThat(paquete.getAliados()).isEmpty();
	}

	@Test
	void aplicar_asignaFechaCreacionSoloEnAltaYSiempreActualizaFechaActualizacion() {
		Paquete nuevo = new Paquete();
		PaqueteMapper.aplicar(nuevo, requestMinimo("PEN"), destino());
		assertThat(nuevo.getFechaCreacion()).isNotNull();

		Paquete existente = new Paquete();
		existente.setId(5L);
		LocalDateTime creacionOriginal = LocalDateTime.of(2020, 1, 1, 0, 0);
		existente.setFechaCreacion(creacionOriginal);

		PaqueteMapper.aplicar(existente, requestMinimo("PEN"), destino());

		assertThat(existente.getFechaCreacion()).isEqualTo(creacionOriginal);
		assertThat(existente.getFechaActualizacion()).isAfter(creacionOriginal);
	}

	@Test
	void nuevoVuelo_asignaElPaqueteYElOrdenRecibidos() {
		Paquete paquete = new Paquete();
		PaqueteVueloRequest request = new PaqueteVueloRequest("LATAM", "Lima", "Cusco",
				LocalDateTime.of(2026, 6, 1, 8, 0), LocalDateTime.of(2026, 6, 1, 9, 30));

		PaqueteVuelo vuelo = PaqueteMapper.nuevoVuelo(paquete, request, 2);

		assertThat(vuelo.getPaquete()).isSameAs(paquete);
		assertThat(vuelo.getAerolinea()).isEqualTo("LATAM");
		assertThat(vuelo.getOrigen()).isEqualTo("Lima");
		assertThat(vuelo.getDestino()).isEqualTo("Cusco");
		assertThat(vuelo.getOrden()).isEqualTo(2);
	}

	@Test
	void nuevaOpcion_usaCeroCuandoLosPreciosVienenNull() {
		Paquete paquete = new Paquete();
		PaqueteOpcionRequest request = new PaqueteOpcionRequest("Hotel Paracas", LocalDate.of(2026, 1, 1),
				LocalDate.of(2026, 1, 10), "Desayuno incluido", null, null, null, null);

		PaqueteOpcion opcion = PaqueteMapper.nuevaOpcion(paquete, request, 0);

		assertThat(opcion.getPrecioSimple()).isEqualByComparingTo(BigDecimal.ZERO);
		assertThat(opcion.getPrecioDoble()).isEqualByComparingTo(BigDecimal.ZERO);
		assertThat(opcion.getPrecioTriple()).isEqualByComparingTo(BigDecimal.ZERO);
		assertThat(opcion.getPrecioNino()).isEqualByComparingTo(BigDecimal.ZERO);
	}

	@Test
	void nuevaOpcion_respetaLosPreciosIndicados() {
		Paquete paquete = new Paquete();
		PaqueteOpcionRequest request = new PaqueteOpcionRequest("Hotel Paracas", LocalDate.of(2026, 1, 1),
				LocalDate.of(2026, 1, 10), "Desayuno incluido", new BigDecimal("320.00"), new BigDecimal("280.00"),
				new BigDecimal("250.00"), new BigDecimal("150.00"));

		PaqueteOpcion opcion = PaqueteMapper.nuevaOpcion(paquete, request, 0);

		assertThat(opcion.getPrecioSimple()).isEqualByComparingTo("320.00");
		assertThat(opcion.getPrecioDoble()).isEqualByComparingTo("280.00");
	}

	@Test
	void toListaDTO_destinoNullCuandoNoHayDestinoAsignado() {
		Paquete paquete = new Paquete();
		paquete.setNombre("Cusco Magico");

		var dto = PaqueteMapper.toListaDTO(paquete);

		assertThat(dto.destino()).isNull();
		assertThat(dto.nombre()).isEqualTo("Cusco Magico");
	}

	@Test
	void toDetalleDTO_incluyeVuelosYOpcionesMapeados() {
		Paquete paquete = new Paquete();
		paquete.setNombre("Cusco Magico");
		paquete.setDestino(destino());
		PaqueteVuelo vuelo = PaqueteMapper.nuevoVuelo(paquete,
				new PaqueteVueloRequest("LATAM", "Lima", "Cusco", LocalDateTime.now(), LocalDateTime.now().plusHours(1)), 0);
		paquete.getVuelos().add(vuelo);

		var dto = PaqueteMapper.toDetalleDTO(paquete);

		assertThat(dto.vuelos()).hasSize(1);
		assertThat(dto.vuelos().get(0).aerolinea()).isEqualTo("LATAM");
		assertThat(dto.destinoId()).isEqualTo(10L);
	}

	private PaqueteRequest requestMinimo(String moneda) {
		return new PaqueteRequest("Cusco Magico", "Resumen", 1L, null, null, null, "Nacional", moneda, null, null,
				null, "BORRADOR", null, null, null);
	}

	private PaqueteRequest requestConDestacado(boolean destacado) {
		return new PaqueteRequest("Cusco Magico", null, 1L, null, null, null, null, "PEN", null, null, destacado,
				"BORRADOR", Set.of(), List.of(), List.of());
	}

	private Destino destino() {
		Destino destino = new Destino();
		destino.setId(10L);
		destino.setNombre("Cusco");
		return destino;
	}
}
