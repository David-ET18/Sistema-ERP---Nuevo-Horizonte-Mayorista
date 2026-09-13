package com.example.usuarios.modules.usuario.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CuentaBancariaResponse {
    private Long id;
    private String banco;
    private String clabe;
    private String numeroCuenta;
    private String titular;
    private String tipoCuenta;
}
