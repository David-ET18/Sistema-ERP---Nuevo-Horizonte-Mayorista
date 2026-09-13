package com.example.usuarios.modules.usuario.entity;

import com.example.usuarios.common.persistence.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Entity
@Table(name = "sesiones",
        indexes = {
                @Index(name = "idx_sesiones_usuario_activa", columnList = "usuario_id"),
                @Index(name = "idx_sesiones_token", columnList = "token"),
                @Index(name = "idx_sesiones_expira", columnList = "expira_en")
        })
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Sesion extends BaseEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank @Size(max = 500)
    @Column(name = "token", nullable = false, unique = true, length = 500)
    private String token;

    @NotBlank @Size(max = 500)
    @Column(name = "refresh_token", nullable = false, unique = true, length = 500)
    private String refreshToken;

    @Column(name = "expira_en", nullable = false)
    private java.time.Instant expiraEn;

    @Column(name = "refresh_expira_en", nullable = false)
    private java.time.Instant refreshExpiraEn;

    @Size(max = 45)
    @Column(name = "ip", length = 45)
    private String ip;

    @Size(max = 500)
    @Column(name = "user_agent", length = 500)
    private String userAgent;

    @Column(name = "activa", nullable = false)
    @Builder.Default
    private Boolean activa = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    public boolean isExpired() {
        return java.time.Instant.now().isAfter(expiraEn);
    }

    public boolean isRefreshExpired() {
        return java.time.Instant.now().isAfter(refreshExpiraEn);
    }
}