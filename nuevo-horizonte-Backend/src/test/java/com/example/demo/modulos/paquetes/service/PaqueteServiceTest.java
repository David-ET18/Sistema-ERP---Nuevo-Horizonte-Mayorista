package com.example.demo.modulos.paquetes.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import com.example.demo.exception.NotFoundException;
import com.example.demo.modulos.catalogo.entity.Destino;
import com.example.demo.modulos.catalogo.repository.DestinoRepository;
import com.example.demo.modulos.paquetes.dto.KpiPaquetesDTO;
import com.example.demo.modulos.paquetes.dto.PaqueteDetalleDTO;
import com.example.demo.modulos.paquetes.dto.PaqueteOpcionRequest;
import com.example.demo.modulos.paquetes.dto.PaqueteRequest;
import com.example.demo.modulos.paquetes.dto.PaqueteVueloRequest;
import com.example.demo.modulos.paquetes.entity.Paquete;
import com.example.demo.modulos.paquetes.entity.PaqueteOpcion;
import com.example.demo.modulos.paquetes.entity.PaqueteVuelo;
import com.example.demo.modulos.paquetes.repository.PaqueteRepository;

@ExtendWith(MockitoExtension.class)
class PaqueteServiceTest {

	@Mock
	private PaqueteRepository paqueteRepository;

	@Mock
	private DestinoRepository destinoRepository;

	private PaqueteService service;

	@BeforeEach
	void setUp() {
		service = new PaqueteService(paqueteRepository, destinoRepository);
		org.mockito.Mockito.lenient().when(paqueteRepository.save(any(Paquete.class)))
				.thenAnswer(inv -> inv.getArgument(0));
	}

	@Test
	void crear_lanza409CuandoYaExisteUnPaqueteConElMismoNombre() {
		when(paqueteRepository.existsByNombre("Cusco Magico")).thenReturn(true);

		assertThatThrownBy(() -> service.crear(requestSinHijos("Cusco Magico")))
				.isInstanceOf(ResponseStatusException.class)
				.hasMessageContaining("409");

		verify(paqueteRepository, never()).save(any());
	}

	@Test
	void crear_lanza404CuandoElDestinoNoExiste() {
		when(paqueteRepository.existsByNombre("Cusco Magico")).thenReturn(false);
		when(destinoRepository.findById(1L)).thenReturn(Optional.empty());

		assertThatThrownBy(() -> service.crear(requestSinHijos("Cusco Magico")))
				.isInstanceOf(ResponseStatusException.class)
				.hasMessageContaining("404");
	}

	@Test
	void crear_guardaElPaqueteConSusVuelosYOpciones() {
		when(paqueteRepository.existsByNombre("Cusco Magico")).thenReturn(false);
		when(destinoRepository.findById(1L)).thenReturn(Optional.of(destino()));

		PaqueteDetalleDTO resultado = service.crear(requestConHijos("Cusco Magico"));

		assertThat(resultado.nombre()).isEqualTo("Cusco Magico");
		assertThat(resultado.vuelos()).hasSize(1);
		assertThat(resultado.opciones()).hasSize(2);
	}

	@Test
	void actualizar_excluyeElPropioIdAlValidarElNombre() {
		Paquete existente = new Paquete();
		existente.setId(7L);
		when(paqueteRepository.findById(7L)).thenReturn(Optional.of(existente));
		when(paqueteRepository.existsByNombreAndIdNot("Cusco Magico", 7L)).thenReturn(false);
		when(destinoRepository.findById(1L)).thenReturn(Optional.of(destino()));

		service.actualizar(7L, requestSinHijos("Cusco Magico"));

		verify(paqueteRepository).existsByNombreAndIdNot("Cusco Magico", 7L);
		verify(paqueteRepository, never()).existsByNombre(any());
	}

	@Test
	void actualizar_reemplazaLosVuelosYOpcionesExistentesPorLosNuevos() {
		Paquete existente = new Paquete();
		existente.setId(7L);
		PaqueteVuelo vueloViejo = new PaqueteVuelo();
		vueloViejo.setAerolinea("SKY AIRLINE");
		existente.getVuelos().add(vueloViejo);
		PaqueteOpcion opcionVieja = new PaqueteOpcion();
		opcionVieja.setHotelServicio("Hotel Viejo");
		existente.getOpciones().add(opcionVieja);

		when(paqueteRepository.findById(7L)).thenReturn(Optional.of(existente));
		when(paqueteRepository.existsByNombreAndIdNot("Cusco Magico", 7L)).thenReturn(false);
		when(destinoRepository.findById(1L)).thenReturn(Optional.of(destino()));

		PaqueteDetalleDTO resultado = service.actualizar(7L, requestConHijos("Cusco Magico"));

		assertThat(resultado.vuelos()).hasSize(1);
		assertThat(resultado.vuelos().get(0).aerolinea()).isEqualTo("LATAM");
		assertThat(resultado.opciones()).hasSize(2);
		assertThat(resultado.opciones()).noneMatch(o -> "Hotel Viejo".equals(o.hotelServicio()));
	}

	@Test
	void actualizar_dejaLasColeccionesVaciasCuandoElRequestNoTraeHijos() {
		Paquete existente = new Paquete();
		existente.setId(7L);
		PaqueteVuelo vueloViejo = new PaqueteVuelo();
		existente.getVuelos().add(vueloViejo);

		when(paqueteRepository.findById(7L)).thenReturn(Optional.of(existente));
		when(paqueteRepository.existsByNombreAndIdNot("Cusco Magico", 7L)).thenReturn(false);
		when(destinoRepository.findById(1L)).thenReturn(Optional.of(destino()));

		PaqueteDetalleDTO resultado = service.actualizar(7L, requestSinHijos("Cusco Magico"));

		assertThat(resultado.vuelos()).isEmpty();
	}

	@Test
	void actualizar_asignaElOrdenSecuencialAlReconstruirLosVuelos() {
		Paquete existente = new Paquete();
		existente.setId(7L);
		when(paqueteRepository.findById(7L)).thenReturn(Optional.of(existente));
		when(paqueteRepository.existsByNombreAndIdNot(any(), any())).thenReturn(false);
		when(destinoRepository.findById(1L)).thenReturn(Optional.of(destino()));

		PaqueteRequest request = new PaqueteRequest("Cusco Magico", null, 1L, null, null, null, null, "PEN", null,
				null, null, "BORRADOR", null,
				List.of(
						new PaqueteVueloRequest("LATAM", "Lima", "Cusco", java.time.LocalDateTime.now(),
								java.time.LocalDateTime.now().plusHours(1)),
						new PaqueteVueloRequest("SKY", "Cusco", "Lima", java.time.LocalDateTime.now(),
								java.time.LocalDateTime.now().plusHours(1))),
				null);

		service.actualizar(7L, request);

		assertThat(existente.getVuelos()).extracting(PaqueteVuelo::getOrden).containsExactly(0, 1);
	}

	@Test
	void eliminar_borraElPaqueteExistente() {
		Paquete paquete = new Paquete();
		paquete.setId(3L);
		when(paqueteRepository.findById(3L)).thenReturn(Optional.of(paquete));

		service.eliminar(3L);

		@SuppressWarnings({ "unchecked", "rawtypes" })
		org.springframework.data.repository.CrudRepository rawRepository = paqueteRepository;
		verify(rawRepository).delete(paquete);
	}

	@Test
	void obtener_lanzaNotFoundExceptionCuandoNoExiste() {
		when(paqueteRepository.findById(99L)).thenReturn(Optional.empty());

		assertThatThrownBy(() -> service.obtener(99L)).isInstanceOf(NotFoundException.class);
	}

	@Test
	void kpis_combinaLosTresContadoresDelRepositorio() {
		when(paqueteRepository.countByEstado("ACTIVO")).thenReturn(12L);
		when(paqueteRepository.countByEstado("BORRADOR")).thenReturn(3L);
		when(paqueteRepository.countByDestacadoTrue()).thenReturn(5L);

		KpiPaquetesDTO kpis = service.kpis();

		assertThat(kpis.publicados()).isEqualTo(12L);
		assertThat(kpis.borradores()).isEqualTo(3L);
		assertThat(kpis.destacados()).isEqualTo(5L);
	}

	@Test
	void listarActivos_mapeaLosPaquetesDelRepositorio() {
		Paquete paquete = new Paquete();
		paquete.setId(1L);
		paquete.setNombre("Cusco Magico");
		when(paqueteRepository.findActivos()).thenReturn(List.of(paquete));

		var resultado = service.listarActivos();

		assertThat(resultado).hasSize(1);
		assertThat(resultado.get(0).nombre()).isEqualTo("Cusco Magico");
	}

	private PaqueteRequest requestSinHijos(String nombre) {
		return new PaqueteRequest(nombre, "Resumen", 1L, null, null, null, "Nacional", "PEN", null, null, null,
				"BORRADOR", Set.of(), null, null);
	}

	private PaqueteRequest requestConHijos(String nombre) {
		return new PaqueteRequest(nombre, "Resumen", 1L, null, null, null, "Nacional", "PEN", null, null, null,
				"BORRADOR", Set.of("LATAM AIRLINES"),
				List.of(new PaqueteVueloRequest("LATAM", "Lima", "Cusco", java.time.LocalDateTime.now(),
						java.time.LocalDateTime.now().plusHours(1))),
				List.of(
						new PaqueteOpcionRequest("Hotel Paracas", java.time.LocalDate.now(),
								java.time.LocalDate.now().plusDays(5), "Desayuno incluido", null, null, null, null),
						new PaqueteOpcionRequest("Hotel Cusco", java.time.LocalDate.now(),
								java.time.LocalDate.now().plusDays(5), "Todo incluido", null, null, null, null)));
	}

	private Destino destino() {
		Destino destino = new Destino();
		destino.setId(1L);
		destino.setNombre("Cusco");
		return destino;
	}
}
