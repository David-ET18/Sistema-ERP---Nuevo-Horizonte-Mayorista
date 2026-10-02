package com.example.demo.modulos.tarifas.dto;

/**
 * Referencia minima de proveedor para el select del formulario de tarifas.
 * El modulo de Proveedores (feature/modulo-proveedores) ya expone su propio
 * DTO completo; este es solo mientras ambas ramas no estan integradas.
 */
public record ProveedorRefDTO(Long id, String nombre) {
}
