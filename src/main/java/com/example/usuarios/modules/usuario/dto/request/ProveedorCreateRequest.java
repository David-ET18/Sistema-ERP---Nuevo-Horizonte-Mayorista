package com.example.usuarios.modules.usuario.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ProveedorCreateRequest {

    @NotBlank @Size(max = 20)
    private String rfc;

    @Size(max = 255)
    private String razonSocial;

    @Size(max = 255)
    private String nombreComercial;

    @Size(max = 500)
    private String descripcion;

    @Size(max = 100)
    private String contactoNombre;

    @Size(max = 100)
    private String contactoEmail;

    @Size(max = 20)
    private String contactoTelefono;
}