package com.example.usuarios.modules.usuario.entity;

import com.example.usuarios.common.persistence.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "proveedores",
        indexes = {
                @Index(name = "idx_proveedores_rfc", columnList = "rfc", unique = true),
                @Index(name = "idx_proveedores_activo", columnList = "activo")
        })
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Proveedor extends BaseEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank @Size(max = 20)
    @Column(name = "rfc", nullable = false, unique = true, length = 20)
    private String rfc;

    @Size(max = 255)
    @Column(name = "razon_social", length = 255)
    private String razonSocial;

    @Size(max = 255)
    @Column(name = "nombre_comercial", length = 255)
    private String nombreComercial;

    @Column(name = "activo", nullable = false)
    @Builder.Default
    private Boolean activo = true;

    @Size(max = 500)
    @Column(name = "descripcion", length = 500)
    private String descripcion;

    @Column(name = "fecha_registro")
    private LocalDate fechaRegistro;

    @Column(name = "calificacion", precision = 3, scale = 2)
    private BigDecimal calificacion;

    @Size(max = 100)
    @Column(name = "contacto_nombre", length = 100)
    private String contactoNombre;

    @Size(max = 100)
    @Column(name = "contacto_email", length = 100)
    private String contactoEmail;

    @Size(max = 20)
    @Column(name = "contacto_telefono", length = 20)
    private String contactoTelefono;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false, unique = true)
    private Usuario usuario;

    @OneToOne(mappedBy = "proveedor", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private CuentaBancaria cuentaBancaria;

    @OneToMany(mappedBy = "proveedor", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private java.util.Set<DocumentoProveedor> documentos = new java.util.HashSet<>();
}