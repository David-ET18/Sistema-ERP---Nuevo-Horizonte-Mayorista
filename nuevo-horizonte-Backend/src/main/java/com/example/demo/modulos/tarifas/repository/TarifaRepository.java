package com.example.demo.modulos.tarifas.repository;

import com.example.demo.modulos.tarifas.entity.Tarifa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

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
}