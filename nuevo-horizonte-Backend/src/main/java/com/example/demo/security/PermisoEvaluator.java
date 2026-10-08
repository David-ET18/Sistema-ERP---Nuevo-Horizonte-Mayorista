package com.example.demo.security;

import com.example.demo.modulos.gestionUsuariosRolesPermisos.entity.RolPermiso;
import com.example.demo.modulos.gestionUsuariosRolesPermisos.repository.RolPermisoRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.function.Predicate;

/**
 * Autorizacion por modulo del lado del servidor (ver src/config/modulos.ts en
 * el frontend, que es la misma clave de modulo usada en rol_permiso.modulo).
 *
 * El guard del frontend (PermisoRequerido/ConPermiso) solo oculta pantallas;
 * sin esto, cualquier usuario autenticado podia llamar directamente la API
 * de un modulo que su rol no tiene permitido (ER01).
 */
@Component("permisoEvaluator")
public class PermisoEvaluator {

	private final RolPermisoRepository rolPermisoRepository;

	public PermisoEvaluator(RolPermisoRepository rolPermisoRepository) {
		this.rolPermisoRepository = rolPermisoRepository;
	}

	@Transactional(readOnly = true)
	public boolean puedeLeer(String modulo) {
		return tienePermiso(modulo, RolPermiso::isPuedeLeer);
	}

	@Transactional(readOnly = true)
	public boolean puedeCrear(String modulo) {
		return tienePermiso(modulo, RolPermiso::isPuedeCrear);
	}

	@Transactional(readOnly = true)
	public boolean puedeActualizar(String modulo) {
		return tienePermiso(modulo, RolPermiso::isPuedeActualizar);
	}

	@Transactional(readOnly = true)
	public boolean puedeEliminar(String modulo) {
		return tienePermiso(modulo, RolPermiso::isPuedeEliminar);
	}

	private boolean tienePermiso(String modulo, Predicate<RolPermiso> condicion) {
		var autenticacion = SecurityContextHolder.getContext().getAuthentication();
		if (autenticacion == null || !autenticacion.isAuthenticated()) {
			return false;
		}
		String username = autenticacion.getName();
		List<RolPermiso> permisos = rolPermisoRepository.findByUsuarioUsernameAndModulo(username, modulo);
		return permisos.stream().anyMatch(condicion);
	}
}
