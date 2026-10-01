package com.example.demo.acceso.repository;

import com.example.demo.acceso.entity.RolPermiso;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RolPermisoRepository extends JpaRepository<RolPermiso, Long> {

	List<RolPermiso> findByRolId(Long idRol);

	void deleteByRolId(Long idRol);
}