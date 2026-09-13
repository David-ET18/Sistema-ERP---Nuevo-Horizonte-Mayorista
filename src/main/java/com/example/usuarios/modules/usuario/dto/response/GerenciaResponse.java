package com.example.usuarios.modules.usuario.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GerenciaResponse {
    private Long id;
    private String departamento;
    private String cargo;
    private String numeroEmpleado;
    private Boolean activo;
    private LocalDate fechaIngreso;
    private Instant createdAt;
    private Instant updatedAt;
    private UsuarioBasicResponse usuario;
    private GerenciaBasicResponse jefeDirecto;
    private Integer totalSubordinados;
}

