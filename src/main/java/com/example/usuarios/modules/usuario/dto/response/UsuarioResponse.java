package com.example.usuarios.modules.usuario.dto.response;

import com.example.usuarios.modules.usuario.entity.Rol;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioResponse {
    private Long id;
    private String username;
    private String email;
    private String nombre;
    private String apellido;
    private String telefono;
    private Boolean activo;
    private Boolean emailVerificado;
    private Instant ultimoAcceso;
    private Instant createdAt;
    private Instant updatedAt;
    private Set<RolResponse> roles;
    private String nombreCompleto;
    private boolean isGerencia;
    private boolean isTrabajador;
}