package com.example.usuarios.modules.usuario.entity;

import com.example.usuarios.common.persistence.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Entity
@Table(name = "auditoria",
        indexes = {
                @Index(name = "idx_auditoria_usuario_fecha", columnList = "usuario_id, fecha"),
                @Index(name = "idx_auditoria_entidad", columnList = "entidad, entidad_id"),
                @Index(name = "idx_auditoria_accion_fecha", columnList = "accion, fecha"),
                @Index(name = "idx_auditoria_fecha", columnList = "fecha")
        })
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Auditoria extends BaseEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank @Size(max = 100)
    @Column(name = "entidad", nullable = false, length = 100)
    private String entidad;

    @NotBlank @Size(max = 100)
    @Column(name = "entidad_id", nullable = false, length = 100)
    private String entidadId;

    @NotBlank @Size(max = 50)
    @Column(name = "accion", nullable = false, length = 50)
    private String accion;

    @Column(name = "valores_anteriores", columnDefinition = "jsonb")
    private String valoresAnteriores;

    @Column(name = "valores_nuevos", columnDefinition = "jsonb")
    private String valoresNuevos;

    @Size(max = 45)
    @Column(name = "ip", length = 45)
    private String ip;

    @Size(max = 500)
    @Column(name = "user_agent", length = 500)
    private String userAgent;

    @Column(name = "fecha", nullable = false)
    private java.time.Instant fecha;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;
}