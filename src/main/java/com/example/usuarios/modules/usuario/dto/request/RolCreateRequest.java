package com.example.usuarios.modules.usuario.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RolCreateRequest {

    @NotNull
    private com.example.usuarios.modules.usuario.entity.Rol.RolNombre nombre;

    private String descripcion;
}