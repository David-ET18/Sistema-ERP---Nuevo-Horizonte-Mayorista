package com.example.usuarios.modules.usuario.repository;

import com.example.usuarios.modules.usuario.entity.Direccion;
import com.example.usuarios.modules.usuario.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DireccionRepository extends JpaRepository<Direccion, Long> {

    List<Direccion> findByUsuario(Usuario usuario);

    Optional<Direccion> findByUsuarioAndPrincipalTrue(Usuario usuario);

    List<Direccion> findByUsuarioAndTipo(Usuario usuario, Direccion.TipoDireccion tipo);

    void deleteByUsuario(Usuario usuario);
}