package com.example.usuarios.modules.marcacion.entity;

import com.example.usuarios.common.persistence.BaseEntity;
import com.example.usuarios.modules.usuario.entity.Usuario;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "marcaciones", indexes = {
        @Index(name = "idx_marcaciones_usuario_fecha", columnList = "usuario_id, fecha, hora"),
        @Index(name = "idx_marcaciones_fecha", columnList = "fecha, tipo")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Marcacion extends BaseEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "tipo", nullable = false, length = 20)
    private TipoMarcacion tipo;

    @NotNull
    @Column(name = "fecha", nullable = false)
    private LocalDate fecha;

    @NotNull
    @Column(name = "hora", nullable = false)
    private LocalTime hora;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;
}