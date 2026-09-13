package com.example.usuarios.modules.usuario.service;

import com.example.usuarios.common.error.NotFoundException;
import com.example.usuarios.modules.usuario.dto.response.AuditoriaResponse;
import com.example.usuarios.modules.usuario.entity.Auditoria;
import com.example.usuarios.modules.usuario.entity.Usuario;
import com.example.usuarios.modules.usuario.mapper.AuditoriaMapper;
import com.example.usuarios.modules.usuario.repository.AuditoriaRepository;
import com.example.usuarios.modules.usuario.repository.UsuarioRepository;
import com.example.usuarios.common.api.PaginationResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuditoriaServiceImpl implements AuditoriaService {

    private final AuditoriaRepository auditoriaRepository;
    private final UsuarioRepository usuarioRepository;
    private final AuditoriaMapper auditoriaMapper;

    @Override
    public PaginationResponse<AuditoriaResponse> listarPorUsuario(Long usuarioId, int page, int size) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new NotFoundException("Usuario", usuarioId));
        Pageable pageable = PageRequest.of(page, size, Sort.by("fecha").descending());
        Page<Auditoria> auditorias = auditoriaRepository.findByUsuarioOrderByFechaDesc(usuario, pageable);

        return PaginationResponse.<AuditoriaResponse>builder()
                .content(auditorias.map(auditoriaMapper::toResponse).getContent())
                .page(auditorias.getNumber())
                .size(auditorias.getSize())
                .totalElements(auditorias.getTotalElements())
                .totalPages(auditorias.getTotalPages())
                .first(auditorias.isFirst())
                .last(auditorias.isLast())
                .empty(auditorias.isEmpty())
                .build();
    }

    @Override
    public PaginationResponse<AuditoriaResponse> listarPorEntidad(String entidad, String entidadId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("fecha").descending());
        Page<Auditoria> auditorias = auditoriaRepository.findByEntidadAndEntidadIdOrderByFechaDesc(entidad, entidadId, pageable);

        return PaginationResponse.<AuditoriaResponse>builder()
                .content(auditorias.map(auditoriaMapper::toResponse).getContent())
                .page(auditorias.getNumber())
                .size(auditorias.getSize())
                .totalElements(auditorias.getTotalElements())
                .totalPages(auditorias.getTotalPages())
                .first(auditorias.isFirst())
                .last(auditorias.isLast())
                .empty(auditorias.isEmpty())
                .build();
    }

    @Override
    public PaginationResponse<AuditoriaResponse> listarPorAccion(String accion, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("fecha").descending());
        Page<Auditoria> auditorias = auditoriaRepository.findByAccionOrderByFechaDesc(accion, pageable);

        return PaginationResponse.<AuditoriaResponse>builder()
                .content(auditorias.map(auditoriaMapper::toResponse).getContent())
                .page(auditorias.getNumber())
                .size(auditorias.getSize())
                .totalElements(auditorias.getTotalElements())
                .totalPages(auditorias.getTotalPages())
                .first(auditorias.isFirst())
                .last(auditorias.isLast())
                .empty(auditorias.isEmpty())
                .build();
    }

    @Override
    public PaginationResponse<AuditoriaResponse> listarPorFecha(java.time.Instant inicio, java.time.Instant fin, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("fecha").descending());
        List<Auditoria> lista = auditoriaRepository.findByFechaBetween(inicio, fin);
        Page<Auditoria> auditorias = new PageImpl<>(lista, pageable, lista.size());

        return PaginationResponse.<AuditoriaResponse>builder()
                .content(auditorias.map(auditoriaMapper::toResponse).getContent())
                .page(auditorias.getNumber())
                .size(auditorias.getSize())
                .totalElements(auditorias.getTotalElements())
                .totalPages(auditorias.getTotalPages())
                .first(auditorias.isFirst())
                .last(auditorias.isLast())
                .empty(auditorias.isEmpty())
                .build();
    }
}