package com.example.demo.modulos.cotizaciones.repository;

import com.example.demo.modulos.cotizaciones.entity.Cotizacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CotizacionRepository extends JpaRepository<Cotizacion, Long>, JpaSpecificationExecutor<Cotizacion> {

	@Query("select c from Cotizacion c join fetch c.agencia a join fetch c.asesor where c.id = :id")
	Optional<Cotizacion> findDetalleConRelaciones(@Param("id") Long id);

	@Query("select c from Cotizacion c join fetch c.agencia where c.estado in ('CERRADA', 'EN_NEGOCIACION', 'ENVIADA') order by c.numero desc")
	List<Cotizacion> findCandidatasParaVenta();

	@Query("select c from Cotizacion c join fetch c.agencia where c.estado = 'CERRADA' order by c.numero desc")
	List<Cotizacion> findCerradas();

	@Query("select count(c) from Cotizacion c where c.estado = 'CERRADA' " +
			"and year(c.fechaCierre) = year(current_date) and month(c.fechaCierre) = month(current_date)")
	long countCerradasEsteMes();

	Optional<Cotizacion> findTopByNumeroStartingWithOrderByNumeroDesc(String prefijo);

	boolean existsByNumero(String numero);

	long countByEstado(String estado);
}