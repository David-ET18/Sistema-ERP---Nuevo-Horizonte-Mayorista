package com.example.usuarios.modules.usuario.service;

import com.example.usuarios.common.error.BadRequestException;
import com.example.usuarios.common.error.ConflictException;
import com.example.usuarios.common.error.NotFoundException;
import com.example.usuarios.common.security.JwtService;
import com.example.usuarios.common.security.JwtUserDetails;
import com.example.usuarios.modules.usuario.dto.request.LoginRequest;
import com.example.usuarios.modules.usuario.dto.request.RegisterRequest;
import com.example.usuarios.modules.usuario.dto.response.AuthResponse;
import com.example.usuarios.modules.usuario.dto.response.UsuarioResponse;
import com.example.usuarios.modules.usuario.entity.Rol;
import com.example.usuarios.modules.usuario.entity.Usuario;
import com.example.usuarios.modules.usuario.mapper.UsuarioMapper;
import com.example.usuarios.modules.usuario.repository.RolRepository;
import com.example.usuarios.modules.usuario.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final UsuarioMapper usuarioMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Value("${app.jwt.expiration:86400000}")
    private long jwtExpiration;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (usuarioRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("El email ya esta registrado");
        }
        if (usuarioRepository.existsByUsername(request.getUsername())) {
            throw new ConflictException("El username ya esta en uso");
        }

        Usuario usuario = new Usuario();
        usuario.setUsername(request.getUsername());
        usuario.setEmail(request.getEmail());
        usuario.setPassword(passwordEncoder.encode(request.getPassword()));
        usuario.setNombre(request.getNombre());
        usuario.setApellido(request.getApellido());
        usuario.setTelefono(request.getTelefono());
        usuario.setActivo(true);
        usuario.setEmailVerificado(false);

        Rol rolTrabajador = rolRepository.findByNombre(Rol.RolNombre.TRABAJADOR)
                .orElseThrow(() -> new NotFoundException("Rol TRABAJADOR no configurado"));
        usuario.getRoles().add(rolTrabajador);

        Usuario saved = usuarioRepository.save(usuario);
        return buildAuthResponse(saved);
    }

    public AuthResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
        } catch (BadCredentialsException e) {
            throw new BadRequestException("Credenciales incorrectas");
        }

        Usuario usuario = usuarioRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new NotFoundException("Usuario"));

        if (usuario.getActivo() == null || !usuario.getActivo()) {
            throw new BadRequestException("La cuenta esta desactivada");
        }

        usuario.setUltimoAcceso(Instant.now());
        usuarioRepository.save(usuario);

        return buildAuthResponse(usuario);
    }

    private AuthResponse buildAuthResponse(Usuario usuario) {
        JwtUserDetails userDetails = JwtUserDetails.fromUsuario(usuario);
        String accessToken = jwtService.generateToken(userDetails);
        String refreshToken = jwtService.generateRefreshToken(userDetails);

        UsuarioResponse usuarioResponse = usuarioMapper.toResponse(usuario);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtExpiration)
                .usuario(usuarioResponse)
                .build();
    }
}
