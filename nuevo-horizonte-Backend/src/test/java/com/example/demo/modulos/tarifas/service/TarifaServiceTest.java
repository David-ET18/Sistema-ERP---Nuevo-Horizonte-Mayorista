package com.example.demo.modulos.tarifas.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.server.ResponseStatusException;

import com.example.demo.exception.NotFoundException;
import com.example.demo.modulos.catalogo.entity.Destino;
import com.example.demo.modulos.catalogo.entity.Servicio;
import com.example.demo.modulos.catalogo.repository.DestinoRepository;
import com.example.demo.modulos.catalogo.repository.ServicioRepository;
import com.example.demo.modulos.gestionUsuariosRolesPermisos.entity.Usuario;
import com.example.demo.modulos.gestionUsuariosRolesPermisos.repository.UsuarioRepository;
import com.example.demo.modulos.proveedores.entity.Proveedor;
import com.example.demo.modulos.proveedores.repository.ProveedorRepository;
import com.example.demo.modulos.tarifas.dto.TarifaDetalleDTO;
import com.example.demo.modulos.tarifas.dto.TarifaRequest;
import com.example.demo.modulos.tarifas.entity.Tarifa;
import com.example.demo.modulos.tarifas.repository.TarifaRepository;
import com.example.demo.modulos.ventas.repository.VentaRepository;
import com.example.demo.modulos.cotizaciones.repository.CotizacionDetalleRepository;

@ExtendWith(MockitoExtension.class)
class TarifaServiceTest {

	@Mock
	private TarifaRepository tarifaRepository;

	@Mock
	private ProveedorRepository proveedorRepository;

	@Mock
	private ServicioRepository servicioRepository;

	@Mock
	private DestinoRepository destinoRepository;

	@Mock
	private UsuarioRepository usuarioRepository;

	@Mock
	private VentaRepository ventaRepository;

	@Mock
	private CotizacionDetalleRepository cotizacionDetalleRepository;

	private TarifaService service;

	@BeforeEach
	void setUp() {
		service = new TarifaService(tarifaRepository, proveedorRepository, servicioRepository, destinoRepository,
				usuarioRepository, ventaRepository, cotizacionDetalleRepository);
		org.mockito.Mockito.lenient().when(proveedorRepository.findById(1L)).thenReturn(Optional.of(proveedor()));
		org.mockito.Mockito.lenient().when(servicioRepository.findById(2L)).thenReturn(Optional.of(servicio()));
		org.mockito.Mockito.lenient().when(destinoRepository.findById(3L)).thenReturn(Optional.of(destino()));
		org.mockito.Mockito.lenient().when(tarifaRepository.save(any(Tarifa.class)))
				.thenAnswer(inv -> inv.getArgument(0));
	}

	@AfterEach
	void limpiarContextoDeSeguridad() {
		SecurityContextHolder.clearContext();
	}

	@Test
	void crear_lanza404CuandoElProveedorNoExiste() {
		when(proveedorRepository.findById(99L)).thenReturn(Optional.empty());

		assertThatThrownBy(() -> service.crear(request(99L, new BigDecimal("320.00"))))
				.isInstanceOf(ResponseStatusException.class)
				.hasMessageContaining("404");
	}

	@Test
	void crear_lanza404CuandoElServicioNoExiste() {
		when(servicioRepository.findById(2L)).thenReturn(Optional.empty());

		assertThatThrownBy(() -> service.crear(request(1L, new BigDecimal("320.00"))))
				.isInstanceOf(ResponseStatusException.class)
				.hasMessageContaining("404");
	}

	@Test
	void crear_lanza404CuandoElDestinoNoExiste() {
		when(destinoRepository.findById(3L)).thenReturn(Optional.empty());

		assertThatThrownBy(() -> service.crear(request(1L, new BigDecimal("320.00"))))
				.isInstanceOf(ResponseStatusException.class)
				.hasMessageContaining("404");
	}

	@Test
	void crear_registraUnHistorialInicialConPrecioAnteriorNull() {
		TarifaDetalleDTO resultado = service.crear(request(1L, new BigDecimal("320.00")));

		assertThat(resultado.historial()).hasSize(1);
		assertThat(resultado.historial().get(0).precioAnterior()).isNull();
		assertThat(resultado.historial().get(0).precioNuevo()).isEqualByComparingTo("320.00");
	}

	@Test
	void actualizar_registraHistorialCuandoElPrecioCambia() {
		Tarifa existente = tarifaExistente(new BigDecimal("300.00"));
		when(tarifaRepository.findById(10L)).thenReturn(Optional.of(existente));

		TarifaDetalleDTO resultado = service.actualizar(10L, request(1L, new BigDecimal("320.00")));

		assertThat(resultado.historial()).hasSize(1);
		assertThat(resultado.historial().get(0).precioAnterior()).isEqualByComparingTo("300.00");
		assertThat(resultado.historial().get(0).precioNuevo()).isEqualByComparingTo("320.00");
	}

	@Test
	void actualizar_noRegistraHistorialCuandoElPrecioNoCambia() {
		Tarifa existente = tarifaExistente(new BigDecimal("320.00"));
		when(tarifaRepository.findById(10L)).thenReturn(Optional.of(existente));

		TarifaDetalleDTO resultado = service.actualizar(10L, request(1L, new BigDecimal("320.00")));

		assertThat(resultado.historial()).isEmpty();
	}

	@Test
	void actualizar_noRegistraHistorialCuandoElPrecioEsIgualAunqueConDistintaEscala() {
		// 320.00 y 320.0 representan el mismo valor (BigDecimal#compareTo, no equals)
		Tarifa existente = tarifaExistente(new BigDecimal("320.00"));
		when(tarifaRepository.findById(10L)).thenReturn(Optional.of(existente));

		TarifaDetalleDTO resultado = service.actualizar(10L, request(1L, new BigDecimal("320.0")));

		assertThat(resultado.historial()).isEmpty();
	}

	@Test
	void actualizar_registraHistorialCuandoLaTarifaNoTeniaPrecioPrevio() {
		Tarifa existente = tarifaExistente(null);
		when(tarifaRepository.findById(10L)).thenReturn(Optional.of(existente));

		TarifaDetalleDTO resultado = service.actualizar(10L, request(1L, new BigDecimal("320.00")));

		assertThat(resultado.historial()).hasSize(1);
		assertThat(resultado.historial().get(0).precioAnterior()).isNull();
	}

	@Test
	void registrarHistorial_dejaElUsuarioEnNullCuandoNoHayAutenticacion() {
		SecurityContextHolder.clearContext();

		TarifaDetalleDTO resultado = service.crear(request(1L, new BigDecimal("320.00")));

		assertThat(resultado.historial().get(0).usuarioCambio()).isNull();
	}

	@Test
	void registrarHistorial_resuelveElUsuarioAutenticado() {
		Usuario usuario = new Usuario();
		usuario.setUsername("ADM");
		when(usuarioRepository.findByUsername("ADM")).thenReturn(Optional.of(usuario));
		SecurityContextHolder.getContext()
				.setAuthentication(new UsernamePasswordAuthenticationToken("ADM", null, java.util.List.of()));

		TarifaDetalleDTO resultado = service.crear(request(1L, new BigDecimal("320.00")));

		assertThat(resultado.historial().get(0).usuarioCambio()).isEqualTo("ADM");
	}

	@Test
	void obtener_lanzaNotFoundExceptionCuandoNoExiste() {
		when(tarifaRepository.findById(99L)).thenReturn(Optional.empty());

		assertThatThrownBy(() -> service.obtener(99L)).isInstanceOf(NotFoundException.class);
	}

	@Test
	void eliminar_borraLaTarifaExistente() {
		Tarifa tarifa = tarifaExistente(new BigDecimal("320.00"));
		tarifa.setId(10L);
		when(tarifaRepository.findById(10L)).thenReturn(Optional.of(tarifa));

		service.eliminar(10L);

		@SuppressWarnings({ "unchecked", "rawtypes" })
		org.springframework.data.repository.CrudRepository rawRepository = tarifaRepository;
		org.mockito.Mockito.verify(rawRepository).delete(tarifa);
	}

	@Test
	void actualizarArchivoRespaldo_asignaLaUrlYGuarda() {
		Tarifa tarifa = tarifaExistente(new BigDecimal("320.00"));
		when(tarifaRepository.findById(10L)).thenReturn(Optional.of(tarifa));

		String resultado = service.actualizarArchivoRespaldo(10L, "tarifa_10_abc.pdf");

		assertThat(resultado).isEqualTo("tarifa_10_abc.pdf");
		assertThat(tarifa.getArchivoRespaldoUrl()).isEqualTo("tarifa_10_abc.pdf");
	}

	@Test
	void kpis_combinaLosTresContadoresConLosMismosLimitesDeFecha() {
		when(tarifaRepository.countVigentes(any())).thenReturn(126L);
		when(tarifaRepository.countPorVencer(any(), any())).thenReturn(12L);
		when(tarifaRepository.countVencidas(any())).thenReturn(7L);

		var kpis = service.kpis();

		assertThat(kpis.vigentes()).isEqualTo(126L);
		assertThat(kpis.porVencer()).isEqualTo(12L);
		assertThat(kpis.vencidas()).isEqualTo(7L);
	}

	@Test
	void tiposTarifa_devuelveElCatalogoDelMapper() {
		assertThat(service.tiposTarifa()).contains("Estandar", "Promocional", "Por temporada", "Corporativa");
	}

	@Test
	void monedas_devuelvePenUsdEur() {
		assertThat(service.monedas()).containsExactly("PEN", "USD", "EUR");
	}

	private TarifaRequest request(Long proveedorId, BigDecimal precio) {
		return new TarifaRequest(proveedorId, 2L, 3L, "Estandar", precio, "PEN",
				LocalDate.now(), LocalDate.now().plusMonths(1), "Condiciones", "Observaciones");
	}

	private Tarifa tarifaExistente(BigDecimal precio) {
		Tarifa tarifa = new Tarifa();
		tarifa.setId(10L);
		tarifa.setPrecio(precio);
		tarifa.setProveedor(proveedor());
		tarifa.setServicio(servicio());
		tarifa.setDestino(destino());
		return tarifa;
	}

	private Proveedor proveedor() {
		Proveedor proveedor = new Proveedor();
		proveedor.setId(1L);
		proveedor.setRazonSocial("Andes Travel SAC");
		return proveedor;
	}

	private Servicio servicio() {
		Servicio servicio = new Servicio();
		servicio.setId(2L);
		servicio.setNombre("Tour Machu Picchu");
		return servicio;
	}

	private Destino destino() {
		Destino destino = new Destino();
		destino.setId(3L);
		destino.setNombre("Cusco");
		return destino;
	}
}
