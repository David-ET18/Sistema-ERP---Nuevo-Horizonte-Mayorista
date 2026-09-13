package com.example.usuarios.modules.marcacion.dto.request;

import com.example.usuarios.modules.marcacion.entity.TipoMarcacion;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalTime;

public record MarcacionCreateRequest(
        @NotNull TipoMarcacion tipo,
        LocalDate fecha,
        LocalTime hora
) {

    public LocalDate fechaOrDefault() {
        return fecha != null ? fecha : LocalDate.now();
    }

    public LocalTime horaOrDefault() {
        return hora != null ? hora : LocalTime.now();
    }
}