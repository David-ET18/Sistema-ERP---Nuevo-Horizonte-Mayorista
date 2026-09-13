package com.example.usuarios.modules.usuario.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DireccionResponse {
    private Long id;
    private String calle;
    private String numeroExterior;
    private String numeroInterior;
    private String colonia;
    private String ciudad;
    private String estado;
    private String codigoPostal;
    private String pais;
    private Boolean principal;
    private String referencias;
    private com.example.usuarios.modules.usuario.entity.Direccion.TipoDireccion tipo;
    private Instant createdAt;
    private Instant updatedAt;

    public String getDireccionCompleta() {
        StringBuilder sb = new StringBuilder();
        if (calle != null) sb.append(calle);
        if (numeroExterior != null) sb.append(" ").append(numeroExterior);
        if (numeroInterior != null) sb.append(" ").append(numeroInterior);
        if (colonia != null) sb.append(", ").append(colonia);
        if (ciudad != null) sb.append(", ").append(ciudad);
        if (estado != null) sb.append(", ").append(estado);
        if (codigoPostal != null) sb.append(" ").append(codigoPostal);
        if (pais != null) sb.append(", ").append(pais);
        return sb.toString();
    }
}