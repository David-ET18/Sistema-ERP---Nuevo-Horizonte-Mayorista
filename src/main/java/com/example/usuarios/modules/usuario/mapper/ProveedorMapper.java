package com.example.usuarios.modules.usuario.mapper;

import com.example.usuarios.modules.usuario.dto.request.ProveedorCreateRequest;
import com.example.usuarios.modules.usuario.dto.response.CuentaBancariaResponse;
import com.example.usuarios.modules.usuario.dto.response.ProveedorResponse;
import com.example.usuarios.modules.usuario.dto.response.UsuarioBasicResponse;
import com.example.usuarios.modules.usuario.entity.CuentaBancaria;
import com.example.usuarios.modules.usuario.entity.Proveedor;
import com.example.usuarios.modules.usuario.entity.Usuario;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface ProveedorMapper {
    ProveedorMapper INSTANCE = Mappers.getMapper(ProveedorMapper.class);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "usuario", ignore = true)
    @Mapping(target = "cuentaBancaria", ignore = true)
    @Mapping(target = "documentos", ignore = true)
    @Mapping(target = "activo", ignore = true)
    @Mapping(target = "fechaRegistro", ignore = true)
    @Mapping(target = "calificacion", ignore = true)
    Proveedor toEntity(ProveedorCreateRequest request);

    default ProveedorResponse toResponse(Proveedor proveedor) {
        if (proveedor == null) return null;
        return ProveedorResponse.builder()
                .id(proveedor.getId())
                .rfc(proveedor.getRfc())
                .razonSocial(proveedor.getRazonSocial())
                .nombreComercial(proveedor.getNombreComercial())
                .activo(proveedor.getActivo())
                .descripcion(proveedor.getDescripcion())
                .fechaRegistro(proveedor.getFechaRegistro())
                .calificacion(proveedor.getCalificacion())
                .contactoNombre(proveedor.getContactoNombre())
                .contactoEmail(proveedor.getContactoEmail())
                .contactoTelefono(proveedor.getContactoTelefono())
                .createdAt(proveedor.getCreatedAt())
                .updatedAt(proveedor.getUpdatedAt())
                .usuario(mapUsuarioBasic(proveedor.getUsuario()))
                .cuentaBancaria(mapCuentaBancaria(proveedor.getCuentaBancaria()))
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

    default CuentaBancariaResponse mapCuentaBancaria(CuentaBancaria cuenta) {
        if (cuenta == null) return null;
        return CuentaBancariaResponse.builder()
                .id(cuenta.getId())
                .banco(cuenta.getBanco())
                .clabe(cuenta.getClabe())
                .numeroCuenta(cuenta.getNumeroCuenta())
                .titular(cuenta.getTitular())
                .tipoCuenta(cuenta.getTipoCuenta() != null ? cuenta.getTipoCuenta().name() : null)
                .build();
    }
}
