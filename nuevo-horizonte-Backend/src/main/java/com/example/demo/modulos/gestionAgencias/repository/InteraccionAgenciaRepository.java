package com.example.demo.modulos.gestionAgencias.repository;

import com.example.demo.modulos.gestionAgencias.entity.InteraccionAgencia;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface InteraccionAgenciaRepository extends JpaRepository<InteraccionAgencia, Long> {

	List<InteraccionAgencia> findByAgenciaIdOrderByFechaDesc(Long agenciaId, Pageable pageable);

	@Query("select i.agencia.id as agenciaId, max(i.fecha) as ultimaFecha "
			+ "from InteraccionAgencia i where i.agencia.id in :agenciaIds group by i.agencia.id")
	List<UltimaInteraccion> findUltimaInteraccionPorAgencias(@Param("agenciaIds") List<Long> agenciaIds);

	interface UltimaInteraccion {
		Long getAgenciaId();

		LocalDateTime getUltimaFecha();
	}
}
