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
public class AuditoriaResponse {
    private Long id;
    private String entidad;
    private String entidadId;
    private String accion;
    private String valoresAnteriores;
    private String valoresNuevos;
    private String ip;
    private String userAgent;
    private Instant fecha;
    private UsuarioBasicResponse usuario;
}