package com.example.usuarios.modules.usuario.service;

import com.example.usuarios.common.error.ConflictException;
import com.example.usuarios.common.error.NotFoundException;
import com.example.usuarios.modules.usuario.dto.request.UsuarioCreateRequest;
import com.example.usuarios.modules.usuario.dto.request.UsuarioUpdateRequest;
import com.example.usuarios.modules.usuario.dto.response.UsuarioResponse;
import com.example.usuarios.modules.usuario.entity.Rol;
import com.example.usuarios.modules.usuario.entity.Usuario;
import com.example.usuarios.modules.usuario.mapper.UsuarioMapper;
import com.example.usuarios.modules.usuario.repository.RolRepository;
import com.example.usuarios.modules.usuario.repository.UsuarioRepository;
import com.example.usuarios.common.api.PaginationResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class UsuarioServiceImpl implements UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final UsuarioMapper usuarioMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    public UsuarioResponse crear(UsuarioCreateRequest request) {
        if (usuarioRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("El email ya esta registrado");
        }
        if (usuarioRepository.existsByUsername(request.getUsername())) {
            throw new ConflictException("El username ya esta en uso");
        }

        Usuario usuario = usuarioMapper.toEntity(request);
        usuario.setPassword(passwordEncoder.encode(request.getPassword()));

        if (request.getRoles() != null && !request.getRoles().isEmpty()) {
            request.getRoles().forEach(rolId -> {
                Rol rol = rolRepository.findById(rolId)
                        .orElseThrow(() -> new NotFoundException("Rol", rolId));
                usuario.getRoles().add(rol);
            });
        } else {
            Rol rolDefault = rolRepository.findByNombre(Rol.RolNombre.TRABAJADOR)
                    .orElseThrow(() -> new NotFoundException("Rol TRABAJADOR no configurado"));
            usuario.getRoles().add(rolDefault);
        }

        return usuarioMapper.toResponse(usuarioRepository.save(usuario));
    }

    @Override
    @Transactional(readOnly = true)
    public UsuarioResponse obtenerPorId(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Usuario", id));
        return usuarioMapper.toResponse(usuario);
    }

    @Override
    @Transactional(readOnly = true)
    public UsuarioResponse obtenerPorEmail(String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Usuario con email: " + email));
        return usuarioMapper.toResponse(usuario);
    }

    @Override
    @Transactional(readOnly = true)
    public PaginationResponse<UsuarioResponse> listar(int page, int size, String search, Rol.RolNombre rol) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        String busqueda = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        Page<Usuario> usuarios = usuarioRepository.findPagedByRolAndSearch(rol, busqueda, pageable);

        return PaginationResponse.<UsuarioResponse>builder()
                .content(usuarios.map(usuarioMapper::toResponse).getContent())
                .page(usuarios.getNumber())
                .size(usuarios.getSize())
                .totalElements(usuarios.getTotalElements())
                .totalPages(usuarios.getTotalPages())
                .first(usuarios.isFirst())
                .last(usuarios.isLast())
                .empty(usuarios.isEmpty())
                .build();
    }

    @Override
    public UsuarioResponse actualizar(Long id, UsuarioUpdateRequest request) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Usuario", id));

        if (request.getEmail() != null && !request.getEmail().equals(usuario.getEmail())) {
            if (usuarioRepository.existsByEmail(request.getEmail())) {
                throw new ConflictException("El email ya esta registrado");
            }
            usuario.setEmail(request.getEmail());
        }

        if (request.getUsername() != null && !request.getUsername().equals(usuario.getUsername())) {
            if (usuarioRepository.existsByUsername(request.getUsername())) {
                throw new ConflictException("El username ya esta en uso");
            }
            usuario.setUsername(request.getUsername());
        }

        if (request.getNombre() != null) usuario.setNombre(request.getNombre());
        if (request.getApellido() != null) usuario.setApellido(request.getApellido());
        if (request.getTelefono() != null) usuario.setTelefono(request.getTelefono());
        if (request.getActivo() != null) usuario.setActivo(request.getActivo());

        return usuarioMapper.toResponse(usuarioRepository.save(usuario));
    }

    @Override
    public void cambiarEstado(Long id, boolean activo) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Usuario", id));
        usuario.setActivo(activo);
        usuarioRepository.save(usuario);
    }

    @Override
    public void eliminar(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Usuario", id));
        usuarioRepository.delete(usuario);
    }

    @Override
    public void asignarRol(Long usuarioId, Long rolId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new NotFoundException("Usuario", usuarioId));
        Rol rol = rolRepository.findById(rolId)
                .orElseThrow(() -> new NotFoundException("Rol", rolId));
        usuario.getRoles().add(rol);
        usuarioRepository.save(usuario);
    }

    @Override
    public void removerRol(Long usuarioId, Long rolId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new NotFoundException("Usuario", usuarioId));
        Rol rol = rolRepository.findById(rolId)
                .orElseThrow(() -> new NotFoundException("Rol", rolId));
        usuario.getRoles().remove(rol);
        usuarioRepository.save(usuario);
    }
}
