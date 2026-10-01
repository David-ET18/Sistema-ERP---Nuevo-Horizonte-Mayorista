package com.example.demo.acceso.repository;

import com.example.demo.acceso.entity.UsuarioRol;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UsuarioRolRepository extends JpaRepository<UsuarioRol, Long> {

	List<UsuarioRol> findByUsuarioId(Long idUsuario);

	void deleteByUsuarioId(Long idUsuario);
}