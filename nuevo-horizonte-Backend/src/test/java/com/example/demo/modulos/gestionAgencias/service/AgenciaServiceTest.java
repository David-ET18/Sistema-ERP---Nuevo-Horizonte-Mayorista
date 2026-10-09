package com.example.demo.modulos.gestionAgencias.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import com.example.demo.modulos.gestionAgencias.dto.AgenciaDetalleDTO;
import com.example.demo.modulos.gestionAgencias.dto.AgenciaRequest;
import com.example.demo.modulos.gestionAgencias.entity.Agencia;
import com.example.demo.modulos.gestionAgencias.repository.AgenciaRepository;

@ExtendWith(MockitoExtension.class)
class AgenciaServiceTest {

	@Mock
	private AgenciaRepository agenciaRepository;

	private AgenciaService service;

	@Test
	void crear_guardaCuandoElRucNoExiste() {
		service = new AgenciaService(agenciaRepository);
		when(agenciaRepository.existsByRuc("20123456789")).thenReturn(false);
		when(agenciaRepository.save(any(Agencia.class))).thenAnswer(inv -> {
			Agencia a = inv.getArgument(0);
			a.setId(1L);
			return a;
		});

		AgenciaDetalleDTO resultado = service.crear(requestConRuc("20123456789"));

		assertThat(resultado.id()).isEqualTo(1L);
	}

	@Test
	void crear_lanza409CuandoElRucYaExiste() {
		service = new AgenciaService(agenciaRepository);
		when(agenciaRepository.existsByRuc("20123456789")).thenReturn(true);

		assertThatThrownBy(() -> service.crear(requestConRuc("20123456789")))
				.isInstanceOf(ResponseStatusException.class)
				.hasMessageContaining("409");

		verify(agenciaRepository, never()).save(any());
	}

	@Test
	void actualizar_excluyeElPropioIdAlValidarElRuc() {
		service = new AgenciaService(agenciaRepository);
		Agencia existente = new Agencia();
		existente.setId(8L);
		when(agenciaRepository.existsByRucAndIdNot("20123456789", 8L)).thenReturn(false);
		when(agenciaRepository.findById(8L)).thenReturn(Optional.of(existente));
		when(agenciaRepository.save(any(Agencia.class))).thenAnswer(inv -> inv.getArgument(0));

		service.actualizar(8L, requestConRuc("20123456789"));

		verify(agenciaRepository).existsByRucAndIdNot("20123456789", 8L);
		verify(agenciaRepository, never()).existsByRuc(any());
	}

	@Test
	void actualizarLogo_asignaElArchivoYGuarda() {
		service = new AgenciaService(agenciaRepository);
		Agencia agencia = new Agencia();
		agencia.setId(2L);
		when(agenciaRepository.findById(2L)).thenReturn(Optional.of(agencia));
		when(agenciaRepository.save(any(Agencia.class))).thenAnswer(inv -> inv.getArgument(0));

		String resultado = service.actualizarLogo(2L, "logo_123.png");

		assertThat(resultado).isEqualTo("logo_123.png");
		assertThat(agencia.getLogoUrl()).isEqualTo("logo_123.png");
	}

	@Test
	void obtener_lanza404CuandoLaAgenciaNoExiste() {
		service = new AgenciaService(agenciaRepository);
		when(agenciaRepository.findById(99L)).thenReturn(Optional.empty());

		assertThatThrownBy(() -> service.obtener(99L)).isInstanceOf(ResponseStatusException.class);
	}

	@Test
	void kpis_combinaLosCuatroContadoresDelRepositorio() {
		service = new AgenciaService(agenciaRepository);
		when(agenciaRepository.count()).thenReturn(50L);
		when(agenciaRepository.countByActivoTrue()).thenReturn(45L);
		when(agenciaRepository.countByEsPrioritariaTrue()).thenReturn(10L);
		when(agenciaRepository.countRegistradasEsteMes()).thenReturn(3L);

		var kpis = service.kpis();

		assertThat(kpis.total()).isEqualTo(50L);
		assertThat(kpis.activas()).isEqualTo(45L);
		assertThat(kpis.prioritarias()).isEqualTo(10L);
		assertThat(kpis.registradasEsteMes()).isEqualTo(3L);
	}

	private AgenciaRequest requestConRuc(String ruc) {
		return new AgenciaRequest("Viajes Peru SAC", "Viajes Peru", ruc, "Premium", "Maria Lopez",
				"999888777", "maria@viajesperu.com", "Cusco", "Maria Lopez", true, true);
	}
}
