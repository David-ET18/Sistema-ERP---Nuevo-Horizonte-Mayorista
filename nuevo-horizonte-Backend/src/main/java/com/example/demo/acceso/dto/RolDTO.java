package com.example.demo.acceso.dto;

public record RolDTO(Long id, String nombre, String descripcion, java.util.List<PermisoDTO> permisos) {
}