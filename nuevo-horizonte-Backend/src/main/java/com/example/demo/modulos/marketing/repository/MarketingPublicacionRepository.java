package com.example.demo.modulos.marketing.repository;

import com.example.demo.modulos.marketing.entity.MarketingPublicacion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;

public interface MarketingPublicacionRepository extends JpaRepository<MarketingPublicacion, Long> {

	@Query("""
			SELECT p FROM MarketingPublicacion p
			WHERE (:q IS NULL OR LOWER(p.textoOriginal) LIKE :q OR LOWER(COALESCE(p.textoPublicado, '')) LIKE :q)
				AND (:canal IS NULL OR p.canal = :canal)
				AND (:estado IS NULL OR p.estado = :estado)
				AND (CAST(:desde AS timestamp) IS NULL OR p.fechaPublicacion >= CAST(:desde AS timestamp))
				AND (CAST(:hasta AS timestamp) IS NULL OR p.fechaPublicacion <= CAST(:hasta AS timestamp))
			ORDER BY p.fechaPublicacion DESC
			""")
	Page<MarketingPublicacion> listar(
			@Param("q") String q,
			@Param("canal") MarketingPublicacion.Canal canal,
			@Param("estado") MarketingPublicacion.Estado estado,
			@Param("desde") LocalDateTime desde,
			@Param("hasta") LocalDateTime hasta,
			Pageable pageable);

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
