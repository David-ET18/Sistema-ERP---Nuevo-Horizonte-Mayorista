package com.example.demo.modulos.cotizaciones.repository;

import com.example.demo.modulos.cotizaciones.entity.Cotizacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
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

	/**
	 * Toma un advisory lock de Postgres durante la transaccion actual. Se usa para
	 * que dos altas concurrentes no calculen el mismo numero de cotizacion.
	 */
	@Query(value = "select 1 from (select pg_advisory_xact_lock(cast(:clave as bigint))) as bloqueo", nativeQuery = true)
	Integer bloquearGeneracionDeNumero(@Param("clave") long clave);

	/**
	 * Mayor secuencia numerica de las cotizaciones existentes. Se ordena por el
	 * valor numerico y no por texto, para que COT-10000 no quede antes que COT-9999.
	 */
	@Query(value = "select coalesce(max(cast(substring(numero from 5) as integer)), 0) " +
			"from ventas.cotizacion where numero ~ '^COT-[0-9]+$'", nativeQuery = true)
	int maxSecuenciaNumero();

	long countByEstado(String estado);

	/** Consumido por la ficha 360 de Agencias (resumen comercial / historial). */
	long countByAgenciaId(Long agenciaId);

	List<Cotizacion> findTop10ByAgenciaIdOrderByFechaCreacionDesc(Long agenciaId);

	/** Consumido por el modulo de Reportes. */
	long countByEstadoIn(List<String> estados);

	List<Cotizacion> findByFechaEnvioIsNotNullAndFechaCreacionBetween(LocalDateTime desde, LocalDateTime hasta);
}