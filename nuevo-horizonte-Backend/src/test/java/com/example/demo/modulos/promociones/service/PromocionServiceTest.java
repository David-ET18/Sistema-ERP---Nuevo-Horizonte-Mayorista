package com.example.demo.modulos.promociones.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import com.example.demo.exception.BusinessException;
import com.example.demo.modulos.catalogo.entity.Servicio;
import com.example.demo.modulos.catalogo.repository.ServicioRepository;
import com.example.demo.modulos.notificaciones.service.NotificacionService;
import com.example.demo.modulos.promociones.dto.PromocionDTO;
import com.example.demo.modulos.promociones.dto.PromocionRequest;
import com.example.demo.modulos.promociones.entity.Promocion;
import com.example.demo.modulos.promociones.repository.PromocionRepository;

@ExtendWith(MockitoExtension.class)
class PromocionServiceTest {

	@Mock
	private PromocionRepository promocionRepository;

	@Mock
	private ServicioRepository servicioRepository;

	@Mock
	private NotificacionService notificacionService;

	private PromocionService service;

	@BeforeEach
	void setUp() {
		service = new PromocionService(promocionRepository, servicioRepository, notificacionService);
	}

	@Test
	void crear_guardaLaPromocionYNotificaATodosCuandoNaceActiva() {
		when(promocionRepository.save(any(Promocion.class))).thenAnswer(inv -> {
			Promocion p = inv.getArgument(0);
			p.setId(7L);
			return p;
		});

		PromocionDTO resultado = service.crear(requestValido(), null);

		assertThat(resultado.id()).isEqualTo(7L);
		assertThat(resultado.titulo()).isEqualTo("Escapada de verano");
		assertThat(resultado.estado()).isEqualTo("VIGENTE");
		verify(notificacionService).crearParaTodos(
				eq("Nueva promocion disponible"), anyString(),
				eq(NotificacionService.TIPO_PROMOCION), eq("/promociones"));
	}

	@Test
	void crear_noNotificaCuandoLaPromocionNaceInactiva() {
		when(promocionRepository.save(any(Promocion.class))).thenAnswer(inv -> {
			Promocion p = inv.getArgument(0);
			p.setId(8L);
			return p;
		});
		PromocionRequest request = requestValido();
		request.setActivo(false);

		PromocionDTO resultado = service.crear(request, null);

		assertThat(resultado.activo()).isFalse();
		assertThat(resultado.estado()).isEqualTo("INACTIVA");
		verify(notificacionService, never()).crearParaTodos(anyString(), anyString(), anyString(), any());
	}

	@Test
	void crear_rechazaDescuentoFueraDeRango() {
		PromocionRequest request = requestValido();
		request.setDescuento(BigDecimal.ZERO);

		assertThatThrownBy(() -> service.crear(request, null))
				.isInstanceOf(BusinessException.class)
				.hasMessageContaining("descuento");
		verify(promocionRepository, never()).save(any());
	}

	@Test
	void crear_rechazaFechaFinAnteriorAlInicio() {
		PromocionRequest request = requestValido();
		request.setFechaFin(request.getFechaInicio().minusDays(1));

		assertThatThrownBy(() -> service.crear(request, null))
				.isInstanceOf(BusinessException.class)
				.hasMessageContaining("fecha de fin");
		verify(promocionRepository, never()).save(any());
	}

	@Test
	void crear_validaLaImagenYLaGuardaEnLaFila() {
		when(promocionRepository.save(any(Promocion.class))).thenAnswer(inv -> {
			Promocion p = inv.getArgument(0);
			p.setId(9L);
			return p;
		});
		MockMultipartFile imagen = new MockMultipartFile(
				"imagen", "oferta.png", "image/png", new byte[] { 1, 2, 3 });

		PromocionDTO resultado = service.crear(requestValido(), imagen);

		assertThat(resultado.imagenUrl()).startsWith("/promociones/9/imagen?v=");
		assertThat(resultado.imagenNombre()).isEqualTo("oferta.png");
	}

	@Test
	void crear_rechazaArchivosQueNoSonImagen() {
		MockMultipartFile archivo = new MockMultipartFile(
				"imagen", "contrato.pdf", "application/pdf", new byte[] { 1 });

		assertThatThrownBy(() -> service.crear(requestValido(), archivo))
				.isInstanceOf(BusinessException.class)
				.hasMessageContaining("Formato de imagen");
	}

	@Test
	void actualizar_notificaSoloCuandoPasaDeInactivaAActiva() {
		Promocion existente = new Promocion();
		existente.setId(3L);
		existente.setActivo(false);
		existente.setFechaInicio(LocalDate.now());
		existente.setFechaFin(LocalDate.now().plusDays(5));
		existente.setDescuento(BigDecimal.TEN);
		existente.setTitulo("Antigua");
		when(promocionRepository.findById(3L)).thenReturn(Optional.of(existente));
		when(promocionRepository.save(any(Promocion.class))).thenAnswer(inv -> inv.getArgument(0));

		PromocionDTO resultado = service.actualizar(3L, requestValido(), null);

		assertThat(resultado.activo()).isTrue();
		verify(notificacionService).crearParaTodos(
				eq("Promocion activada"), anyString(),
				eq(NotificacionService.TIPO_PROMOCION), eq("/promociones"));
	}

	@Test
	void cambiarActivo_activaYNotifica() {
		Promocion existente = new Promocion();
		existente.setId(4L);
		existente.setActivo(false);
		existente.setFechaInicio(LocalDate.now());
		existente.setFechaFin(LocalDate.now().plusDays(2));
		existente.setDescuento(BigDecimal.ONE);
		existente.setTitulo("Oferta");
		when(promocionRepository.findById(4L)).thenReturn(Optional.of(existente));
		when(promocionRepository.save(any(Promocion.class))).thenAnswer(inv -> inv.getArgument(0));

		PromocionDTO resultado = service.cambiarActivo(4L, true);

		assertThat(resultado.activo()).isTrue();
		verify(notificacionService).crearParaTodos(
				eq("Promocion activada"), anyString(),
				eq(NotificacionService.TIPO_PROMOCION), eq("/promociones"));
	}

	@Test
	void aplicarDatos_asociaElServicioDelCatalogo() {
		Servicio servicio = new Servicio();
		servicio.setId(11L);
		servicio.setNombre("Hotel Caribe");
		servicio.setCategoria("Hotel");
		when(servicioRepository.findById(11L)).thenReturn(Optional.of(servicio));
		when(promocionRepository.save(any(Promocion.class))).thenAnswer(inv -> {
			Promocion p = inv.getArgument(0);
			p.setId(12L);
			return p;
		});
		PromocionRequest request = requestValido();
		request.setServicioId(11L);

		PromocionDTO resultado = service.crear(request, null);

		assertThat(resultado.servicioId()).isEqualTo(11L);
		assertThat(resultado.servicioNombre()).isEqualTo("Hotel Caribe");
	}

	private PromocionRequest requestValido() {
		PromocionRequest request = new PromocionRequest();
		request.setTitulo("Escapada de verano");
		request.setDescripcion("Todo incluido por 3 noches");
		request.setDescuento(BigDecimal.valueOf(20));
		request.setFechaInicio(LocalDate.now());
		request.setFechaFin(LocalDate.now().plusDays(10));
		request.setActivo(true);
		request.setDestacada(true);
		return request;
	}
}
