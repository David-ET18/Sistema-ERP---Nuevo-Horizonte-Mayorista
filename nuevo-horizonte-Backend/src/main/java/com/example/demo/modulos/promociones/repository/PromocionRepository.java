package com.example.demo.modulos.promociones.repository;

import com.example.demo.modulos.promociones.entity.Promocion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.time.LocalDate;

public interface PromocionRepository extends JpaRepository<Promocion, Long>, JpaSpecificationExecutor<Promocion> {

	long countByActivoTrue();

	long countByActivoTrueAndFechaInicioLessThanEqualAndFechaFinGreaterThanEqual(
			LocalDate limiteInicio, LocalDate limiteFin);

	long countByActivoTrueAndFechaInicioAfter(LocalDate hoy);

	long countByFechaFinBefore(LocalDate hoy);

	long countByDestacadaTrue();
}
