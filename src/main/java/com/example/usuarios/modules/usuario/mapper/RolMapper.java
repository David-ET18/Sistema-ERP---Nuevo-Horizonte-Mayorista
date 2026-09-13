package com.example.usuarios.modules.usuario.mapper;

import com.example.usuarios.modules.usuario.dto.request.RolCreateRequest;
import com.example.usuarios.modules.usuario.dto.response.PermisoResponse;
import com.example.usuarios.modules.usuario.dto.response.RolResponse;
import com.example.usuarios.modules.usuario.entity.Permiso;
import com.example.usuarios.modules.usuario.entity.Rol;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface RolMapper {
    RolMapper INSTANCE = Mappers.getMapper(RolMapper.class);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "usuarios", ignore = true)
    Rol toEntity(RolCreateRequest request);

    @Mapping(target = "permisos", source = "permisos")
    RolResponse toResponse(Rol rol);

    default Set<PermisoResponse> mapPermisos(Set<Permiso> permisos) {
        if (permisos == null) return null;
        return permisos.stream().map(PermisoMapper.INSTANCE::toResponse).collect(Collectors.toSet());
    }
}
