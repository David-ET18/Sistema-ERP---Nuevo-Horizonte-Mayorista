package com.example.usuarios.modules.usuario.service;

import com.example.usuarios.common.error.NotFoundException;
import com.example.usuarios.modules.usuario.dto.response.SesionResponse;
import com.example.usuarios.modules.usuario.entity.Sesion;
import com.example.usuarios.modules.usuario.entity.Usuario;
import com.example.usuarios.modules.usuario.mapper.SesionMapper;
import com.example.usuarios.modules.usuario.repository.SesionRepository;
import com.example.usuarios.modules.usuario.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class SesionServiceImpl implements SesionService {

    private final SesionRepository sesionRepository;
    private final UsuarioRepository usuarioRepository;
    private final SesionMapper sesionMapper;

    @Override
    @Transactional(readOnly = true)
    public SesionResponse obtenerPorToken(String token) {
        Sesion sesion = sesionRepository.findByToken(token)
                .orElseThrow(() -> new NotFoundException("Sesión no encontrada"));
        return sesionMapper.toResponse(sesion);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SesionResponse> listarActivasPorUsuario(Long usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new NotFoundException("Usuario", usuarioId));
        return sesionRepository.findByUsuarioAndActivaTrue(usuario).stream()
                .map(sesionMapper::toResponse)
                .toList();
    }

    @Override
    public void revocarSesion(String token) {
        Sesion sesion = sesionRepository.findByToken(token)
                .orElseThrow(() -> new NotFoundException("Sesión no encontrada"));
        sesion.setActiva(false);
        sesionRepository.save(sesion);
    }

    @Override
    public void revocarTodasSesionesUsuario(Long usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new NotFoundException("Usuario", usuarioId));
        sesionRepository.desactivarSesionesByUsuario(usuario);
    }

    @Override
    public void limpiarSesionesExpiradas() {
        sesionRepository.limpiarSesionesExpiradas(Instant.now());
    }
}