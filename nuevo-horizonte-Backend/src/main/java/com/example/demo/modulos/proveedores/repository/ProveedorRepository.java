package com.example.demo.modulos.proveedores.repository;

import com.example.demo.modulos.proveedores.entity.Proveedor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ProveedorRepository extends JpaRepository<Proveedor, Long>, JpaSpecificationExecutor<Proveedor> {

	List<Proveedor> findByActivoTrueOrderByRazonSocialAsc();

	Optional<Proveedor> findByRuc(String ruc);

	boolean existsByRuc(String ruc);

	boolean existsByRucAndIdNot(String ruc, Long id);

	long countByActivoTrue();

	@Query("select distinct p.tipoProveedor from Proveedor p where p.tipoProveedor is not null and trim(p.tipoProveedor) <> '' order by p.tipoProveedor")
	List<String> findTiposServicio();

	@Query("""
			select count(p) from Proveedor p
			where year(p.fechaCreacion) = year(current_date)
			  and month(p.fechaCreacion) = month(current_date)
			""")
	long countRegistradosEsteMes();

	/**
	 * Proveedores que todavia no tienen ninguna tarifa cargada (alerta del
	 * listado: "Sin tarifas cargadas").
	 */
	@Query("select count(p) from Proveedor p where p.id not in (select t.proveedor.id from Tarifa t)")
	long countSinTarifas();
}
