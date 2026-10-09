package com.example.demo.modulos.proveedores.mapper;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDateTime;

import org.junit.jupiter.api.Test;

import com.example.demo.modulos.catalogo.entity.Destino;
import com.example.demo.modulos.proveedores.dto.ProveedorDTO;
import com.example.demo.modulos.proveedores.dto.ProveedorDetalleDTO;
import com.example.demo.modulos.proveedores.dto.ProveedorListaDTO;
import com.example.demo.modulos.proveedores.dto.ProveedorRequest;
import com.example.demo.modulos.proveedores.entity.Proveedor;

class ProveedorMapperTest {

	@Test
	void nombre_usaNombreComercialCuandoExiste() {
		Proveedor proveedor = new Proveedor();
		proveedor.setRazonSocial("Transportes Andinos SAC");
		proveedor.setNombreComercial("Andes Travel");

		assertThat(ProveedorMapper.nombre(proveedor)).isEqualTo("Andes Travel");
	}

	@Test
	void nombre_usaRazonSocialCuandoNoHayNombreComercial() {
		Proveedor proveedor = new Proveedor();
		proveedor.setRazonSocial("Transportes Andinos SAC");
		proveedor.setNombreComercial(null);

		assertThat(ProveedorMapper.nombre(proveedor)).isEqualTo("Transportes Andinos SAC");
	}

	@Test
	void nombre_usaRazonSocialCuandoNombreComercialEsSoloEspacios() {
		Proveedor proveedor = new Proveedor();
		proveedor.setRazonSocial("Transportes Andinos SAC");
		proveedor.setNombreComercial("   ");

		assertThat(ProveedorMapper.nombre(proveedor)).isEqualTo("Transportes Andinos SAC");
	}

	@Test
	void nombre_devuelveNullCuandoElProveedorEsNull() {
		assertThat(ProveedorMapper.nombre(null)).isNull();
	}

	@Test
	void toRefDTO_mapeaCamposBasicos() {
		Proveedor proveedor = proveedorCompleto();

		ProveedorDTO dto = ProveedorMapper.toRefDTO(proveedor);

		assertThat(dto.id()).isEqualTo(1L);
		assertThat(dto.razonSocial()).isEqualTo("Transportes Andinos SAC");
		assertThat(dto.nombreComercial()).isEqualTo("Andes Travel");
		assertThat(dto.nombre()).isEqualTo("Andes Travel");
		assertThat(dto.ruc()).isEqualTo("20123456789");
		assertThat(dto.tipoProveedor()).isEqualTo("Transporte");
		assertThat(dto.activo()).isTrue();
	}

	@Test
	void toListaDTO_incluyeNombreDeDestinoCuandoExiste() {
		Proveedor proveedor = proveedorCompleto();
		Destino destino = new Destino();
		destino.setId(5L);
		destino.setNombre("Cusco");
		proveedor.setDestino(destino);

		ProveedorListaDTO dto = ProveedorMapper.toListaDTO(proveedor);

		assertThat(dto.destino()).isEqualTo("Cusco");
		assertThat(dto.condicionesComerciales()).isEqualTo("Condiciones comerciales");
	}

	@Test
	void toListaDTO_destinoNullCuandoProveedorSinDestino() {
		Proveedor proveedor = proveedorCompleto();
		proveedor.setDestino(null);

		ProveedorListaDTO dto = ProveedorMapper.toListaDTO(proveedor);

		assertThat(dto.destino()).isNull();
	}

	@Test
	void toDetalleDTO_incluyeIdYNombreDeDestino() {
		Proveedor proveedor = proveedorCompleto();
		Destino destino = new Destino();
		destino.setId(5L);
		destino.setNombre("Cusco");
		proveedor.setDestino(destino);

		ProveedorDetalleDTO dto = ProveedorMapper.toDetalleDTO(proveedor);

		assertThat(dto.destinoId()).isEqualTo(5L);
		assertThat(dto.destino()).isEqualTo("Cusco");
		assertThat(dto.observaciones()).isEqualTo("Proveedor confiable");
	}

	@Test
	void aplicar_recortaEspaciosEnTodosLosCamposDeTexto() {
		Proveedor proveedor = new Proveedor();
		ProveedorRequest request = new ProveedorRequest(
				"  Transportes Andinos SAC  ", " Andes Travel ", " 20123456789 ", " Transporte ",
				" Juan Perez ", " 999888777 ", " contacto@andes.com ", null, " Condiciones comerciales ",
				" Observacion ", null);

		ProveedorMapper.aplicar(proveedor, request, null);

		assertThat(proveedor.getRazonSocial()).isEqualTo("Transportes Andinos SAC");
		assertThat(proveedor.getNombreComercial()).isEqualTo("Andes Travel");
		assertThat(proveedor.getRuc()).isEqualTo("20123456789");
		assertThat(proveedor.getTipoProveedor()).isEqualTo("Transporte");
		assertThat(proveedor.getContactoNombre()).isEqualTo("Juan Perez");
		assertThat(proveedor.getContactoTelefono()).isEqualTo("999888777");
		assertThat(proveedor.getContactoEmail()).isEqualTo("contacto@andes.com");
		assertThat(proveedor.getCondicionesComerciales()).isEqualTo("Condiciones comerciales");
		assertThat(proveedor.getObservaciones()).isEqualTo("Observacion");
	}

	@Test
	void aplicar_asignaFechaCreacionSoloParaProveedorNuevo() {
		Proveedor nuevo = new Proveedor();
		ProveedorRequest request = requestMinimo();

		ProveedorMapper.aplicar(nuevo, request, null);

		assertThat(nuevo.getFechaCreacion()).isNotNull();
		assertThat(nuevo.getFechaActualizacion()).isNotNull();
	}

	@Test
	void aplicar_noSobrescribeFechaCreacionDeUnProveedorExistente() {
		Proveedor existente = new Proveedor();
		existente.setId(10L);
		LocalDateTime fechaOriginal = LocalDateTime.of(2020, 1, 1, 0, 0);
		existente.setFechaCreacion(fechaOriginal);

		ProveedorMapper.aplicar(existente, requestMinimo(), null);

		assertThat(existente.getFechaCreacion()).isEqualTo(fechaOriginal);
		assertThat(existente.getFechaActualizacion()).isAfter(fechaOriginal);
	}

	@Test
	void aplicar_noSobrescribeActivoCuandoVieneNull() {
		Proveedor proveedor = new Proveedor();
		proveedor.setActivo(false);

		ProveedorMapper.aplicar(proveedor, requestMinimo(), null);

		assertThat(proveedor.isActivo()).isFalse();
	}

	@Test
	void aplicar_sobrescribeActivoCuandoVieneInformado() {
		Proveedor proveedor = new Proveedor();
		proveedor.setActivo(true);
		ProveedorRequest request = new ProveedorRequest(
				"Razon", null, "20123456789", "Hotel", null, null, null, null, null, null, false);

		ProveedorMapper.aplicar(proveedor, request, null);

		assertThat(proveedor.isActivo()).isFalse();
	}

	@Test
	void aplicar_asignaDestinoRecibido() {
		Proveedor proveedor = new Proveedor();
		Destino destino = new Destino();
		destino.setId(7L);

		ProveedorMapper.aplicar(proveedor, requestMinimo(), destino);

		assertThat(proveedor.getDestino()).isSameAs(destino);
	}

	private ProveedorRequest requestMinimo() {
		return new ProveedorRequest("Razon Social", null, "20123456789", "Hotel", null, null, null, null, null,
				null, null);
	}

	private Proveedor proveedorCompleto() {
		Proveedor proveedor = new Proveedor();
		proveedor.setId(1L);
		proveedor.setRazonSocial("Transportes Andinos SAC");
		proveedor.setNombreComercial("Andes Travel");
		proveedor.setRuc("20123456789");
		proveedor.setTipoProveedor("Transporte");
		proveedor.setContactoNombre("Juan Perez");
		proveedor.setContactoTelefono("999888777");
		proveedor.setContactoEmail("contacto@andes.com");
		proveedor.setCondicionesComerciales("Condiciones comerciales");
		proveedor.setObservaciones("Proveedor confiable");
		proveedor.setActivo(true);
		proveedor.setFechaCreacion(LocalDateTime.now());
		proveedor.setFechaActualizacion(LocalDateTime.now());
		return proveedor;
	}
}
