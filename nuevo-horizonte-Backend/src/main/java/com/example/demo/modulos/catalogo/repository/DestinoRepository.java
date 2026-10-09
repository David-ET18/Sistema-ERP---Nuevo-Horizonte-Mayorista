package com.example.demo.modulos.catalogo.repository;

import com.example.demo.modulos.catalogo.entity.Destino;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface DestinoRepository extends JpaRepository<Destino, Long>, JpaSpecificationExecutor<Destino> {

	List<Destino> findAllByOrderByNombreAsc();

	Optional<Destino> findByNombre(String nombre);

	List<Destino> findByActivoTrueOrderByNombreAsc();

	boolean existsByNombreIgnoreCaseAndPaisIgnoreCase(String nombre, String pais);

	boolean existsByNombreIgnoreCaseAndPaisIgnoreCaseAndIdNot(String nombre, String pais, Long id);

	long countByActivoTrue();

	@Query("select distinct d.pais from Destino d where d.pais is not null and trim(d.pais) <> '' order by d.pais")
	List<String> findPaises();
}
