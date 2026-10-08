package com.example.demo.modulos.gestionUsuariosRolesPermisos.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.demo.exception.BusinessException;
import com.example.demo.modulos.ModuloCatalogo;
import com.example.demo.modulos.gestionUsuariosRolesPermisos.dto.PermisoRequest;
import com.example.demo.modulos.gestionUsuariosRolesPermisos.dto.RolRequest;
import com.example.demo.modulos.gestionUsuariosRolesPermisos.entity.Rol;
import com.example.demo.modulos.gestionUsuariosRolesPermisos.entity.UsuarioRol;
import com.example.demo.modulos.gestionUsuariosRolesPermisos.repository.RolRepository;

/**
 * Cubre la validacion de "modulo" contra el catalogo real (ER: el formulario
 * de roles ya no permite texto libre, pero la garantia real esta aqui: sin
 * esto, cualquiera que llame POST/PUT /api/roles directamente podria crear
 * permisos para un modulo inexistente o repetido).
 */
@ExtendWith(MockitoExtension.class)
class RolServiceTest {

	@Mock
	private RolRepository rolRepository;

	private RolService service;

	@BeforeEach
	void setUp() {
		service = new RolService(rolRepository);
	}

	private RolRequest requestCon(List<PermisoRequest> permisos) {
		return new RolRequest("Rol de prueba", "Descripcion", "#2563eb", true, permisos);
	}

	@Test
	void crear_conModuloInexistente_lanzaBusinessException() {
		RolRequest request = requestCon(List.of(
				new PermisoRequest("modulo-que-no-existe", true, false, false, false)));
		when(rolRepository.existsByNombre(request.nombre())).thenReturn(false);

		assertThatThrownBy(() -> service.crear(request))
				.isInstanceOf(BusinessException.class)
				.hasMessageContaining("no existe en el catalogo");
	}

	@Test
	void crear_conModuloDuplicado_lanzaBusinessException() {
		RolRequest request = requestCon(List.of(
				new PermisoRequest(ModuloCatalogo.CATALOGO, true, false, false, false),
				new PermisoRequest(ModuloCatalogo.CATALOGO, false, true, false, false)));
		when(rolRepository.existsByNombre(request.nombre())).thenReturn(false);

		assertThatThrownBy(() -> service.crear(request))
				.isInstanceOf(BusinessException.class)
				.hasMessageContaining("duplicado");
	}

	@Test
	void crear_conModulosValidosYUnicos_guardaElRolConSusPermisos() {
		RolRequest request = requestCon(List.of(
				new PermisoRequest(ModuloCatalogo.CATALOGO, true, true, false, false),
				new PermisoRequest(ModuloCatalogo.REPORTES, true, false, false, false)));
		when(rolRepository.existsByNombre(request.nombre())).thenReturn(false);
		when(rolRepository.save(any(Rol.class))).thenAnswer(invocation -> invocation.getArgument(0));

		var dto = service.crear(request);

		assertThat(dto.permisos()).hasSize(2);
		assertThat(dto.permisos()).extracting("modulo")
				.containsExactlyInAnyOrder(ModuloCatalogo.CATALOGO, ModuloCatalogo.REPORTES);
	}

	@Test
	void crear_conNombreRepetido_lanzaBusinessException() {
		RolRequest request = requestCon(List.of());
		when(rolRepository.existsByNombre(request.nombre())).thenReturn(true);

		assertThatThrownBy(() -> service.crear(request))
				.isInstanceOf(BusinessException.class)
				.hasMessageContaining("ya existe");
	}

	@Test
	void actualizar_desactivandoUnRolDeSistema_lanzaBusinessException() {
		Rol rol = new Rol();
		rol.setId(1L);
		rol.setNombre("Administración");
		rol.setEsSistema(true);
		when(rolRepository.findById(1L)).thenReturn(Optional.of(rol));
		when(rolRepository.findByNombre("Administración")).thenReturn(Optional.of(rol));

		RolRequest request = new RolRequest("Administración", "desc", null, false, List.of());

		assertThatThrownBy(() -> service.actualizar(1L, request))
				.isInstanceOf(BusinessException.class)
				.hasMessageContaining("rol del sistema");
	}

	@Test
	void eliminar_unRolDeSistema_lanzaBusinessException() {
		Rol rol = new Rol();
		rol.setId(1L);
		rol.setEsSistema(true);
		when(rolRepository.findById(1L)).thenReturn(Optional.of(rol));

		assertThatThrownBy(() -> service.eliminar(1L))
				.isInstanceOf(BusinessException.class)
				.hasMessageContaining("rol del sistema");
	}

	@Test
	void eliminar_unRolConUsuariosAsignados_lanzaBusinessException() {
		Rol rol = new Rol();
		rol.setId(2L);
		rol.setEsSistema(false);
		rol.getUsuarioRoles().add(new UsuarioRol());
		when(rolRepository.findById(2L)).thenReturn(Optional.of(rol));

		assertThatThrownBy(() -> service.eliminar(2L))
				.isInstanceOf(BusinessException.class)
				.hasMessageContaining("asignado a usuarios");
	}
}
