package com.example.usuarios.modules.usuario.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Data;

import com.example.usuarios.modules.usuario.entity.Direccion;

@Data
public class DireccionUpdateRequest {

    @Size(max = 255)
    private String calle;

    @Size(max = 20)
    private String numeroExterior;

    @Size(max = 20)
    private String numeroInterior;

    @Size(max = 100)
    private String colonia;

    @Size(max = 100)
    private String ciudad;

    @Size(max = 100)
    private String estado;

    @Size(max = 10)
    private String codigoPostal;

    @Size(max = 100)
    private String pais;

    private Boolean principal;

    @Size(max = 500)
    private String referencias;

    private Direccion.TipoDireccion tipo;
}