package com.example.usuarios.modules.usuario.repository;

import com.example.usuarios.modules.usuario.entity.Sesion;
import com.example.usuarios.modules.usuario.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface SesionRepository extends JpaRepository<Sesion, Long> {

    Optional<Sesion> findByToken(String token);

    Optional<Sesion> findByRefreshToken(String refreshToken);

    List<Sesion> findByUsuarioAndActivaTrue(Usuario usuario);

    List<Sesion> findByExpiraEnBefore(Instant now);

    @Modifying
    @Transactional
    @Query("UPDATE Sesion s SET s.activa = false WHERE s.usuario = :usuario AND s.activa = true")
    void desactivarSesionesByUsuario(@Param("usuario") Usuario usuario);

    @Modifying
    @Transactional
    @Query("DELETE FROM Sesion s WHERE s.expiraEn < :now")
    void limpiarSesionesExpiradas(@Param("now") Instant now);
}