package com.example.usuarios.modules.usuario.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class PermisoCreateRequest {

    @NotBlank @Size(max = 100)
    private String nombre;

    @Size(max = 255)
    private String descripcion;

    @NotBlank @Size(max = 100)
    private String recurso;

    @NotBlank @Size(max = 50)
    private String accion;
}