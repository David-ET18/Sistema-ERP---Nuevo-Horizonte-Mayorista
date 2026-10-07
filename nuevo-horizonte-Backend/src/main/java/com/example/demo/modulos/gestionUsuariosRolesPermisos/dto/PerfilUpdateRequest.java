package com.example.demo.modulos.gestionUsuariosRolesPermisos.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PerfilUpdateRequest(
        @NotBlank @Size(min = 3, max = 50)
        String username,
        @NotBlank @Email @Size(max = 100)
        String email
) {}