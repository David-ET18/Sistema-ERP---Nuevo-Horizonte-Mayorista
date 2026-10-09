package com.example.demo.modulos.gestionUsuariosRolesPermisos.repository;

import com.example.demo.modulos.gestionUsuariosRolesPermisos.entity.HistorialPassword;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HistorialPasswordRepository extends JpaRepository<HistorialPassword, Long> {

	List<HistorialPassword> findTop3ByUsuario_IdOrderByFechaCambioDesc(Long idUsuario);
}