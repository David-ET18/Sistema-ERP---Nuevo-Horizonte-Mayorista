package com.example.usuarios.modules.usuario.repository;

import com.example.usuarios.modules.usuario.entity.Gerencia;
import com.example.usuarios.modules.usuario.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GerenciaRepository extends JpaRepository<Gerencia, Long> {

    Optional<Gerencia> findByUsuario(Usuario usuario);

    Optional<Gerencia> findByNumeroEmpleado(String numeroEmpleado);

    List<Gerencia> findByDepartamento(String departamento);

    List<Gerencia> findByActivoTrue();

    List<Gerencia> findByJefeDirectoId(Long jefeDirectoId);

    boolean existsByNumeroEmpleado(String numeroEmpleado);

    boolean existsByUsuario(Usuario usuario);
}
