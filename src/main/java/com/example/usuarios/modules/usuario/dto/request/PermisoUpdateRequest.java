package com.example.usuarios.modules.usuario.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class PermisoUpdateRequest {
    @Size(max = 255)
    private String descripcion;
}