package com.example.usuarios.modules.usuario.mapper;

import com.example.usuarios.modules.usuario.dto.request.PermisoCreateRequest;
import com.example.usuarios.modules.usuario.dto.response.PermisoResponse;
import com.example.usuarios.modules.usuario.entity.Permiso;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface PermisoMapper {
    PermisoMapper INSTANCE = Mappers.getMapper(PermisoMapper.class);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "roles", ignore = true)
    Permiso toEntity(PermisoCreateRequest request);

    PermisoResponse toResponse(Permiso permiso);
}
