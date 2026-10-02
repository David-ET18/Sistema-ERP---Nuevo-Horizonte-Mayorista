package com.example.demo.modulos.tarifas.repository;

import com.example.demo.modulos.proveedores.entity.Proveedor;
import com.example.demo.modulos.tarifas.entity.Tarifa;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface TarifaRepository extends JpaRepository<Tarifa, Long> {

	@Query("""
			select t from Tarifa t
			join fetch t.proveedor
			join fetch t.servicio
			join fetch t.destino
			where t.fechaDesde <= current_date and t.fechaHasta >= current_date
			order by t.servicio.nombre, t.destino.nombre
			""")
	List<Tarifa> findVigentes();

	/** Consumido por el modulo de Reportes (alertas / tarifas por vencer). */
	@Query("select count(t) from Tarifa t where t.fechaHasta >= :hoy and t.fechaHasta <= :limite")
	long countPorVencer(@Param("hoy") LocalDate hoy, @Param("limite") LocalDate limite);

	@Query("select t.proveedor as proveedor, count(t) as cantidad from Tarifa t "
			+ "where t.fechaHasta >= :hoy and t.fechaHasta <= :limite group by t.proveedor order by cantidad desc")
	List<TarifasPorProveedor> porVencerAgrupadoPorProveedor(@Param("hoy") LocalDate hoy,
			@Param("limite") LocalDate limite, Pageable pageable);

	interface TarifasPorProveedor {
		Proveedor getProveedor();

		long getCantidad();
	}
}
