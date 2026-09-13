package com.example.usuarios.modules.usuario.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PermisoResponse {
    private Long id;
    private String nombre;
    private String descripcion;
    private String recurso;
    private String accion;
    private Instant createdAt;
    private Instant updatedAt;
}