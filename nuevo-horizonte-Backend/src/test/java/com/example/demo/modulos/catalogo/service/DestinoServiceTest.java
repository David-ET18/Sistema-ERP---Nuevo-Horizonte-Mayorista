package com.example.demo.modulos.catalogo.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.web.server.ResponseStatusException;

import com.example.demo.modulos.catalogo.dto.DestinoRequest;
import com.example.demo.modulos.catalogo.entity.Destino;
import com.example.demo.modulos.catalogo.repository.DestinoRepository;

@ExtendWith(MockitoExtension.class)
class DestinoServiceTest {

	@Mock
	private DestinoRepository destinoRepository;

	private DestinoService service;

	@BeforeEach
	void setUp() {
		service = new DestinoService(destinoRepository);
	}

	@Test
	void crear_guardaCuandoNoExisteElMismoNombreEnElMismoPais() {
		when(destinoRepository.existsByNombreIgnoreCaseAndPaisIgnoreCase("Cusco", "Peru")).thenReturn(false);
		when(destinoRepository.save(any(Destino.class))).thenAnswer(inv -> {
			Destino d = inv.getArgument(0);
			d.setId(1L);
			return d;
		});

		var resultado = service.crear(new DestinoRequest("  Cusco ", " Peru ", null, null));

		assertThat(resultado.id()).isEqualTo(1L);
		assertThat(resultado.nombre()).isEqualTo("Cusco");
		assertThat(resultado.activo()).isTrue();
	}

	@Test
	void crear_lanza409CuandoYaExisteElDestinoEnElPais() {
		when(destinoRepository.existsByNombreIgnoreCaseAndPaisIgnoreCase("Cusco", "Peru")).thenReturn(true);

		assertThatThrownBy(() -> service.crear(new DestinoRequest("Cusco", "Peru", null, true)))
				.isInstanceOf(ResponseStatusException.class)
				.hasMessageContaining("409");

		verify(destinoRepository, never()).save(any());
	}

	@Test
	void actualizar_excluyeElPropioIdAlValidarDuplicados() {
		Destino existente = new Destino();
		existente.setId(4L);
		when(destinoRepository.existsByNombreIgnoreCaseAndPaisIgnoreCaseAndIdNot("Cusco", "Peru", 4L))
				.thenReturn(false);
		when(destinoRepository.findById(4L)).thenReturn(Optional.of(existente));
		when(destinoRepository.save(any(Destino.class))).thenAnswer(inv -> inv.getArgument(0));

		service.actualizar(4L, new DestinoRequest("Cusco", "Peru", "Capital historica", true));

		verify(destinoRepository).existsByNombreIgnoreCaseAndPaisIgnoreCaseAndIdNot("Cusco", "Peru", 4L);
		assertThat(existente.getDescripcion()).isEqualTo("Capital historica");
	}

	@Test
	void actualizar_puedeDesactivarUnDestino() {
		Destino existente = new Destino();
		existente.setId(4L);
		when(destinoRepository.existsByNombreIgnoreCaseAndPaisIgnoreCaseAndIdNot(any(), any(), any()))
				.thenReturn(false);
		when(destinoRepository.findById(4L)).thenReturn(Optional.of(existente));
		when(destinoRepository.save(any(Destino.class))).thenAnswer(inv -> inv.getArgument(0));

		var resultado = service.actualizar(4L, new DestinoRequest("Cusco", "Peru", null, false));

		assertThat(resultado.activo()).isFalse();
	}

	@Test
	void obtener_lanza404CuandoNoExiste() {
		when(destinoRepository.findById(99L)).thenReturn(Optional.empty());

		assertThatThrownBy(() -> service.obtener(99L))
				.isInstanceOf(ResponseStatusException.class)
				.hasMessageContaining("404");
	}

	@Test
	void eliminar_borraYHaceFlushParaDetectarRestriccionesEnElMomento() {
		Destino destino = new Destino();
		destino.setId(4L);
		when(destinoRepository.findById(4L)).thenReturn(Optional.of(destino));

		service.eliminar(4L);

		verify(destinoRepository).flush();
	}

	@Test
	void eliminar_lanza409AconsejandoDesactivarCuandoElDestinoEstaEnUso() {
		Destino destino = new Destino();
		destino.setId(4L);
		when(destinoRepository.findById(4L)).thenReturn(Optional.of(destino));
		doThrow(new DataIntegrityViolationException("fk")).when(destinoRepository).flush();

		assertThatThrownBy(() -> service.eliminar(4L))
				.isInstanceOf(ResponseStatusException.class)
				.hasMessageContaining("409")
				.hasMessageContaining("Desactivalo");
	}

	@Test
	void paises_delegaEnElRepositorio() {
		when(destinoRepository.findPaises()).thenReturn(java.util.List.of("Mexico", "Peru"));

		assertThat(service.paises()).containsExactly("Mexico", "Peru");
	}
}
