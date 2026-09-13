package com.example.usuarios.modules.usuario.entity;

import com.example.usuarios.common.persistence.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Entity
@Table(name = "direcciones",
        indexes = {
                @Index(name = "idx_direcciones_usuario", columnList = "usuario_id"),
                @Index(name = "idx_direcciones_principal", columnList = "principal")
        })
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Direccion extends BaseEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank @Size(max = 255)
    @Column(name = "calle", nullable = false, length = 255)
    private String calle;

    @Size(max = 100)
    @Column(name = "numero_exterior", length = 20)
    private String numeroExterior;

    @Size(max = 20)
    @Column(name = "numero_interior", length = 20)
    private String numeroInterior;

    @Size(max = 100)
    @Column(name = "colonia", length = 100)
    private String colonia;

    @NotBlank @Size(max = 100)
    @Column(name = "ciudad", nullable = false, length = 100)
    private String ciudad;

    @NotBlank @Size(max = 100)
    @Column(name = "estado", nullable = false, length = 100)
    private String estado;

    @NotBlank @Size(max = 10)
    @Column(name = "codigo_postal", nullable = false, length = 10)
    private String codigoPostal;

    @NotBlank @Size(max = 100)
    @Column(name = "pais", nullable = false, length = 100)
    private String pais;

    @Column(name = "principal", nullable = false)
    @Builder.Default
    private Boolean principal = false;

    @Size(max = 500)
    @Column(name = "referencias", length = 500)
    private String referencias;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo", length = 20)
    private TipoDireccion tipo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    public enum TipoDireccion {
        FACTURACION, ENVIO, AMBAS
    }
}