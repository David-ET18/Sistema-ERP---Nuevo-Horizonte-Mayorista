package com.example.usuarios.modules.usuario.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class GerenciaUpdateRequest {

    @Size(max = 100)
    private String departamento;

    @Size(max = 100)
    private String cargo;

    @Size(max = 50)
    private String numeroEmpleado;

    private Boolean activo;

    private Long jefeDirectoId;
}