package com.example.demo.modulos.tarifas.repository;

import com.example.demo.modulos.tarifas.entity.Tarifa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface TarifaRepository extends JpaRepository<Tarifa, Long>, JpaSpecificationExecutor<Tarifa> {

	@Query("""
			select t from Tarifa t
			join fetch t.proveedor
			join fetch t.servicio
			join fetch t.destino
			where t.fechaDesde <= current_date and t.fechaHasta >= current_date
			order by t.servicio.nombre, t.destino.nombre
			""")
	List<Tarifa> findVigentes();

	@Query("select count(t) from Tarifa t where t.fechaHasta < :hoy")
	long countVencidas(@Param("hoy") LocalDate hoy);

	@Query("select count(t) from Tarifa t where t.fechaHasta >= :hoy and t.fechaHasta <= :limite")
	long countPorVencer(@Param("hoy") LocalDate hoy, @Param("limite") LocalDate limite);

	@Query("select count(t) from Tarifa t where t.fechaHasta > :limite")
	long countVigentes(@Param("limite") LocalDate limite);

	@Query("select distinct t.tipoTarifa from Tarifa t where t.tipoTarifa is not null and trim(t.tipoTarifa) <> '' order by t.tipoTarifa")
	List<String> findTiposTarifa();
}
