package com.example.demo.config;

import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.modulos.catalogo.entity.Destino;
import com.example.demo.modulos.catalogo.entity.Servicio;
import com.example.demo.modulos.catalogo.repository.DestinoRepository;
import com.example.demo.modulos.catalogo.repository.ServicioRepository;

/**
 * Carga destinos y servicios base cuando las tablas estan vacias, para poder
 * usar los formularios (tarifas, paquetes, proveedores) sin una pantalla de
 * administracion del catalogo. Es idempotente: no hace nada si ya hay datos.
 */
@Component
public class CatalogoSeeder implements CommandLineRunner {

	private final DestinoRepository destinoRepository;
	private final ServicioRepository servicioRepository;

	public CatalogoSeeder(DestinoRepository destinoRepository, ServicioRepository servicioRepository) {
		this.destinoRepository = destinoRepository;
		this.servicioRepository = servicioRepository;
	}

	@Override
	@Transactional
	public void run(String... args) {
		if (destinoRepository.count() == 0) {
			List.of(
					new String[] { "Cusco", "Peru" }, new String[] { "Lima", "Peru" },
					new String[] { "Arequipa", "Peru" }, new String[] { "Paracas", "Peru" },
					new String[] { "Iquitos", "Peru" }, new String[] { "Puno", "Peru" },
					new String[] { "Cancun", "Mexico" }, new String[] { "Punta Cana", "Republica Dominicana" },
					new String[] { "Madrid", "Espana" }, new String[] { "Buenos Aires", "Argentina" })
					.forEach(d -> {
						Destino destino = new Destino();
						destino.setNombre(d[0]);
						destino.setPais(d[1]);
						destinoRepository.save(destino);
					});
		}

		if (servicioRepository.count() == 0) {
			List.of(
					new String[] { "Tour Machu Picchu", "Tour" }, new String[] { "City Tour", "Tour" },
					new String[] { "Habitacion simple", "Hotel" }, new String[] { "Habitacion doble", "Hotel" },
					new String[] { "Habitacion triple", "Hotel" }, new String[] { "Traslado aeropuerto", "Transporte" },
					new String[] { "Bus interprovincial", "Transporte" }, new String[] { "Boleto aereo", "Aereo" },
					new String[] { "Alimentacion completa", "Alimentacion" }, new String[] { "Alquiler de vehiculo", "Vehiculo" })
					.forEach(s -> {
						Servicio servicio = new Servicio();
						servicio.setNombre(s[0]);
						servicio.setCategoria(s[1]);
						servicioRepository.save(servicio);
					});
		}
	}
}
