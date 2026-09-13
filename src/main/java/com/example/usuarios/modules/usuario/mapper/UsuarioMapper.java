package com.example.usuarios.modules.usuario.mapper;

import com.example.usuarios.modules.usuario.dto.request.UsuarioCreateRequest;
import com.example.usuarios.modules.usuario.dto.response.RolResponse;
import com.example.usuarios.modules.usuario.dto.response.UsuarioResponse;
import com.example.usuarios.modules.usuario.entity.Rol;
import com.example.usuarios.modules.usuario.entity.Usuario;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface UsuarioMapper {
    UsuarioMapper INSTANCE = Mappers.getMapper(UsuarioMapper.class);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "roles", ignore = true)
    @Mapping(target = "direcciones", ignore = true)
    @Mapping(target = "proveedor", ignore = true)
    @Mapping(target = "gerencia", ignore = true)
    Usuario toEntity(UsuarioCreateRequest request);

    @Mapping(target = "roles", source = "roles")
    @Mapping(target = "nombreCompleto", expression = "java(usuario.getNombreCompleto())")
    @Mapping(target = "isGerencia", expression = "java(usuario.isGerencia())")
    @Mapping(target = "isTrabajador", expression = "java(usuario.isTrabajador())")
    UsuarioResponse toResponse(Usuario usuario);

    default Set<RolResponse> mapRoles(Set<Rol> roles) {
        if (roles == null) return null;
        return roles.stream().map(RolMapper.INSTANCE::toResponse).collect(Collectors.toSet());
    }
}
