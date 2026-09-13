package com.example.usuarios.modules.usuario.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProveedorResponse {
    private Long id;
    private String rfc;
    private String razonSocial;
    private String nombreComercial;
    private Boolean activo;
    private String descripcion;
    private LocalDate fechaRegistro;
    private BigDecimal calificacion;
    private String contactoNombre;
    private String contactoEmail;
    private String contactoTelefono;
    private Instant createdAt;
    private Instant updatedAt;
    private UsuarioBasicResponse usuario;
    private CuentaBancariaResponse cuentaBancaria;
}

