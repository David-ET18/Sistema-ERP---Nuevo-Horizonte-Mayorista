package com.example.usuarios.modules.usuario.repository;

import com.example.usuarios.modules.usuario.entity.Permiso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PermisoRepository extends JpaRepository<Permiso, Long> {

    Optional<Permiso> findByNombre(String nombre);

    List<Permiso> findByRecurso(String recurso);

    List<Permiso> findByRecursoAndAccion(String recurso, String accion);

    boolean existsByNombre(String nombre);
}