package com.example.usuarios.modules.usuario.service;

import com.example.usuarios.common.error.ConflictException;
import com.example.usuarios.common.error.NotFoundException;
import com.example.usuarios.modules.usuario.dto.request.RolCreateRequest;
import com.example.usuarios.modules.usuario.dto.request.RolUpdateRequest;
import com.example.usuarios.modules.usuario.dto.response.RolResponse;
import com.example.usuarios.modules.usuario.entity.Permiso;
import com.example.usuarios.modules.usuario.entity.Rol;
import com.example.usuarios.modules.usuario.mapper.RolMapper;
import com.example.usuarios.modules.usuario.repository.PermisoRepository;
import com.example.usuarios.modules.usuario.repository.RolRepository;
import com.example.usuarios.common.api.PaginationResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class RolServiceImpl implements RolService {

    private final RolRepository rolRepository;
    private final PermisoRepository permisoRepository;
    private final RolMapper rolMapper;

    @Override
    public RolResponse crear(RolCreateRequest request) {
        if (rolRepository.existsByNombre(request.getNombre())) {
            throw new ConflictException("El rol ya existe");
        }
        Rol rol = rolMapper.toEntity(request);
        return rolMapper.toResponse(rolRepository.save(rol));
    }

    @Override
    @Transactional(readOnly = true)
    public RolResponse obtenerPorId(Long id) {
        Rol rol = rolRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Rol", id));
        return rolMapper.toResponse(rol);
    }

    @Override
    @Transactional(readOnly = true)
    public RolResponse obtenerPorNombre(Rol.RolNombre nombre) {
        Rol rol = rolRepository.findByNombre(nombre)
                .orElseThrow(() -> new NotFoundException("Rol con nombre: " + nombre));
        return rolMapper.toResponse(rol);
    }

    @Override
    @Transactional(readOnly = true)
    public PaginationResponse<RolResponse> listar(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("nombre").ascending());
        Page<Rol> roles = rolRepository.findAll(pageable);

        return PaginationResponse.<RolResponse>builder()
                .content(roles.map(rolMapper::toResponse).getContent())
                .page(roles.getNumber())
                .size(roles.getSize())
                .totalElements(roles.getTotalElements())
                .totalPages(roles.getTotalPages())
                .first(roles.isFirst())
                .last(roles.isLast())
                .empty(roles.isEmpty())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<RolResponse> listarTodos() {
        return rolRepository.findAll().stream()
                .map(rolMapper::toResponse)
                .toList();
    }

    @Override
    public RolResponse actualizar(Long id, RolUpdateRequest request) {
        Rol rol = rolRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Rol", id));
        if (request.getDescripcion() != null) rol.setDescripcion(request.getDescripcion());
        return rolMapper.toResponse(rolRepository.save(rol));
    }

    @Override
    public void eliminar(Long id) {
        Rol rol = rolRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Rol", id));
        rolRepository.delete(rol);
    }

    @Override
    public void asignarPermiso(Long rolId, Long permisoId) {
        Rol rol = rolRepository.findById(rolId)
                .orElseThrow(() -> new NotFoundException("Rol", rolId));
        Permiso permiso = permisoRepository.findById(permisoId)
                .orElseThrow(() -> new NotFoundException("Permiso", permisoId));
        rol.getPermisos().add(permiso);
        rolRepository.save(rol);
    }

    @Override
    public void removerPermiso(Long rolId, Long permisoId) {
        Rol rol = rolRepository.findById(rolId)
                .orElseThrow(() -> new NotFoundException("Rol", rolId));
        Permiso permiso = permisoRepository.findById(permisoId)
                .orElseThrow(() -> new NotFoundException("Permiso", permisoId));
        rol.getPermisos().remove(permiso);
        rolRepository.save(rol);
    }
}
