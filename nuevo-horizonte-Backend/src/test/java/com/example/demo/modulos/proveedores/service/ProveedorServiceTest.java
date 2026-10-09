package com.example.demo.modulos.proveedores.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.server.ResponseStatusException;

import com.example.demo.modulos.catalogo.entity.Destino;
import com.example.demo.modulos.catalogo.repository.DestinoRepository;
import com.example.demo.modulos.catalogo.repository.ServicioRepository;
import com.example.demo.modulos.proveedores.dto.KpiProveedoresDTO;
import com.example.demo.modulos.proveedores.dto.ProveedorDetalleDTO;
import com.example.demo.modulos.proveedores.dto.ProveedorRequest;
import com.example.demo.modulos.proveedores.entity.Proveedor;
import com.example.demo.modulos.proveedores.repository.ProveedorRepository;

@ExtendWith(MockitoExtension.class)
class ProveedorServiceTest {

	@Mock
	private ProveedorRepository proveedorRepository;

	@Mock
	private DestinoRepository destinoRepository;

	@Mock
	private ServicioRepository servicioRepository;

	private ProveedorService service;

	@BeforeEach
	void setUp() {
		service = new ProveedorService(proveedorRepository, destinoRepository, servicioRepository);
	}

	@Test
	void tiposServicio_uneCategoriasDelCatalogoConLosTiposExistentesSinRepetir() {
		when(servicioRepository.findCategoriasActivas()).thenReturn(List.of("Hotel", "Tour"));
		when(proveedorRepository.findTiposServicio()).thenReturn(List.of("hotel", "Guia"));

		assertThat(service.tiposServicio()).containsExactly("Guia", "Hotel", "Tour");
	}

	@Test
	void crear_guardaElProveedorCuandoElRucNoExiste() {
		ProveedorRequest request = requestConRuc("20123456789", null);
		when(proveedorRepository.existsByRuc("20123456789")).thenReturn(false);
		when(proveedorRepository.save(any(Proveedor.class))).thenAnswer(inv -> {
			Proveedor p = inv.getArgument(0);
			p.setId(1L);
			return p;
		});

		ProveedorDetalleDTO resultado = service.crear(request);

		assertThat(resultado.id()).isEqualTo(1L);
		assertThat(resultado.razonSocial()).isEqualTo("Transportes Andinos SAC");
		verify(proveedorRepository).save(any(Proveedor.class));
	}

	@Test
	void crear_lanza409CuandoElRucYaExiste() {
		ProveedorRequest request = requestConRuc("20123456789", null);
		when(proveedorRepository.existsByRuc("20123456789")).thenReturn(true);

		assertThatThrownBy(() -> service.crear(request))
				.isInstanceOf(ResponseStatusException.class)
				.hasMessageContaining("409")
				.hasMessageContaining("20123456789");

		verify(proveedorRepository, never()).save(any());
	}

	@Test
	void crear_resuelveElDestinoCuandoSeIndicaUno() {
		ProveedorRequest request = requestConRuc("20123456789", 5L);
		Destino destino = new Destino();
		destino.setId(5L);
		when(proveedorRepository.existsByRuc("20123456789")).thenReturn(false);
		when(destinoRepository.findById(5L)).thenReturn(Optional.of(destino));
		when(proveedorRepository.save(any(Proveedor.class))).thenAnswer(inv -> inv.getArgument(0));

		service.crear(request);

		verify(destinoRepository).findById(5L);
	}

	@Test
	void crear_lanza404CuandoElDestinoIndicadoNoExiste() {
		ProveedorRequest request = requestConRuc("20123456789", 99L);
		when(proveedorRepository.existsByRuc("20123456789")).thenReturn(false);
		when(destinoRepository.findById(99L)).thenReturn(Optional.empty());

		assertThatThrownBy(() -> service.crear(request))
				.isInstanceOf(ResponseStatusException.class)
				.hasMessageContaining("404");

		verify(proveedorRepository, never()).save(any());
	}

	@Test
	void crear_noConsultaDestinoCuandoNoSeIndica() {
		ProveedorRequest request = requestConRuc("20123456789", null);
		when(proveedorRepository.existsByRuc("20123456789")).thenReturn(false);
		when(proveedorRepository.save(any(Proveedor.class))).thenAnswer(inv -> inv.getArgument(0));

		service.crear(request);

		verify(destinoRepository, never()).findById(any());
	}

	@Test
	void actualizar_excluyeElPropioIdAlValidarElRuc() {
		Proveedor existente = new Proveedor();
		existente.setId(3L);
		ProveedorRequest request = requestConRuc("20123456789", null);
		when(proveedorRepository.findById(3L)).thenReturn(Optional.of(existente));
		when(proveedorRepository.existsByRucAndIdNot("20123456789", 3L)).thenReturn(false);
		when(proveedorRepository.save(any(Proveedor.class))).thenAnswer(inv -> inv.getArgument(0));

		service.actualizar(3L, request);

		verify(proveedorRepository).existsByRucAndIdNot("20123456789", 3L);
		verify(proveedorRepository, never()).existsByRuc(any());
	}

	@Test
	void actualizar_lanza409CuandoElRucPerteneceAOtroProveedor() {
		Proveedor existente = new Proveedor();
		existente.setId(3L);
		ProveedorRequest request = requestConRuc("20123456789", null);
		when(proveedorRepository.existsByRucAndIdNot("20123456789", 3L)).thenReturn(true);

		assertThatThrownBy(() -> service.actualizar(3L, request))
				.isInstanceOf(ResponseStatusException.class)
				.hasMessageContaining("409");

		verify(proveedorRepository, never()).findById(any());
	}

	@Test
	void actualizar_lanza404CuandoElProveedorNoExiste() {
		ProveedorRequest request = requestConRuc("20123456789", null);
		when(proveedorRepository.existsByRucAndIdNot("20123456789", 99L)).thenReturn(false);
		when(proveedorRepository.findById(99L)).thenReturn(Optional.empty());

		assertThatThrownBy(() -> service.actualizar(99L, request))
				.isInstanceOf(ResponseStatusException.class)
				.hasMessageContaining("404");
	}

	@Test
	void obtener_lanza404CuandoNoExiste() {
		when(proveedorRepository.findById(123L)).thenReturn(Optional.empty());

		assertThatThrownBy(() -> service.obtener(123L))
				.isInstanceOf(ResponseStatusException.class)
				.hasMessageContaining("404");
	}

	@Test
	void obtener_devuelveElProveedorCuandoExiste() {
		Proveedor proveedor = new Proveedor();
		proveedor.setId(5L);
		when(proveedorRepository.findById(5L)).thenReturn(Optional.of(proveedor));

		assertThat(service.obtener(5L)).isSameAs(proveedor);
	}

	@Test
	void eliminar_desactivaElProveedorExistenteEnVezDeBorrarlo() {
		Proveedor proveedor = new Proveedor();
		proveedor.setId(5L);
		proveedor.setActivo(true);
		when(proveedorRepository.findById(5L)).thenReturn(Optional.of(proveedor));

		service.eliminar(5L);

		assertThat(proveedor.isActivo()).isFalse();
		verify(proveedorRepository).save(proveedor);
		@SuppressWarnings({ "unchecked", "rawtypes" })
		org.springframework.data.repository.CrudRepository rawRepository = proveedorRepository;
		verify(rawRepository, never()).delete(any());
	}

	@Test
	void eliminar_lanza404CuandoNoExisteYNoIntentaBorrar() {
		when(proveedorRepository.findById(5L)).thenReturn(Optional.empty());

		assertThatThrownBy(() -> service.eliminar(5L)).isInstanceOf(ResponseStatusException.class);

		@SuppressWarnings({ "unchecked", "rawtypes" })
		org.springframework.data.repository.CrudRepository rawRepository = proveedorRepository;
		verify(rawRepository, never()).delete(any());
	}

	@Test
	void kpis_combinaLosTresContadoresDelRepositorio() {
		when(proveedorRepository.countByActivoTrue()).thenReturn(48L);
		when(proveedorRepository.countRegistradosEsteMes()).thenReturn(6L);
		when(proveedorRepository.countSinTarifas()).thenReturn(4L);

		KpiProveedoresDTO kpis = service.kpis();

		assertThat(kpis.activos()).isEqualTo(48L);
		assertThat(kpis.nuevosEsteMes()).isEqualTo(6L);
		assertThat(kpis.sinTarifas()).isEqualTo(4L);
	}

	@Test
	void listar_delegaEnElRepositorioConLaEspecificacionYMapeaElResultado() {
		Proveedor proveedor = new Proveedor();
		proveedor.setId(1L);
		proveedor.setRazonSocial("Transportes Andinos SAC");
		Pageable pageable = PageRequest.of(0, 10);
		Page<Proveedor> pagina = new PageImpl<>(List.of(proveedor), pageable, 1);
		when(proveedorRepository.findAll(any(org.springframework.data.jpa.domain.Specification.class), eq(pageable)))
				.thenReturn(pagina);

		var resultado = service.listar("andes", null, true, null, pageable);

		assertThat(resultado.getTotalElements()).isEqualTo(1);
		assertThat(resultado.getContent().get(0).razonSocial()).isEqualTo("Transportes Andinos SAC");
	}

	private ProveedorRequest requestConRuc(String ruc, Long destinoId) {
		return new ProveedorRequest("Transportes Andinos SAC", "Andes Travel", ruc, "Transporte",
				"Juan Perez", "999888777", "contacto@andes.com", destinoId, "Condiciones comerciales",
				"Observacion", true);
	}
}
