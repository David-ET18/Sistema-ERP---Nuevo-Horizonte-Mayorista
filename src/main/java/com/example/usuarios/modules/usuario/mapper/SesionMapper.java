package com.example.usuarios.modules.usuario.mapper;

import com.example.usuarios.modules.usuario.dto.response.SesionResponse;
import com.example.usuarios.modules.usuario.entity.Sesion;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface SesionMapper {
    SesionMapper INSTANCE = Mappers.getMapper(SesionMapper.class);

    SesionResponse toResponse(Sesion sesion);
}
