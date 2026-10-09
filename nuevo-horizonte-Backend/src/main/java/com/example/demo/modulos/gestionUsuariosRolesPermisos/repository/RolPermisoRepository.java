package com.example.demo.modulos.gestionUsuariosRolesPermisos.repository;

import com.example.demo.modulos.gestionUsuariosRolesPermisos.entity.RolPermiso;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RolPermisoRepository extends JpaRepository<RolPermiso, Long> {

	List<RolPermiso> findByRolId(Long idRol);

	void deleteByRolId(Long idRol);

	/**
	 * Permisos del modulo indicado, para todos los roles activos del usuario.
	 * Usado por PermisoEvaluator para la autorizacion del lado del servidor
	 * (no basta con ocultar el modulo en el frontend).
	 */
	@org.springframework.data.jpa.repository.Query(
			"select rp from RolPermiso rp "
					+ "join rp.rol r "
					+ "join r.usuarioRoles ur "
					+ "where ur.usuario.username = :username and rp.modulo = :modulo and r.activo = true")
	List<RolPermiso> findByUsuarioUsernameAndModulo(String username, String modulo);
}