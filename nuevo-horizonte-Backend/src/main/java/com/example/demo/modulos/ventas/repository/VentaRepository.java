package com.example.demo.modulos.ventas.repository;

import com.example.demo.modulos.ventas.entity.Venta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface VentaRepository extends JpaRepository<Venta, Long>, JpaSpecificationExecutor<Venta> {

	@Query("select v from Venta v "
			+ "join fetch v.agencia "
			+ "left join fetch v.producto "
			+ "left join fetch v.tarifa t "
			+ "left join fetch t.servicio "
			+ "left join fetch t.destino "
			+ "left join fetch v.cotizacion "
			+ "where v.id = :id")
	Optional<Venta> findDetalleConRelaciones(@Param("id") Long id);

	Optional<Venta> findTopByNumeroStartingWithOrderByNumeroDesc(String prefijo);

	boolean existsByNumero(String numero);

	@Query("select count(v) from Venta v where v.estado = 'PAGADA'")
	long countPagadas();

	@Query("select count(v) from Venta v where v.estado in ('PENDIENTE_PAGO', 'CONFIRMADA')")
	long countPagosPendientes();

	@Query("select count(v) from Venta v where v.estado <> 'ANULADA' "
			+ "and year(v.fechaVenta) = year(current_date) and month(v.fechaVenta) = month(current_date)")
	long countVentasMes();

	@Query("select coalesce(sum(v.montoAPagar), 0) from Venta v where v.estado <> 'ANULADA' "
			+ "and year(v.fechaVenta) = year(current_date) and month(v.fechaVenta) = month(current_date)")
	BigDecimal montoVendidoMes();

	/** Consumido por la ficha 360 de Agencias (resumen comercial). */
	@Query("select coalesce(sum(v.montoAPagar), 0) from Venta v "
			+ "where v.agencia.id = :agenciaId and v.estado <> 'ANULADA'")
	BigDecimal sumMontoPorAgencia(@Param("agenciaId") Long agenciaId);

	long countByAgenciaIdAndEstadoNot(Long agenciaId, String estado);

	@Query("select max(v.fechaVenta) from Venta v where v.agencia.id = :agenciaId and v.estado <> 'ANULADA'")
	LocalDateTime findUltimaCompra(@Param("agenciaId") Long agenciaId);

	List<Venta> findTop10ByAgenciaIdOrderByFechaVentaDesc(Long agenciaId);
}
