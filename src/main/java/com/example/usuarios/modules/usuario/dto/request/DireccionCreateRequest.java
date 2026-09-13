package com.example.usuarios.modules.usuario.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import com.example.usuarios.modules.usuario.entity.Direccion;

@Data
public class DireccionCreateRequest {

    @NotBlank @Size(max = 255)
    private String calle;

    @Size(max = 20)
    private String numeroExterior;

    @Size(max = 20)
    private String numeroInterior;

    @Size(max = 100)
    private String colonia;

    @NotBlank @Size(max = 100)
    private String ciudad;

    @NotBlank @Size(max = 100)
    private String estado;

    @NotBlank @Size(max = 10)
    private String codigoPostal;

    @NotBlank @Size(max = 100)
    private String pais;

    private Boolean principal = false;

    @Size(max = 500)
    private String referencias;

    private Direccion.TipoDireccion tipo;
}