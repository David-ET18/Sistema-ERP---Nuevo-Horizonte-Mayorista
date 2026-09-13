package com.example.usuarios.modules.usuario.service;

import com.example.usuarios.common.error.ConflictException;
import com.example.usuarios.common.error.NotFoundException;
import com.example.usuarios.modules.usuario.dto.request.GerenciaCreateRequest;
import com.example.usuarios.modules.usuario.dto.request.GerenciaUpdateRequest;
import com.example.usuarios.modules.usuario.dto.response.GerenciaResponse;
import com.example.usuarios.modules.usuario.entity.Gerencia;
import com.example.usuarios.modules.usuario.entity.Usuario;
import com.example.usuarios.modules.usuario.mapper.GerenciaMapper;
import com.example.usuarios.modules.usuario.repository.GerenciaRepository;
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
@Transactional
public class GerenciaServiceImpl implements GerenciaService {

    private final GerenciaRepository gerenciaRepository;
    private final UsuarioRepository usuarioRepository;
    private final GerenciaMapper gerenciaMapper;

    @Override
    public GerenciaResponse crear(Long usuarioId, GerenciaCreateRequest request) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new NotFoundException("Usuario", usuarioId));

        if (!usuario.isGerencia()) {
            throw new IllegalArgumentException("El usuario no tiene rol GERENCIA");
        }
        if (gerenciaRepository.existsByUsuario(usuario)) {
            throw new ConflictException("El usuario ya tiene un perfil de gerencia");
        }
        if (request.getNumeroEmpleado() != null && gerenciaRepository.existsByNumeroEmpleado(request.getNumeroEmpleado())) {
            throw new ConflictException("El numero de empleado ya esta en uso");
        }

        Gerencia gerencia = gerenciaMapper.toEntity(request);
        gerencia.setUsuario(usuario);
        gerencia.setFechaIngreso(java.time.LocalDate.now());

        if (request.getJefeDirectoId() != null) {
            Gerencia jefe = gerenciaRepository.findById(request.getJefeDirectoId())
                    .orElseThrow(() -> new NotFoundException("Jefe directo", request.getJefeDirectoId()));
            gerencia.setJefeDirecto(jefe);
        }

        return gerenciaMapper.toResponse(gerenciaRepository.save(gerencia));
    }

    @Override
    @Transactional(readOnly = true)
    public GerenciaResponse obtenerPorId(Long id) {
        Gerencia gerencia = gerenciaRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Gerencia", id));
        return gerenciaMapper.toResponse(gerencia);
    }

    @Override
    @Transactional(readOnly = true)
    public GerenciaResponse obtenerPorUsuarioId(Long usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new NotFoundException("Usuario", usuarioId));
        Gerencia gerencia = gerenciaRepository.findByUsuario(usuario)
                .orElseThrow(() -> new NotFoundException("Gerencia para usuario: " + usuarioId));
        return gerenciaMapper.toResponse(gerencia);
    }

    @Override
    @Transactional(readOnly = true)
    public PaginationResponse<GerenciaResponse> listar(int page, int size, String departamento, Boolean activo) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("departamento").ascending());
        Page<Gerencia> gerencias;

        if (departamento != null && !departamento.trim().isEmpty()) {
            List<Gerencia> filtered = gerenciaRepository.findByDepartamento(departamento.trim());
            gerencias = new PageImpl<>(filtered, pageable, filtered.size());
        } else if (activo != null && activo) {
            List<Gerencia> filtered = gerenciaRepository.findByActivoTrue();
            gerencias = new PageImpl<>(filtered, pageable, filtered.size());
        } else {
            gerencias = gerenciaRepository.findAll(pageable);
        }

        return PaginationResponse.<GerenciaResponse>builder()
                .content(gerencias.map(gerenciaMapper::toResponse).getContent())
                .page(gerencias.getNumber())
                .size(gerencias.getSize())
                .totalElements(gerencias.getTotalElements())
                .totalPages(gerencias.getTotalPages())
                .first(gerencias.isFirst())
                .last(gerencias.isLast())
                .empty(gerencias.isEmpty())
                .build();
    }

    @Override
    public GerenciaResponse actualizar(Long id, GerenciaUpdateRequest request) {
        Gerencia gerencia = gerenciaRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Gerencia", id));

        if (request.getNumeroEmpleado() != null && !request.getNumeroEmpleado().equals(gerencia.getNumeroEmpleado())) {
            if (gerenciaRepository.existsByNumeroEmpleado(request.getNumeroEmpleado())) {
                throw new ConflictException("El numero de empleado ya esta en uso");
            }
            gerencia.setNumeroEmpleado(request.getNumeroEmpleado());
        }

        if (request.getDepartamento() != null) gerencia.setDepartamento(request.getDepartamento());
        if (request.getCargo() != null) gerencia.setCargo(request.getCargo());
        if (request.getActivo() != null) gerencia.setActivo(request.getActivo());

        if (request.getJefeDirectoId() != null) {
            if (request.getJefeDirectoId().equals(id)) {
                throw new IllegalArgumentException("Un usuario no puede ser su propio jefe");
            }
            Gerencia jefe = gerenciaRepository.findById(request.getJefeDirectoId())
                    .orElseThrow(() -> new NotFoundException("Jefe directo", request.getJefeDirectoId()));
            gerencia.setJefeDirecto(jefe);
        }

        return gerenciaMapper.toResponse(gerenciaRepository.save(gerencia));
    }

    @Override
    public void cambiarEstado(Long id, boolean activo) {
        Gerencia gerencia = gerenciaRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Gerencia", id));
        gerencia.setActivo(activo);
        gerenciaRepository.save(gerencia);
    }

    @Override
    public void eliminar(Long id) {
        Gerencia gerencia = gerenciaRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Gerencia", id));
        gerenciaRepository.delete(gerencia);
    }

    @Override
    @Transactional(readOnly = true)
    public PaginationResponse<GerenciaResponse> listarSubordinados(Long jefeId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("departamento").ascending());
        List<Gerencia> subordinados = gerenciaRepository.findByJefeDirectoId(jefeId);
        Page<Gerencia> pageSubordinados = new PageImpl<>(subordinados, pageable, subordinados.size());

        return PaginationResponse.<GerenciaResponse>builder()
                .content(pageSubordinados.map(gerenciaMapper::toResponse).getContent())
                .page(pageSubordinados.getNumber())
                .size(pageSubordinados.getSize())
                .totalElements(pageSubordinados.getTotalElements())
                .totalPages(pageSubordinados.getTotalPages())
                .first(pageSubordinados.isFirst())
                .last(pageSubordinados.isLast())
                .empty(pageSubordinados.isEmpty())
                .build();
    }
}
