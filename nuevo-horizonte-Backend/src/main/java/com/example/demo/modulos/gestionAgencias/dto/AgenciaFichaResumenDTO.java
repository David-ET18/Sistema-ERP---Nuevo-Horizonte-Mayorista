package com.example.demo.modulos.gestionAgencias.dto;

import java.time.LocalDateTime;

/** Fila de la lista izquierda del panel "Agencias / Clientes B2B". */
public record AgenciaFichaResumenDTO(
		Long id,
		String nombre,
		String logoUrl,
		boolean esPrioritaria,
		boolean activo,
		LocalDateTime ultimaInteraccion) {
}
