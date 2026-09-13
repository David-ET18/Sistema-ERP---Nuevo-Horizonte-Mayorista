package com.example.usuarios.modules.usuario.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class GerenciaCreateRequest {

    @NotBlank @Size(max = 100)
    private String departamento;

    @Size(max = 100)
    private String cargo;

    @Size(max = 50)
    private String numeroEmpleado;

    private Long jefeDirectoId;

    private LocalDate fechaIngreso;
}