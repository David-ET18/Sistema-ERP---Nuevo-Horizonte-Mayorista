package com.example.usuarios.modules.usuario.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioBasicResponse {
    private Long id;
    private String username;
    private String email;
    private String nombre;
    private String apellido;
}
