package com.example.usuarios.modules.usuario.entity;

import com.example.usuarios.common.persistence.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "cuentas_bancarias",
        indexes = @Index(name = "idx_cuentas_bancarias_proveedor", columnList = "proveedor_id", unique = true))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CuentaBancaria extends BaseEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank @Size(max = 100)
    @Column(name = "banco", nullable = false, length = 100)
    private String banco;

    @NotBlank @Size(max = 50)
    @Column(name = "clabe", nullable = false, unique = true, length = 50)
    private String clabe;

    @NotBlank @Size(max = 50)
    @Column(name = "numero_cuenta", nullable = false, length = 50)
    private String numeroCuenta;

    @Size(max = 100)
    @Column(name = "titular", length = 100)
    private String titular;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_cuenta", length = 20)
    private TipoCuenta tipoCuenta;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proveedor_id", nullable = false, unique = true)
    private Proveedor proveedor;

    public enum TipoCuenta {
        CHEQUES, AHORROS
    }
}