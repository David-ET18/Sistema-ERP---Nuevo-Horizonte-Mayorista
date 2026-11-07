package com.example.demo.modulos.marketing.repository;

import com.example.demo.modulos.marketing.entity.MarketingPublicacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;

public interface MarketingPublicacionRepository extends JpaRepository<MarketingPublicacion, Long>,
		JpaSpecificationExecutor<MarketingPublicacion> {

	long countByEstado(MarketingPublicacion.Estado estado);

	long countByFechaPublicacionGreaterThanEqual(LocalDateTime desde);

	/** Proyeccion ligera para servir la imagen sin hidratar toda la entidad. */
	interface ImagenProyeccion {
		byte[] getImagen();

		String getImagenContentType();

		String getImagenNombre();
	}

	@Query("""
			SELECT p.imagen AS imagen, p.imagenContentType AS imagenContentType, p.imagenNombre AS imagenNombre
			FROM MarketingPublicacion p
			WHERE p.id = :id
			""")
	Optional<ImagenProyeccion> findImagenById(@Param("id") Long id);
}
