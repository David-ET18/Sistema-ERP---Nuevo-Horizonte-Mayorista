package com.example.usuarios.modules.usuario.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GerenciaBasicResponse {
    private Long id;
    private String departamento;
    private String cargo;
    private UsuarioBasicResponse usuario;
}
