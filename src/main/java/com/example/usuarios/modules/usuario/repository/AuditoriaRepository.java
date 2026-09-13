package com.example.usuarios.modules.usuario.repository;

import com.example.usuarios.modules.usuario.entity.Auditoria;
import com.example.usuarios.modules.usuario.entity.Usuario;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface AuditoriaRepository extends JpaRepository<Auditoria, Long> {

    Page<Auditoria> findByUsuarioOrderByFechaDesc(Usuario usuario, Pageable pageable);

    Page<Auditoria> findByEntidadAndEntidadIdOrderByFechaDesc(String entidad, String entidadId, Pageable pageable);

    List<Auditoria> findByFechaBetween(Instant inicio, Instant fin);

    Page<Auditoria> findByAccionOrderByFechaDesc(String accion, Pageable pageable);
}