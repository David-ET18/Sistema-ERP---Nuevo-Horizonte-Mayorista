package com.example.demo.modulos.catalogo.repository;

import com.example.demo.modulos.catalogo.entity.Servicio;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ServicioRepository extends JpaRepository<Servicio, Long> {

	List<Servicio> findAllByOrderByNombreAsc();
}
