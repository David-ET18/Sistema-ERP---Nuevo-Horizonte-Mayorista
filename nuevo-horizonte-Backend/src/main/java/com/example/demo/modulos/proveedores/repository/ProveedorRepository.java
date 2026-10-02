package com.example.demo.modulos.proveedores.repository;

import com.example.demo.modulos.proveedores.entity.Proveedor;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Repositorio minimo para resolver la FK de Proveedor desde otros modulos
 * (tarifas). El CRUD completo de Proveedor vive en feature/modulo-proveedores;
 * esta interfaz se reconciliara con esa al integrar a develop.
 */
public interface ProveedorRepository extends JpaRepository<Proveedor, Long> {
}
