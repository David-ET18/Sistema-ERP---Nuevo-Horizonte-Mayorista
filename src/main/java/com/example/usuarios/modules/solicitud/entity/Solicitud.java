package com.example.usuarios.modules.solicitud.entity;

import com.example.usuarios.common.persistence.BaseEntity;
import com.example.usuarios.modules.usuario.entity.Usuario;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "solicitudes", indexes = {
        @Index(name = "idx_solicitudes_usuario", columnList = "usuario_id, created_at"),
        @Index(name = "idx_solicitudes_estado", columnList = "estado, created_at"),
        @Index(name = "idx_solicitudes_codigo", columnList = "codigo")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Solicitud extends BaseEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank @Size(max = 20)
    @Column(name = "codigo", nullable = false, unique = true, length = 20)
    private String codigo;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "tipo", nullable = false, length = 30)
    private TipoSolicitud tipo;

    @Column(name = "motivo")
    private String motivo;

    @Column(name = "fecha_inicio")
    private LocalDate fechaInicio;

    @Column(name = "fecha_fin")
    private LocalDate fechaFin;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false, length = 20)
    @Builder.Default
    private EstadoSolicitud estado = EstadoSolicitud.PENDIENTE;

    @Column(name = "comentario_gerencia")
    private String comentarioGerencia;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;
}