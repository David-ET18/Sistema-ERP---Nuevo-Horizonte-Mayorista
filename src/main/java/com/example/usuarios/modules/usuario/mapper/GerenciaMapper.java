package com.example.usuarios.modules.usuario.mapper;

import com.example.usuarios.modules.usuario.dto.request.GerenciaCreateRequest;
import com.example.usuarios.modules.usuario.dto.response.GerenciaBasicResponse;
import com.example.usuarios.modules.usuario.dto.response.GerenciaResponse;
import com.example.usuarios.modules.usuario.dto.response.UsuarioBasicResponse;
import com.example.usuarios.modules.usuario.entity.Gerencia;
import com.example.usuarios.modules.usuario.entity.Usuario;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface GerenciaMapper {
    GerenciaMapper INSTANCE = Mappers.getMapper(GerenciaMapper.class);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "usuario", ignore = true)
    @Mapping(target = "jefeDirecto", ignore = true)
    @Mapping(target = "subordinados", ignore = true)
    @Mapping(target = "activo", ignore = true)
    Gerencia toEntity(GerenciaCreateRequest request);

    default GerenciaResponse toResponse(Gerencia gerencia) {
        if (gerencia == null) return null;
        return GerenciaResponse.builder()
                .id(gerencia.getId())
                .departamento(gerencia.getDepartamento())
                .cargo(gerencia.getCargo())
                .numeroEmpleado(gerencia.getNumeroEmpleado())
                .activo(gerencia.getActivo())
                .fechaIngreso(gerencia.getFechaIngreso())
                .createdAt(gerencia.getCreatedAt())
                .updatedAt(gerencia.getUpdatedAt())
                .usuario(mapUsuarioBasic(gerencia.getUsuario()))
                .jefeDirecto(mapJefeDirecto(gerencia.getJefeDirecto()))
                .totalSubordinados(gerencia.getSubordinados() != null ? gerencia.getSubordinados().size() : 0)
                .build();
    }

    default UsuarioBasicResponse mapUsuarioBasic(Usuario usuario) {
        if (usuario == null) return null;
        return UsuarioBasicResponse.builder()
                .id(usuario.getId())
                .username(usuario.getUsername())
                .email(usuario.getEmail())
                .nombre(usuario.getNombre())
                .apellido(usuario.getApellido())
                .build();
    }

    default GerenciaBasicResponse mapJefeDirecto(Gerencia jefe) {
        if (jefe == null) return null;
        return GerenciaBasicResponse.builder()
                .id(jefe.getId())
                .departamento(jefe.getDepartamento())
                .cargo(jefe.getCargo())
                .usuario(mapUsuarioBasic(jefe.getUsuario()))
                .build();
    }
}
