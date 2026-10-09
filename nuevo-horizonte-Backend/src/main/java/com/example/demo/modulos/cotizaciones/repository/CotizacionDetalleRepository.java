package com.example.demo.modulos.cotizaciones.repository;

import com.example.demo.modulos.cotizaciones.entity.CotizacionDetalle;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface CotizacionDetalleRepository extends JpaRepository<CotizacionDetalle, Long> {

	List<CotizacionDetalle> findByCotizacionIdIn(Collection<Long> ids);

	/** Consumido por TarifaService para decidir si una tarifa se puede borrar o solo vencer. */
	boolean existsByTarifaId(Long tarifaId);
}