package com.example.usuarios.modules.usuario.repository;

import com.example.usuarios.modules.usuario.entity.Rol;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RolRepository extends JpaRepository<Rol, Long> {

    Optional<Rol> findByNombre(Rol.RolNombre nombre);

    boolean existsByNombre(Rol.RolNombre nombre);
}