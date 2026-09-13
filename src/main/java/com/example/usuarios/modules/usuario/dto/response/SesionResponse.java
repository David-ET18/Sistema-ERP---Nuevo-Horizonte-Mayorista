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
public class SesionResponse {
    private Long id;
    private String token;
    private Instant expiraEn;
    private Instant refreshExpiraEn;
    private String ip;
    private String userAgent;
    private Boolean activa;
    private Instant createdAt;
}