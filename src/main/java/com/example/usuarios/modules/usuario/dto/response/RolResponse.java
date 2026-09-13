package com.example.usuarios.modules.usuario.dto.response;

import com.example.usuarios.modules.usuario.entity.Permiso;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RolResponse {
    private Long id;
    private com.example.usuarios.modules.usuario.entity.Rol.RolNombre nombre;
    private String descripcion;
    private Instant createdAt;
    private Instant updatedAt;
    private Set<PermisoResponse> permisos;
}