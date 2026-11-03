package com.example.demo.modulos.promociones.repository;

import com.example.demo.modulos.promociones.dto.PromocionDTO;
import com.example.demo.modulos.promociones.entity.Promocion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.Optional;

public interface PromocionRepository extends JpaRepository<Promocion, Long> {

	/**
	 * Proyeccion directa a DTO: evita cargar el bytea de las imagenes al listar
	 * tarjetas. El estado de vigencia se calcula en la misma consulta.
	 */
	@Query(value = """
			SELECT new com.example.demo.modulos.promociones.dto.PromocionDTO(
				p.id, p.nombre, p.descripcion, p.descuentoPorcentaje, p.precioOriginal, p.precioPromocional,
				p.fechaInicio, p.fechaFin, p.destacada, p.activa,
				s.id, s.nombre,
				CASE WHEN p.imagen IS NULL THEN false ELSE true END,
				CASE WHEN p.activa = false THEN 'INACTIVA'
					WHEN p.fechaInicio IS NOT NULL AND p.fechaInicio > :hoy THEN 'PROGRAMADA'
					WHEN p.fechaFin IS NOT NULL AND p.fechaFin < :hoy THEN 'VENCIDA'
					ELSE 'VIGENTE' END,
				p.fechaCreacion, p.fechaActualizacion)
			FROM Promocion p
			LEFT JOIN p.servicio s
			WHERE (:q IS NULL OR LOWER(p.nombre) LIKE :q OR LOWER(COALESCE(p.descripcion, '')) LIKE :q)
				AND (:activa IS NULL OR p.activa = :activa)
				AND (:destacada IS NULL OR p.destacada = :destacada)
				AND (:servicioId IS NULL OR s.id = :servicioId)
				AND (:estado IS NULL
					OR (:estado = 'INACTIVA' AND p.activa = false)
					OR (:estado = 'PROGRAMADA' AND p.activa = true AND p.fechaInicio IS NOT NULL AND p.fechaInicio > :hoy)
					OR (:estado = 'VENCIDA' AND p.activa = true AND p.fechaFin IS NOT NULL AND p.fechaFin < :hoy)
					OR (:estado = 'VIGENTE' AND p.activa = true
						AND (p.fechaInicio IS NULL OR p.fechaInicio <= :hoy)
						AND (p.fechaFin IS NULL OR p.fechaFin >= :hoy)))
			""", countQuery = """
			SELECT COUNT(p)
			FROM Promocion p
			LEFT JOIN p.servicio s
			WHERE (:q IS NULL OR LOWER(p.nombre) LIKE :q OR LOWER(COALESCE(p.descripcion, '')) LIKE :q)
				AND (:activa IS NULL OR p.activa = :activa)
				AND (:destacada IS NULL OR p.destacada = :destacada)
				AND (:servicioId IS NULL OR s.id = :servicioId)
				AND (:estado IS NULL
					OR (:estado = 'INACTIVA' AND p.activa = false)
					OR (:estado = 'PROGRAMADA' AND p.activa = true AND p.fechaInicio IS NOT NULL AND p.fechaInicio > :hoy)
					OR (:estado = 'VENCIDA' AND p.activa = true AND p.fechaFin IS NOT NULL AND p.fechaFin < :hoy)
					OR (:estado = 'VIGENTE' AND p.activa = true
						AND (p.fechaInicio IS NULL OR p.fechaInicio <= :hoy)
						AND (p.fechaFin IS NULL OR p.fechaFin >= :hoy)))
			""")
	Page<PromocionDTO> listar(
			@Param("q") String q,
			@Param("activa") Boolean activa,
			@Param("destacada") Boolean destacada,
			@Param("servicioId") Long servicioId,
			@Param("estado") String estado,
			@Param("hoy") LocalDate hoy,
			Pageable pageable);

	long countByActivaTrue();

	long countByDestacadaTrue();

	@Query("""
			SELECT COUNT(p) FROM Promocion p
			WHERE p.activa = true
				AND (p.fechaInicio IS NULL OR p.fechaInicio <= :hoy)
				AND (p.fechaFin IS NULL OR p.fechaFin >= :hoy)
			""")
	long countVigentes(@Param("hoy") LocalDate hoy);

	@Query("""
			SELECT COUNT(p) FROM Promocion p
			WHERE p.activa = true
				AND p.fechaFin IS NOT NULL
				AND p.fechaFin >= :hoy
				AND p.fechaFin <= :limite
			""")
	long countPorVencer(@Param("hoy") LocalDate hoy, @Param("limite") LocalDate limite);

	/** Proyeccion ligera para servir la imagen sin hidratar toda la entidad. */
	interface ImagenProyeccion {
		byte[] getImagen();

		String getImagenContentType();

		String getImagenNombre();
	}

	@Query("""
			SELECT p.imagen AS imagen, p.imagenContentType AS imagenContentType, p.imagenNombre AS imagenNombre
			FROM Promocion p
			WHERE p.id = :id
			""")
	Optional<ImagenProyeccion> findImagenById(@Param("id") Long id);
}
