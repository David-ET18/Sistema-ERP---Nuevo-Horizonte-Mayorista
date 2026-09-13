package com.example.usuarios.modules.usuario.repository;

import com.example.usuarios.modules.usuario.entity.Usuario;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByEmail(String email);

    Optional<Usuario> findByUsername(String username);

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);

    List<Usuario> findByActivoTrue();

    List<Usuario> findByRoles_Nombre(com.example.usuarios.modules.usuario.entity.Rol.RolNombre rolNombre);

    @Query("SELECT u FROM Usuario u JOIN u.roles r WHERE r.nombre = :rolNombre AND u.activo = true")
    List<Usuario> findActivosByRol(@Param("rolNombre") com.example.usuarios.modules.usuario.entity.Rol.RolNombre rolNombre);

    Page<Usuario> findByEmailContainingOrUsernameContaining(String email, String username, Pageable pageable);

    @Query("SELECT u FROM Usuario u JOIN u.roles r " +
            "WHERE (:rol IS NULL OR r.nombre = :rol) " +
            "AND (:search IS NULL OR :search = '' " +
            " OR LOWER(u.nombre) LIKE LOWER(CONCAT('%', :search, '%')) " +
            " OR LOWER(u.apellido) LIKE LOWER(CONCAT('%', :search, '%')) " +
            " OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')) " +
            " OR LOWER(u.username) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Usuario> findPagedByRolAndSearch(
            @Param("rol") com.example.usuarios.modules.usuario.entity.Rol.RolNombre rol,
            @Param("search") String search,
            Pageable pageable);
}
