package com.example.usuarios.modules.usuario.service;

import com.example.usuarios.common.error.ConflictException;
import com.example.usuarios.common.error.NotFoundException;
import com.example.usuarios.modules.usuario.dto.request.ProveedorCreateRequest;
import com.example.usuarios.modules.usuario.dto.request.ProveedorUpdateRequest;
import com.example.usuarios.modules.usuario.dto.response.ProveedorResponse;
import com.example.usuarios.modules.usuario.entity.Proveedor;
import com.example.usuarios.modules.usuario.entity.Usuario;
import com.example.usuarios.modules.usuario.mapper.ProveedorMapper;
import com.example.usuarios.modules.usuario.repository.ProveedorRepository;
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
public class ProveedorServiceImpl implements ProveedorService {

    private final ProveedorRepository proveedorRepository;
    private final UsuarioRepository usuarioRepository;
    private final ProveedorMapper proveedorMapper;

    @Override
    public ProveedorResponse crear(Long usuarioId, ProveedorCreateRequest request) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new NotFoundException("Usuario", usuarioId));

        if (proveedorRepository.existsByUsuario(usuario)) {
            throw new ConflictException("El usuario ya tiene un perfil de proveedor");
        }
        if (proveedorRepository.existsByRfc(request.getRfc())) {
            throw new ConflictException("El RFC ya esta registrado");
        }

        Proveedor proveedor = proveedorMapper.toEntity(request);
        proveedor.setUsuario(usuario);
        proveedor.setFechaRegistro(java.time.LocalDate.now());

        return proveedorMapper.toResponse(proveedorRepository.save(proveedor));
    }

    @Override
    @Transactional(readOnly = true)
    public ProveedorResponse obtenerPorId(Long id) {
        Proveedor proveedor = proveedorRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Proveedor", id));
        return proveedorMapper.toResponse(proveedor);
    }

    @Override
    @Transactional(readOnly = true)
    public ProveedorResponse obtenerPorUsuarioId(Long usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new NotFoundException("Usuario", usuarioId));
        Proveedor proveedor = proveedorRepository.findByUsuario(usuario)
                .orElseThrow(() -> new NotFoundException("Proveedor para usuario: " + usuarioId));
        return proveedorMapper.toResponse(proveedor);
    }

    @Override
    @Transactional(readOnly = true)
    public PaginationResponse<ProveedorResponse> listar(int page, int size, Boolean activo) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Proveedor> proveedores;

        if (activo != null && activo) {
            List<Proveedor> filtered = proveedorRepository.findByActivoTrue();
            proveedores = new PageImpl<>(filtered, pageable, filtered.size());
        } else {
            proveedores = proveedorRepository.findAll(pageable);
        }

        return PaginationResponse.<ProveedorResponse>builder()
                .content(proveedores.map(proveedorMapper::toResponse).getContent())
                .page(proveedores.getNumber())
                .size(proveedores.getSize())
                .totalElements(proveedores.getTotalElements())
                .totalPages(proveedores.getTotalPages())
                .first(proveedores.isFirst())
                .last(proveedores.isLast())
                .empty(proveedores.isEmpty())
                .build();
    }

    @Override
    public ProveedorResponse actualizar(Long id, ProveedorUpdateRequest request) {
        Proveedor proveedor = proveedorRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Proveedor", id));

        if (request.getRfc() != null && !request.getRfc().equals(proveedor.getRfc())) {
            if (proveedorRepository.existsByRfc(request.getRfc())) {
                throw new ConflictException("El RFC ya esta registrado");
            }
            proveedor.setRfc(request.getRfc());
        }

        if (request.getRazonSocial() != null) proveedor.setRazonSocial(request.getRazonSocial());
        if (request.getNombreComercial() != null) proveedor.setNombreComercial(request.getNombreComercial());
        if (request.getDescripcion() != null) proveedor.setDescripcion(request.getDescripcion());
        if (request.getActivo() != null) proveedor.setActivo(request.getActivo());
        if (request.getContactoNombre() != null) proveedor.setContactoNombre(request.getContactoNombre());
        if (request.getContactoEmail() != null) proveedor.setContactoEmail(request.getContactoEmail());
        if (request.getContactoTelefono() != null) proveedor.setContactoTelefono(request.getContactoTelefono());

        return proveedorMapper.toResponse(proveedorRepository.save(proveedor));
    }

    @Override
    public void cambiarEstado(Long id, boolean activo) {
        Proveedor proveedor = proveedorRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Proveedor", id));
        proveedor.setActivo(activo);
        proveedorRepository.save(proveedor);
    }

    @Override
    public void eliminar(Long id) {
        Proveedor proveedor = proveedorRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Proveedor", id));
        proveedorRepository.delete(proveedor);
    }
}
