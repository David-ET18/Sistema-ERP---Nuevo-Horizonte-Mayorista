package com.example.usuarios.modules.usuario.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UsuarioUpdateRequest {

    @Size(max = 100)
    private String username;

    @Email @Size(max = 255)
    private String email;

    @Size(max = 100)
    private String nombre;

    @Size(max = 100)
    private String apellido;

    @Size(max = 20)
    private String telefono;

    private Boolean activo;
}