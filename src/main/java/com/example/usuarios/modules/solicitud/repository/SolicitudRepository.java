package com.example.usuarios.modules.solicitud.repository;

import com.example.usuarios.modules.solicitud.entity.EstadoSolicitud;
import com.example.usuarios.modules.solicitud.entity.Solicitud;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SolicitudRepository extends JpaRepository<Solicitud, Long> {

    boolean existsByCodigo(String codigo);

    long countByEstado(EstadoSolicitud estado);

    long countByUsuarioIdAndEstado(Long usuarioId, EstadoSolicitud estado);

    Page<Solicitud> findByEstadoOrderByCreatedAtDesc(EstadoSolicitud estado, Pageable pageable);

    Page<Solicitud> findByUsuarioIdOrderByCreatedAtDesc(Long usuarioId, Pageable pageable);

    Page<Solicitud> findByUsuarioIdAndEstadoOrderByCreatedAtDesc(Long usuarioId, EstadoSolicitud estado, Pageable pageable);

    Page<Solicitud> findAllByOrderByCreatedAtDesc(Pageable pageable);
}