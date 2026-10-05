package com.example.demo.modulos.catalogo.mapper;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

import com.example.demo.modulos.catalogo.dto.DestinoRequest;
import com.example.demo.modulos.catalogo.dto.ServicioRequest;
import com.example.demo.modulos.catalogo.entity.Destino;
import com.example.demo.modulos.catalogo.entity.Servicio;

class CatalogoMapperTest {

	@Test
	void destino_aplicar_recortaTextoYDejaNullLoVacio() {
		Destino destino = new Destino();

		DestinoMapper.aplicar(destino, new DestinoRequest("  Cusco  ", " Peru ", "   ", null));

		assertThat(destino.getNombre()).isEqualTo("Cusco");
		assertThat(destino.getPais()).isEqualTo("Peru");
		assertThat(destino.getDescripcion()).isNull();
	}

	@Test
	void destino_aplicar_noSobrescribeActivoCuandoVieneNull() {
		Destino destino = new Destino();
		destino.setActivo(false);

		DestinoMapper.aplicar(destino, new DestinoRequest("Cusco", "Peru", null, null));

		assertThat(destino.isActivo()).isFalse();
	}

	@Test
	void destino_aplicar_sobrescribeActivoCuandoVieneInformado() {
		Destino destino = new Destino();
		destino.setActivo(false);

		DestinoMapper.aplicar(destino, new DestinoRequest("Cusco", "Peru", null, true));

		assertThat(destino.isActivo()).isTrue();
	}

	@Test
	void destino_toDTO_exponeSoloLoNecesarioParaLosSelects() {
		Destino destino = new Destino();
		destino.setId(1L);
		destino.setNombre("Cusco");
		destino.setPais("Peru");

		var dto = DestinoMapper.toDTO(destino);

		assertThat(dto.id()).isEqualTo(1L);
		assertThat(dto.nombre()).isEqualTo("Cusco");
		assertThat(dto.pais()).isEqualTo("Peru");
	}

	@Test
	void servicio_aplicar_recortaTextoYManejaActivo() {
		Servicio servicio = new Servicio();
		servicio.setActivo(true);

		ServicioMapper.aplicar(servicio, new ServicioRequest(" City Tour ", " Tour ", "  ", false));

		assertThat(servicio.getNombre()).isEqualTo("City Tour");
		assertThat(servicio.getCategoria()).isEqualTo("Tour");
		assertThat(servicio.getDescripcion()).isNull();
		assertThat(servicio.isActivo()).isFalse();
	}

	@Test
	void servicio_toDetalleDTO_incluyeDescripcionYEstado() {
		Servicio servicio = new Servicio();
		servicio.setId(2L);
		servicio.setNombre("City Tour");
		servicio.setDescripcion("Recorrido");

		var dto = ServicioMapper.toDetalleDTO(servicio);

		assertThat(dto.descripcion()).isEqualTo("Recorrido");
		assertThat(dto.activo()).isTrue();
	}
}
