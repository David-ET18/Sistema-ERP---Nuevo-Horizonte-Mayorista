package com.example.demo.modulos.catalogo.repository;

import com.example.demo.modulos.catalogo.entity.Destino;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DestinoRepository extends JpaRepository<Destino, Long> {

	List<Destino> findAllByOrderByNombreAsc();
}