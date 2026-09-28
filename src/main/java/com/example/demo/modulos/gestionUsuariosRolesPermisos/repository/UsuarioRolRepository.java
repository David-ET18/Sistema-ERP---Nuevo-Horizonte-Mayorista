package com.example.demo.modulos.gestionUsuariosRolesPermisos.repository;

import com.example.demo.modulos.gestionUsuariosRolesPermisos.entity.UsuarioRol;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UsuarioRolRepository extends JpaRepository<UsuarioRol, Long> {

	List<UsuarioRol> findByUsuarioId(Long idUsuario);

	void deleteByUsuarioId(Long idUsuario);
}