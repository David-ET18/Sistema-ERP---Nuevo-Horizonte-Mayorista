package com.example.demo.modulos.paquetes.repository;

import com.example.demo.modulos.paquetes.entity.Paquete;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface PaqueteRepository extends JpaRepository<Paquete, Long> {

	@Query("select p from Paquete p join fetch p.destino where p.estado = 'ACTIVO' order by p.nombre")
	List<Paquete> findActivos();

	/** Consumido por el modulo de Reportes (alertas / productos en borrador). */
	long countByEstado(String estado);
}
