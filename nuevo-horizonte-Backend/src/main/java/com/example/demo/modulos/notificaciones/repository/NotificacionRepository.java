package com.example.demo.modulos.notificaciones.repository;

import com.example.demo.modulos.notificaciones.entity.Notificacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface NotificacionRepository extends JpaRepository<Notificacion, Long> {

	List<Notificacion> findByUsuarioIdOrderByFechaCreacionDesc(Long idUsuario);

	long countByUsuarioIdAndLeidaFalse(Long idUsuario);

	Optional<Notificacion> findByIdAndUsuarioId(Long id, Long idUsuario);

	@Modifying
	@Query("update Notificacion n set n.leida = true, n.fechaLeida = :fecha "
			+ "where n.usuario.id = :idUsuario and n.id in :ids")
	int marcarLeidas(@Param("idUsuario") Long idUsuario, @Param("ids") List<Long> ids,
			@Param("fecha") LocalDateTime fecha);

	@Modifying
	@Query("update Notificacion n set n.leida = true, n.fechaLeida = :fecha "
			+ "where n.usuario.id = :idUsuario and n.leida = false")
	int marcarTodasLeidas(@Param("idUsuario") Long idUsuario, @Param("fecha") LocalDateTime fecha);

	@Modifying
	@Query("delete from Notificacion n where n.usuario.id = :idUsuario and n.leida = true")
	int eliminarLeidas(@Param("idUsuario") Long idUsuario);
}
