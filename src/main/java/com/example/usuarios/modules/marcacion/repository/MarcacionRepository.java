package com.example.usuarios.modules.marcacion.repository;

import com.example.usuarios.modules.marcacion.entity.Marcacion;
import com.example.usuarios.modules.marcacion.entity.TipoMarcacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface MarcacionRepository extends JpaRepository<Marcacion, Long> {

    Optional<Marcacion> findFirstByUsuarioIdAndTipoAndFechaOrderByHoraDesc(
            Long usuarioId, TipoMarcacion tipo, LocalDate fecha);

    List<Marcacion> findByUsuarioIdAndFechaOrderByHoraAsc(Long usuarioId, LocalDate fecha);

    Long countByUsuarioIdAndFecha(Long usuarioId, LocalDate fecha);
}