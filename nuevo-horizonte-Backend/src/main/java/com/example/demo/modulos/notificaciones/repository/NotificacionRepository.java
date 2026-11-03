package com.example.demo.modulos.notificaciones.repository;

import com.example.demo.modulos.notificaciones.entity.Notificacion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface NotificacionRepository extends JpaRepository<Notificacion, Long> {

	List<Notificacion> findByUsuarioIdOrderByFechaCreacionDesc(Long idUsuario);

	long countByUsuarioId(Long idUsuario);

	long countByUsuarioIdAndLeidaFalse(Long idUsuario);

	long countByUsuarioIdAndLeidaTrue(Long idUsuario);

	long countByUsuarioIdAndTipo(Long idUsuario, String tipo);

	@Query("""
			SELECT n FROM Notificacion n
			WHERE n.usuario.id = :idUsuario
				AND (:q IS NULL OR LOWER(n.titulo) LIKE :q OR LOWER(n.mensaje) LIKE :q)
				AND (:leida IS NULL OR n.leida = :leida)
				AND (:tipo IS NULL OR n.tipo = :tipo)
			""")
	Page<Notificacion> buscar(
			@Param("idUsuario") Long idUsuario,
			@Param("q") String q,
			@Param("leida") Boolean leida,
			@Param("tipo") String tipo,
			Pageable pageable);

	@Modifying
	@Query("update Notificacion n set n.leida = true, n.fechaLeida = CURRENT_TIMESTAMP "
			+ "where n.usuario.id = :idUsuario and n.id = :id")
	int marcarUnaLeida(@Param("idUsuario") Long idUsuario, @Param("id") Long id);

	@Modifying
	@Query("update Notificacion n set n.leida = true, n.fechaLeida = CURRENT_TIMESTAMP "
			+ "where n.usuario.id = :idUsuario and n.leida = false")
	int marcarTodasLeidas(@Param("idUsuario") Long idUsuario);

	@Modifying
	@Query("update Notificacion n set n.leida = true, n.fechaLeida = CURRENT_TIMESTAMP "
			+ "where n.usuario.id = :idUsuario and n.id in :ids")
	int marcarLeidas(@Param("idUsuario") Long idUsuario, @Param("ids") List<Long> ids);

	@Modifying
	@Query("delete from Notificacion n where n.usuario.id = :idUsuario and n.id = :id")
	int eliminarUna(@Param("idUsuario") Long idUsuario, @Param("id") Long id);

	@Modifying
	@Query("delete from Notificacion n where n.usuario.id = :idUsuario and n.leida = true")
	int eliminarLeidas(@Param("idUsuario") Long idUsuario);
}
