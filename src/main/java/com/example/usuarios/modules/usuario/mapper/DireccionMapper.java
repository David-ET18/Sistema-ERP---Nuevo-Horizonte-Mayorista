package com.example.usuarios.modules.usuario.mapper;

import com.example.usuarios.modules.usuario.dto.request.DireccionCreateRequest;
import com.example.usuarios.modules.usuario.dto.response.DireccionResponse;
import com.example.usuarios.modules.usuario.entity.Direccion;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface DireccionMapper {
    DireccionMapper INSTANCE = Mappers.getMapper(DireccionMapper.class);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "usuario", ignore = true)
    Direccion toEntity(DireccionCreateRequest request);

    DireccionResponse toResponse(Direccion direccion);
}
