package com.example.demo.modulos.catalogo.repository;

import com.example.demo.modulos.catalogo.entity.Servicio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ServicioRepository extends JpaRepository<Servicio, Long>, JpaSpecificationExecutor<Servicio> {

	List<Servicio> findAllByOrderByNombreAsc();

	List<Servicio> findByActivoTrueOrderByNombreAsc();

	boolean existsByNombreIgnoreCase(String nombre);

	boolean existsByNombreIgnoreCaseAndIdNot(String nombre, Long id);

	long countByActivoTrue();

	@Query("select distinct s.categoria from Servicio s where s.categoria is not null and trim(s.categoria) <> '' order by s.categoria")
	List<String> findCategorias();
}
