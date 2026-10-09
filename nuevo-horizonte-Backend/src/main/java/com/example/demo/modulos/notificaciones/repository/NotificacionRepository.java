package com.example.demo.modulos.notificaciones.repository;

import com.example.demo.modulos.notificaciones.entity.Notificacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface NotificacionRepository extends JpaRepository<Notificacion, Long> {

	List<Notificacion> findByUsuarioIdOrderByFechaCreacionDesc(Long idUsuario);

	long countByUsuarioIdAndLeidaFalse(Long idUsuario);

	@Modifying
	@Query("update Notificacion n set n.leida = true "
			+ "where n.usuario.id = :idUsuario and n.id in :ids")
	int marcarLeidas(@Param("idUsuario") Long idUsuario, @Param("ids") List<Long> ids);
}