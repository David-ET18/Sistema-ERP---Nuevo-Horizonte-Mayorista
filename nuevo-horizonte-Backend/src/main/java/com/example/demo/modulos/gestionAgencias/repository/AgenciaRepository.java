package com.example.demo.modulos.gestionAgencias.repository;

import com.example.demo.modulos.gestionAgencias.entity.Agencia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface AgenciaRepository extends JpaRepository<Agencia, Long>, JpaSpecificationExecutor<Agencia> {

	List<Agencia> findByActivoTrueOrderByNombreComercialAsc();

	List<Agencia> findAllByOrderByRazonSocialAsc();

	Optional<Agencia> findByRuc(String ruc);

	boolean existsByRuc(String ruc);

	boolean existsByRucAndIdNot(String ruc, Long id);

	long countByActivoTrue();

	long countByEsPrioritariaTrue();

	@Query("select distinct a.categoria from Agencia a where a.categoria is not null and trim(a.categoria) <> '' order by a.categoria")
	List<String> findCategorias();

	@Query("""
			select count(a) from Agencia a
			where year(a.fechaCreacion) = year(current_date)
			  and month(a.fechaCreacion) = month(current_date)
			""")
	long countRegistradasEsteMes();
}
