package com.example.usuarios.modules.usuario.mapper;

import com.example.usuarios.modules.usuario.dto.response.AuditoriaResponse;
import com.example.usuarios.modules.usuario.dto.response.UsuarioBasicResponse;
import com.example.usuarios.modules.usuario.entity.Auditoria;
import com.example.usuarios.modules.usuario.entity.Usuario;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring", unmappedTargetPolicy = org.mapstruct.ReportingPolicy.IGNORE)
public interface AuditoriaMapper {
    AuditoriaMapper INSTANCE = Mappers.getMapper(AuditoriaMapper.class);

    default AuditoriaResponse toResponse(Auditoria auditoria) {
        if (auditoria == null) return null;
        return AuditoriaResponse.builder()
                .id(auditoria.getId())
                .entidad(auditoria.getEntidad())
                .entidadId(auditoria.getEntidadId())
                .accion(auditoria.getAccion())
                .valoresAnteriores(auditoria.getValoresAnteriores())
                .valoresNuevos(auditoria.getValoresNuevos())
                .ip(auditoria.getIp())
                .userAgent(auditoria.getUserAgent())
                .fecha(auditoria.getFecha())
                .usuario(mapUsuarioBasic(auditoria.getUsuario()))
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
}
