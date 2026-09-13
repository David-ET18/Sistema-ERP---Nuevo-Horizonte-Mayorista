package com.example.usuarios.modules.usuario.entity;

import com.example.usuarios.common.persistence.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "gerencias",
        indexes = {
                @Index(name = "idx_gerencias_departamento", columnList = "departamento"),
                @Index(name = "idx_gerencias_activo", columnList = "activo")
        })
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Gerencia extends BaseEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank @Size(max = 100)
    @Column(name = "departamento", nullable = false, length = 100)
    private String departamento;

    @Size(max = 100)
    @Column(name = "cargo", length = 100)
    private String cargo;

    @Size(max = 50)
    @Column(name = "numero_empleado", unique = true, length = 50)
    private String numeroEmpleado;

    @Column(name = "activo", nullable = false)
    @Builder.Default
    private Boolean activo = true;

    @Column(name = "fecha_ingreso")
    private LocalDate fechaIngreso;

    @Column(name = "jefe_directo_id")
    private Long jefeDirectoId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false, unique = true)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "jefe_directo_id", insertable = false, updatable = false)
    private Gerencia jefeDirecto;

    @OneToMany(mappedBy = "jefeDirecto", fetch = FetchType.LAZY)
    @Builder.Default
    private java.util.Set<Gerencia> subordinados = new java.util.HashSet<>();
}