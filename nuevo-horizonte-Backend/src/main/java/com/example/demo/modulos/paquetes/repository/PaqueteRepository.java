package com.example.demo.modulos.paquetes.repository;

import com.example.demo.modulos.paquetes.entity.Paquete;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface PaqueteRepository extends JpaRepository<Paquete, Long>, JpaSpecificationExecutor<Paquete> {

	@Query("select p from Paquete p join fetch p.destino where p.estado = 'ACTIVO' order by p.nombre")
	List<Paquete> findActivos();

	boolean existsByNombre(String nombre);

	boolean existsByNombreAndIdNot(String nombre, Long id);

	long countByEstado(String estado);

	long countByDestacadoTrue();

	@Query("select distinct p.categoria from Paquete p where p.categoria is not null and trim(p.categoria) <> '' order by p.categoria")
	List<String> findCategorias();
}
