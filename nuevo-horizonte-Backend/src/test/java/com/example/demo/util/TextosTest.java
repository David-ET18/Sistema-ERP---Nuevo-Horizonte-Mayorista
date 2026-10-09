package com.example.demo.util;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class TextosTest {

	@Test
	void sinEspacios_recortaEspaciosAlInicioYFinal() {
		assertThat(Textos.sinEspacios("  Cusco  ")).isEqualTo("Cusco");
	}

	@Test
	void sinEspacios_devuelveNullCuandoElValorEsNull() {
		assertThat(Textos.sinEspacios(null)).isNull();
	}

	@Test
	void sinEspacios_devuelveNullCuandoQuedaVacioTrasRecortar() {
		assertThat(Textos.sinEspacios("   ")).isNull();
	}

	@Test
	void sinEspacios_cadenaVaciaDevuelveNull() {
		assertThat(Textos.sinEspacios("")).isNull();
	}

	@Test
	void noVacio_true_cuandoHayContenidoRealAunConEspaciosAlrededor() {
		assertThat(Textos.noVacio("  hola  ")).isTrue();
	}

	@Test
	void noVacio_false_cuandoEsNull() {
		assertThat(Textos.noVacio(null)).isFalse();
	}

	@Test
	void noVacio_false_cuandoSoloTieneEspacios() {
		assertThat(Textos.noVacio("   ")).isFalse();
	}

	@Test
	void primeroConContenido_devuelveElPrimerValorNoVacio() {
		assertThat(Textos.primeroConContenido(null, "  ", "Andes Travel", "Transportes SAC"))
				.isEqualTo("Andes Travel");
	}

	@Test
	void primeroConContenido_recortaElValorElegido() {
		assertThat(Textos.primeroConContenido("  Andes Travel  ")).isEqualTo("Andes Travel");
	}

	@Test
	void primeroConContenido_devuelveNullCuandoTodosEstanVacios() {
		assertThat(Textos.primeroConContenido(null, "", "   ")).isNull();
	}

	@Test
	void primeroConContenido_devuelveNullSinArgumentos() {
		assertThat(Textos.primeroConContenido()).isNull();
	}

	@Test
	void patronContiene_envuelveElValorNormalizadoEntrePorcentajes() {
		assertThat(Textos.patronContiene("  Cusco  ")).isEqualTo("%cusco%");
	}

	@Test
	void patronContiene_devuelveNullCuandoElValorEsVacio() {
		assertThat(Textos.patronContiene("   ")).isNull();
	}

	@Test
	void normalizar_pasaAMinusculasYRecorta() {
		assertThat(Textos.normalizar("  CUSCO  ")).isEqualTo("cusco");
	}

	@Test
	void normalizar_devuelveNullCuandoElValorEsNull() {
		assertThat(Textos.normalizar(null)).isNull();
	}
}
