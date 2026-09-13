package com.example.usuarios.modules.usuario.repository;

import com.example.usuarios.modules.usuario.entity.Proveedor;
import com.example.usuarios.modules.usuario.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProveedorRepository extends JpaRepository<Proveedor, Long> {

    Optional<Proveedor> findByRfc(String rfc);

    Optional<Proveedor> findByUsuario(Usuario usuario);

    boolean existsByRfc(String rfc);

    boolean existsByUsuario(Usuario usuario);

    List<Proveedor> findByActivoTrue();

    List<Proveedor> findByActivoTrueAndCalificacionGreaterThanEqual(BigDecimal calificacion);
}
