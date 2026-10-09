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

import com.example.demo.modulos.catalogo.dto.ServicioRequest;
import com.example.demo.modulos.catalogo.entity.Servicio;
import com.example.demo.modulos.catalogo.repository.ServicioRepository;

@ExtendWith(MockitoExtension.class)
class ServicioServiceTest {

	@Mock
	private ServicioRepository servicioRepository;

	private ServicioService service;

	@BeforeEach
	void setUp() {
		service = new ServicioService(servicioRepository);
	}

	@Test
	void crear_guardaCuandoElNombreNoExiste() {
		when(servicioRepository.existsByNombreIgnoreCase("Tour Machu Picchu")).thenReturn(false);
		when(servicioRepository.save(any(Servicio.class))).thenAnswer(inv -> {
			Servicio s = inv.getArgument(0);
			s.setId(1L);
			return s;
		});

		var resultado = service.crear(new ServicioRequest(" Tour Machu Picchu ", " Tour ", null, null));

		assertThat(resultado.id()).isEqualTo(1L);
		assertThat(resultado.nombre()).isEqualTo("Tour Machu Picchu");
		assertThat(resultado.categoria()).isEqualTo("Tour");
		assertThat(resultado.activo()).isTrue();
	}

	@Test
	void crear_lanza409CuandoElNombreYaExiste() {
		when(servicioRepository.existsByNombreIgnoreCase("City Tour")).thenReturn(true);

		assertThatThrownBy(() -> service.crear(new ServicioRequest("City Tour", "Tour", null, true)))
				.isInstanceOf(ResponseStatusException.class)
				.hasMessageContaining("409");

		verify(servicioRepository, never()).save(any());
	}

	@Test
	void actualizar_excluyeElPropioIdAlValidarDuplicados() {
		Servicio existente = new Servicio();
		existente.setId(3L);
		when(servicioRepository.existsByNombreIgnoreCaseAndIdNot("City Tour", 3L)).thenReturn(false);
		when(servicioRepository.findById(3L)).thenReturn(Optional.of(existente));
		when(servicioRepository.save(any(Servicio.class))).thenAnswer(inv -> inv.getArgument(0));

		service.actualizar(3L, new ServicioRequest("City Tour", "Tour", "Recorrido por la ciudad", false));

		verify(servicioRepository).existsByNombreIgnoreCaseAndIdNot("City Tour", 3L);
		assertThat(existente.isActivo()).isFalse();
	}

	@Test
	void obtener_lanza404CuandoNoExiste() {
		when(servicioRepository.findById(99L)).thenReturn(Optional.empty());

		assertThatThrownBy(() -> service.obtener(99L)).isInstanceOf(ResponseStatusException.class);
	}

	@Test
	void eliminar_lanza409AconsejandoDesactivarCuandoElServicioEstaEnUso() {
		Servicio servicio = new Servicio();
		servicio.setId(3L);
		when(servicioRepository.findById(3L)).thenReturn(Optional.of(servicio));
		doThrow(new DataIntegrityViolationException("fk")).when(servicioRepository).flush();

		assertThatThrownBy(() -> service.eliminar(3L))
				.isInstanceOf(ResponseStatusException.class)
				.hasMessageContaining("409")
				.hasMessageContaining("Desactivalo");
	}

	@Test
	void eliminar_borraYHaceFlushCuandoNoEstaEnUso() {
		Servicio servicio = new Servicio();
		servicio.setId(3L);
		when(servicioRepository.findById(3L)).thenReturn(Optional.of(servicio));

		service.eliminar(3L);

		verify(servicioRepository).flush();
	}
}
