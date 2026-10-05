package com.example.demo.modulos.gestionAgencias.mapper;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDateTime;

import org.junit.jupiter.api.Test;

import com.example.demo.modulos.gestionAgencias.dto.AgenciaRequest;
import com.example.demo.modulos.gestionAgencias.entity.Agencia;

class AgenciaMapperTest {

	@Test
	void nombre_usaNombreComercialCuandoExiste() {
		Agencia agencia = new Agencia();
		agencia.setRazonSocial("Viajes Peru SAC");
		agencia.setNombreComercial("Viajes Peru");

		assertThat(AgenciaMapper.nombre(agencia)).isEqualTo("Viajes Peru");
	}

	@Test
	void nombre_usaRazonSocialCuandoNoHayNombreComercial() {
		Agencia agencia = new Agencia();
		agencia.setRazonSocial("Viajes Peru SAC");

		assertThat(AgenciaMapper.nombre(agencia)).isEqualTo("Viajes Peru SAC");
	}

	@Test
	void toListaDTO_incluyeCamposDeContactoYCategoria() {
		Agencia agencia = agenciaCompleta();

		var dto = AgenciaMapper.toListaDTO(agencia);

		assertThat(dto.razonSocial()).isEqualTo("Viajes Peru SAC");
		assertThat(dto.categoria()).isEqualTo("Premium");
		assertThat(dto.esPrioritaria()).isTrue();
	}

	@Test
	void toDetalleDTO_incluyeCiudadYEjecutivoAsignado() {
		Agencia agencia = agenciaCompleta();

		var dto = AgenciaMapper.toDetalleDTO(agencia);

		assertThat(dto.ciudad()).isEqualTo("Cusco");
		assertThat(dto.ejecutivoAsignado()).isEqualTo("Maria Lopez");
	}

	@Test
	void aplicar_recortaEspaciosEnLosCamposDeTexto() {
		Agencia agencia = new Agencia();
		AgenciaRequest request = new AgenciaRequest("  Viajes Peru SAC  ", " Viajes Peru ", " 20123456789 ",
				" Premium ", " Maria Lopez ", " 999888777 ", " contacto@viajesperu.com ", " Cusco ",
				" Maria Lopez ", null, null);

		AgenciaMapper.aplicar(agencia, request);

		assertThat(agencia.getRazonSocial()).isEqualTo("Viajes Peru SAC");
		assertThat(agencia.getCiudad()).isEqualTo("Cusco");
		assertThat(agencia.getEjecutivoAsignado()).isEqualTo("Maria Lopez");
	}

	@Test
	void aplicar_noSobrescribeEsPrioritariaCuandoVieneNull() {
		Agencia agencia = new Agencia();
		agencia.setEsPrioritaria(true);

		AgenciaMapper.aplicar(agencia, requestMinimo());

		assertThat(agencia.isEsPrioritaria()).isTrue();
	}

	@Test
	void aplicar_noSobrescribeActivoCuandoVieneNull() {
		Agencia agencia = new Agencia();
		agencia.setActivo(false);

		AgenciaMapper.aplicar(agencia, requestMinimo());

		assertThat(agencia.isActivo()).isFalse();
	}

	@Test
	void aplicar_asignaFechaCreacionSoloEnAlta() {
		Agencia nueva = new Agencia();
		AgenciaMapper.aplicar(nueva, requestMinimo());
		assertThat(nueva.getFechaCreacion()).isNotNull();

		Agencia existente = new Agencia();
		existente.setId(1L);
		LocalDateTime original = LocalDateTime.of(2020, 1, 1, 0, 0);
		existente.setFechaCreacion(original);

		AgenciaMapper.aplicar(existente, requestMinimo());

		assertThat(existente.getFechaCreacion()).isEqualTo(original);
	}

	private AgenciaRequest requestMinimo() {
		return new AgenciaRequest("Viajes Peru SAC", null, "20123456789", null, null, null, null, null, null,
				null, null);
	}

	private Agencia agenciaCompleta() {
		Agencia agencia = new Agencia();
		agencia.setId(1L);
		agencia.setRazonSocial("Viajes Peru SAC");
		agencia.setNombreComercial("Viajes Peru");
		agencia.setRuc("20123456789");
		agencia.setCategoria("Premium");
		agencia.setEsPrioritaria(true);
		agencia.setContactoNombre("Maria Lopez");
		agencia.setContactoTelefono("999888777");
		agencia.setContactoEmail("maria@viajesperu.com");
		agencia.setCiudad("Cusco");
		agencia.setEjecutivoAsignado("Maria Lopez");
		agencia.setActivo(true);
		agencia.setFechaCreacion(LocalDateTime.now());
		return agencia;
	}
}
