package com.example.usuarios.modules.usuario.service;

import com.example.usuarios.common.error.NotFoundException;
import com.example.usuarios.modules.usuario.dto.request.DireccionCreateRequest;
import com.example.usuarios.modules.usuario.dto.request.DireccionUpdateRequest;
import com.example.usuarios.modules.usuario.dto.response.DireccionResponse;
import com.example.usuarios.modules.usuario.entity.Direccion;
import com.example.usuarios.modules.usuario.entity.Usuario;
import com.example.usuarios.modules.usuario.mapper.DireccionMapper;
import com.example.usuarios.modules.usuario.repository.DireccionRepository;
import com.example.usuarios.modules.usuario.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class DireccionServiceImpl implements DireccionService {

    private final DireccionRepository direccionRepository;
    private final UsuarioRepository usuarioRepository;
    private final DireccionMapper direccionMapper;

    @Override
    public DireccionResponse crear(Long usuarioId, DireccionCreateRequest request) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new NotFoundException("Usuario", usuarioId));

        if (request.getPrincipal() != null && request.getPrincipal() && direccionRepository.findByUsuarioAndPrincipalTrue(usuario).isPresent()) {
            throw new IllegalArgumentException("Ya existe una direccion principal para este usuario");
        }

        Direccion direccion = direccionMapper.toEntity(request);
        direccion.setUsuario(usuario);
        return direccionMapper.toResponse(direccionRepository.save(direccion));
    }

    @Override
    @Transactional(readOnly = true)
    public DireccionResponse obtenerPorId(Long id) {
        Direccion direccion = direccionRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Direccion", id));
        return direccionMapper.toResponse(direccion);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DireccionResponse> listarPorUsuario(Long usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new NotFoundException("Usuario", usuarioId));
        return direccionRepository.findByUsuario(usuario).stream()
                .map(direccionMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public DireccionResponse obtenerPrincipal(Long usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new NotFoundException("Usuario", usuarioId));
        Direccion direccion = direccionRepository.findByUsuarioAndPrincipalTrue(usuario)
                .orElseThrow(() -> new NotFoundException("Direccion principal no encontrada"));
        return direccionMapper.toResponse(direccion);
    }

    @Override
    public DireccionResponse actualizar(Long id, DireccionUpdateRequest request) {
        Direccion direccion = direccionRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Direccion", id));

        if (request.getPrincipal() != null && request.getPrincipal()) {
            direccionRepository.findByUsuarioAndPrincipalTrue(direccion.getUsuario())
                    .filter(d -> !d.getId().equals(id))
                    .ifPresent(d -> {
                        d.setPrincipal(false);
                        direccionRepository.save(d);
                    });
        }

        if (request.getCalle() != null) direccion.setCalle(request.getCalle());
        if (request.getNumeroExterior() != null) direccion.setNumeroExterior(request.getNumeroExterior());
        if (request.getNumeroInterior() != null) direccion.setNumeroInterior(request.getNumeroInterior());
        if (request.getColonia() != null) direccion.setColonia(request.getColonia());
        if (request.getCiudad() != null) direccion.setCiudad(request.getCiudad());
        if (request.getEstado() != null) direccion.setEstado(request.getEstado());
        if (request.getCodigoPostal() != null) direccion.setCodigoPostal(request.getCodigoPostal());
        if (request.getPais() != null) direccion.setPais(request.getPais());
        if (request.getPrincipal() != null) direccion.setPrincipal(request.getPrincipal());
        if (request.getReferencias() != null) direccion.setReferencias(request.getReferencias());
        if (request.getTipo() != null) direccion.setTipo(request.getTipo());

        return direccionMapper.toResponse(direccionRepository.save(direccion));
    }

    @Override
    public void establecerPrincipal(Long usuarioId, Long direccionId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new NotFoundException("Usuario", usuarioId));

        direccionRepository.findByUsuarioAndPrincipalTrue(usuario)
                .ifPresent(d -> {
                    d.setPrincipal(false);
                    direccionRepository.save(d);
                });

        Direccion direccion = direccionRepository.findById(direccionId)
                .orElseThrow(() -> new NotFoundException("Direccion", direccionId));
        if (!direccion.getUsuario().getId().equals(usuarioId)) {
            throw new IllegalArgumentException("La direccion no pertenece al usuario");
        }
        direccion.setPrincipal(true);
        direccionRepository.save(direccion);
    }

    @Override
    public void eliminar(Long id) {
        Direccion direccion = direccionRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Direccion", id));
        direccionRepository.delete(direccion);
    }
}
