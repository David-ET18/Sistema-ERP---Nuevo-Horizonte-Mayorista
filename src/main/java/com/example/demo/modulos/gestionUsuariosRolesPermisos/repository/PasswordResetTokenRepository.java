package com.example.demo.modulos.gestionUsuariosRolesPermisos.repository;

import com.example.demo.modulos.gestionUsuariosRolesPermisos.entity.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

	Optional<PasswordResetToken> findByToken(String token);

	void deleteByUsuario_Id(Long idUsuario);
}