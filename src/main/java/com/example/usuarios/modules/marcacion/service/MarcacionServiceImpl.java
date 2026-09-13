package com.example.usuarios.modules.marcacion.service;

import com.example.usuarios.common.error.NotFoundException;
import com.example.usuarios.modules.marcacion.dto.request.MarcacionCreateRequest;
import com.example.usuarios.modules.marcacion.dto.response.MarcacionResponse;
import com.example.usuarios.modules.marcacion.dto.response.MarcacionResumenResponse;
import com.example.usuarios.modules.marcacion.entity.Marcacion;
import com.example.usuarios.modules.marcacion.entity.TipoMarcacion;
import com.example.usuarios.modules.marcacion.repository.MarcacionRepository;
import com.example.usuarios.modules.usuario.entity.Usuario;
import com.example.usuarios.modules.usuario.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MarcacionServiceImpl implements MarcacionService {

    private static final long VENTANA_MINUTOS = 10;

    private final MarcacionRepository marcacionRepository;
    private final UsuarioRepository usuarioRepository;

    private MarcacionResponse registrar(TipoMarcacion tipo, LocalDate fecha, LocalTime hora, Usuario usuario) {
        Marcacion marcacion = Marcacion.builder()
                .tipo(tipo)
                .fecha(fecha)
                .hora(hora)
                .usuario(usuario)
                .build();
        return toResponse(marcacionRepository.save(marcacion));
    }

    private static MarcacionResponse toResponse(Marcacion m) {
        return new MarcacionResponse(m.getId(), m.getTipo(), m.getFecha(), m.getHora(), m.getUsuario().getId());
    }

    @Override
    @Transactional
    public MarcacionResponse registrar(Long usuarioId, MarcacionCreateRequest request) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));
        LocalDate fecha = request.fechaOrDefault();
        LocalTime hora = request.horaOrDefault();

        marcacionRepository.findFirstByUsuarioIdAndTipoAndFechaOrderByHoraDesc(usuarioId, request.tipo(), fecha)
                .ifPresent(ultima -> {
                    long diffMin = java.time.Duration.between(ultima.getHora(), hora).toMinutes();
                    if (diffMin >= 0 && diffMin < VENTANA_MINUTOS) {
                        throw new IllegalStateException("Ya registraste " + request.tipo() + " hace menos de " + VENTANA_MINUTOS + " minutos");
                    }
                });

        return registrar(request.tipo(), fecha, hora, usuario);
    }

    @Override
    @Transactional(readOnly = true)
    public MarcacionResponse ultima(Long usuarioId, String tipo) {
        TipoMarcacion tipoMarcacion = TipoMarcacion.valueOf(tipo.trim().toUpperCase());
        return marcacionRepository
                .findFirstByUsuarioIdAndTipoAndFechaOrderByHoraDesc(usuarioId, tipoMarcacion, LocalDate.now())
                .map(MarcacionServiceImpl::toResponse)
                .orElse(null);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MarcacionResponse> historialHoy(Long usuarioId) {
        return marcacionRepository
                .findByUsuarioIdAndFechaOrderByHoraAsc(usuarioId, LocalDate.now())
                .stream()
                .map(MarcacionServiceImpl::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public MarcacionResumenResponse resumenDia(Long usuarioId, LocalDate fecha) {
        LocalDate dia = fecha != null ? fecha : LocalDate.now();
        LocalTime entrada = marcacionRepository
                .findFirstByUsuarioIdAndTipoAndFechaOrderByHoraDesc(usuarioId, TipoMarcacion.ENTRADA, dia)
                .map(Marcacion::getHora)
                .orElse(null);
        LocalTime salida = marcacionRepository
                .findFirstByUsuarioIdAndTipoAndFechaOrderByHoraDesc(usuarioId, TipoMarcacion.SALIDA, dia)
                .map(Marcacion::getHora)
                .orElse(null);
        return new MarcacionResumenResponse(dia, entrada, salida);
    }
}