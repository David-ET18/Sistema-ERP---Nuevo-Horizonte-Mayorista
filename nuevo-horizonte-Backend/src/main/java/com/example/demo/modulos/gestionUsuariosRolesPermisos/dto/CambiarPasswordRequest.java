package com.example.demo.modulos.gestionUsuariosRolesPermisos.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CambiarPasswordRequest(
        @NotBlank
        String passwordActual,
        @NotBlank @Size(min = 6, max = 100)
        String nuevaContrasena,
        @NotBlank @Size(min = 6, max = 100)
        String confirmarContrasena
) {}