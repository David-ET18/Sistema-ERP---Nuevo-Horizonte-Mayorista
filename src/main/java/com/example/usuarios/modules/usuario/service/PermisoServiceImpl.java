package com.example.usuarios.modules.usuario.service;

import com.example.usuarios.common.error.ConflictException;
import com.example.usuarios.common.error.NotFoundException;
import com.example.usuarios.modules.usuario.dto.request.PermisoCreateRequest;
import com.example.usuarios.modules.usuario.dto.request.PermisoUpdateRequest;
import com.example.usuarios.modules.usuario.dto.response.PermisoResponse;
import com.example.usuarios.modules.usuario.entity.Permiso;
import com.example.usuarios.modules.usuario.mapper.PermisoMapper;
import com.example.usuarios.modules.usuario.repository.PermisoRepository;
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
public class PermisoServiceImpl implements PermisoService {

    private final PermisoRepository permisoRepository;
    private final PermisoMapper permisoMapper;

    @Override
    public PermisoResponse crear(PermisoCreateRequest request) {
        if (permisoRepository.existsByNombre(request.getNombre())) {
            throw new ConflictException("El permiso ya existe");
        }
        Permiso permiso = permisoMapper.toEntity(request);
        return permisoMapper.toResponse(permisoRepository.save(permiso));
    }

    @Override
    @Transactional(readOnly = true)
    public PermisoResponse obtenerPorId(Long id) {
        Permiso permiso = permisoRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Permiso", id));
        return permisoMapper.toResponse(permiso);
    }

    @Override
    @Transactional(readOnly = true)
    public PaginationResponse<PermisoResponse> listar(int page, int size, String recurso) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("recurso").ascending().and(Sort.by("accion").ascending()));
        Page<Permiso> permisos;

        if (recurso != null && !recurso.trim().isEmpty()) {
            List<Permiso> filtered = permisoRepository.findByRecurso(recurso.trim());
            permisos = new PageImpl<>(filtered, pageable, filtered.size());
        } else {
            permisos = permisoRepository.findAll(pageable);
        }

        return PaginationResponse.<PermisoResponse>builder()
                .content(permisos.map(permisoMapper::toResponse).getContent())
                .page(permisos.getNumber())
                .size(permisos.getSize())
                .totalElements(permisos.getTotalElements())
                .totalPages(permisos.getTotalPages())
                .first(permisos.isFirst())
                .last(permisos.isLast())
                .empty(permisos.isEmpty())
                .build();
    }

    @Override
    public PermisoResponse actualizar(Long id, PermisoUpdateRequest request) {
        Permiso permiso = permisoRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Permiso", id));
        if (request.getDescripcion() != null) permiso.setDescripcion(request.getDescripcion());
        return permisoMapper.toResponse(permisoRepository.save(permiso));
    }

    @Override
    public void eliminar(Long id) {
        Permiso permiso = permisoRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Permiso", id));
        permisoRepository.delete(permiso);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PermisoResponse> listarPorRecurso(String recurso) {
        return permisoRepository.findByRecurso(recurso).stream()
                .map(permisoMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<PermisoResponse> listarTodos() {
        return permisoRepository.findAll().stream()
                .map(permisoMapper::toResponse)
                .toList();
    }
}
