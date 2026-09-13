package com.example.usuarios.modules.solicitud.service;

import com.example.usuarios.common.error.NotFoundException;
import com.example.usuarios.modules.solicitud.dto.request.EvaluarSolicitudRequest;
import com.example.usuarios.modules.solicitud.dto.request.SolicitudCreateRequest;
import com.example.usuarios.modules.solicitud.dto.response.SolicitudListResponse;
import com.example.usuarios.modules.solicitud.dto.response.SolicitudResumenResponse;
import com.example.usuarios.modules.solicitud.entity.EstadoSolicitud;
import com.example.usuarios.modules.solicitud.entity.Solicitud;
import com.example.usuarios.modules.solicitud.repository.SolicitudRepository;
import com.example.usuarios.modules.usuario.entity.Usuario;
import com.example.usuarios.modules.usuario.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Year;

@Service
@RequiredArgsConstructor
public class SolicitudServiceImpl implements SolicitudService {

    private final SolicitudRepository solicitudRepository;
    private final UsuarioRepository usuarioRepository;

    private void validarFechas(LocalDate inicio, LocalDate fin) {
        if (inicio != null && fin != null && fin.isBefore(inicio)) {
            throw new IllegalArgumentException("La fecha fin no puede ser anterior a la fecha inicio");
        }
    }

    private static SolicitudListResponse toResponse(Solicitud s) {
        String nombreCompleto = s.getUsuario() != null
                ? s.getUsuario().getNombre() + " " + s.getUsuario().getApellido()
                : "";
        return new SolicitudListResponse(
                s.getId(), s.getCodigo(), s.getTipo(), s.getMotivo(),
                s.getFechaInicio(), s.getFechaFin(), s.getEstado(),
                s.getComentarioGerencia(), nombreCompleto.trim(), s.getCreatedAt());
    }

    @Override
    @Transactional
    public SolicitudListResponse crear(Long usuarioId, SolicitudCreateRequest request) {
        validarFechas(request.fechaInicio(), request.fechaFin());
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));

        String codigo;
        long intentos = 0;
        do {
            long next = solicitudRepository.count() + 1 + intentos++;
            codigo = String.format("NH-%d-%04d", Year.now().getValue(), next);
        } while (solicitudRepository.existsByCodigo(codigo));

        Solicitud solicitud = Solicitud.builder()
                .codigo(codigo)
                .tipo(request.tipo())
                .motivo(request.motivo())
                .fechaInicio(request.fechaInicio())
                .fechaFin(request.fechaFin())
                .estado(EstadoSolicitud.PENDIENTE)
                .usuario(usuario)
                .build();
        return toResponse(solicitudRepository.save(solicitud));
    }

    @Override
    @Transactional
    public SolicitudListResponse evaluar(Long solicitudId, EvaluarSolicitudRequest request) {
        Solicitud solicitud = solicitudRepository.findById(solicitudId)
                .orElseThrow(() -> new NotFoundException("Solicitud no encontrada"));
        if (!solicitud.getEstado().equals(EstadoSolicitud.PENDIENTE)) {
            throw new IllegalStateException("La solicitud ya fue evaluada");
        }
        solicitud.setEstado(request.estado());
        solicitud.setComentarioGerencia(request.comentarioGerencia());
        return toResponse(solicitudRepository.save(solicitud));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<SolicitudListResponse> listarMias(Long usuarioId, String estado, Pageable pageable) {
        Page<Solicitud> page;
        if (estado != null && !estado.isBlank()) {
            EstadoSolicitud st = EstadoSolicitud.valueOf(estado.trim().toUpperCase());
            page = solicitudRepository.findByUsuarioIdAndEstadoOrderByCreatedAtDesc(usuarioId, st, pageable);
        } else {
            page = solicitudRepository.findByUsuarioIdOrderByCreatedAtDesc(usuarioId, pageable);
        }
        return page.map(SolicitudServiceImpl::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<SolicitudListResponse> listarTodas(String estado, Pageable pageable) {
        Page<Solicitud> page;
        if (estado != null && !estado.isBlank()) {
            EstadoSolicitud st = EstadoSolicitud.valueOf(estado.trim().toUpperCase());
            page = solicitudRepository.findByEstadoOrderByCreatedAtDesc(st, pageable);
        } else {
            page = solicitudRepository.findAllByOrderByCreatedAtDesc(pageable);
        }
        return page.map(SolicitudServiceImpl::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public SolicitudResumenResponse resumenMias(Long usuarioId) {
        return new SolicitudResumenResponse(
                solicitudRepository.countByUsuarioIdAndEstado(usuarioId, EstadoSolicitud.PENDIENTE),
                solicitudRepository.countByUsuarioIdAndEstado(usuarioId, EstadoSolicitud.APROBADA),
                solicitudRepository.countByUsuarioIdAndEstado(usuarioId, EstadoSolicitud.RECHAZADA),
                solicitudRepository.countByUsuarioIdAndEstado(usuarioId, EstadoSolicitud.PENDIENTE)
                        + solicitudRepository.countByUsuarioIdAndEstado(usuarioId, EstadoSolicitud.APROBADA)
                        + solicitudRepository.countByUsuarioIdAndEstado(usuarioId, EstadoSolicitud.RECHAZADA));
    }

    @Override
    @Transactional(readOnly = true)
    public SolicitudResumenResponse resumenTodas() {
        return new SolicitudResumenResponse(
                solicitudRepository.countByEstado(EstadoSolicitud.PENDIENTE),
                solicitudRepository.countByEstado(EstadoSolicitud.APROBADA),
                solicitudRepository.countByEstado(EstadoSolicitud.RECHAZADA),
                solicitudRepository.count());
    }
}