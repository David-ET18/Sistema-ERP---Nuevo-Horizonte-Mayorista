package com.example.demo.config;

import com.example.demo.modulos.catalogo.entity.Destino;
import com.example.demo.modulos.catalogo.entity.Servicio;
import com.example.demo.modulos.gestionAgencias.entity.Agencia;
import com.example.demo.modulos.paquetes.entity.Paquete;
import com.example.demo.modulos.proveedores.entity.Proveedor;
import com.example.demo.modulos.tarifas.entity.Tarifa;
import com.example.demo.modulos.catalogo.repository.DestinoRepository;
import com.example.demo.modulos.catalogo.repository.ServicioRepository;
import com.example.demo.modulos.gestionAgencias.repository.AgenciaRepository;
import com.example.demo.modulos.paquetes.repository.PaqueteRepository;
import com.example.demo.modulos.proveedores.repository.ProveedorRepository;
import com.example.demo.modulos.tarifas.repository.TarifaRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
public class CatalogoDataInitializer implements CommandLineRunner {

	private final DestinoRepository destinoRepository;
	private final ServicioRepository servicioRepository;
	private final AgenciaRepository agenciaRepository;
	private final ProveedorRepository proveedorRepository;
	private final TarifaRepository tarifaRepository;
	private final PaqueteRepository paqueteRepository;

	public CatalogoDataInitializer(DestinoRepository destinoRepository,
			ServicioRepository servicioRepository,
			AgenciaRepository agenciaRepository,
			ProveedorRepository proveedorRepository,
			TarifaRepository tarifaRepository,
			PaqueteRepository paqueteRepository) {
		this.destinoRepository = destinoRepository;
		this.servicioRepository = servicioRepository;
		this.agenciaRepository = agenciaRepository;
		this.proveedorRepository = proveedorRepository;
		this.tarifaRepository = tarifaRepository;
		this.paqueteRepository = paqueteRepository;
	}

	@Override
	@Transactional
	public void run(String... args) {
		sembrarDestinos();
		sembrarServicios();
		sembrarAgencias();
		sembrarProveedores();
		sembrarTarifas();
		sembrarPaquetes();
	}

	private void sembrarDestinos() {
		if (destinoRepository.count() > 0) return;
		crearDestino("Cusco", "Perú", "Ciudad histórica y capital del Imperio Inca");
		crearDestino("Machu Picchu", "Perú", "Maravilla del mundo moderno");
		crearDestino("Lima", "Perú", "Capital del Perú");
		crearDestino("Arequipa", "Perú", "Ciudad blanca, volcánes y cañones");
		crearDestino("Iquitos", "Perú", "Puerta de entrada a la Amazonía peruana");
	}

	private void crearDestino(String nombre, String pais, String descripcion) {
		Destino d = new Destino();
		d.setNombre(nombre);
		d.setPais(pais);
		d.setDescripcion(descripcion);
		d.setActivo(true);
		d.setFechaCreacion(LocalDateTime.now());
		destinoRepository.save(d);
	}

	private void sembrarServicios() {
		if (servicioRepository.count() > 0) return;
		crearServicio("Hotel 3 estrellas", "Hospedaje", "Hospedaje en hoteles de 3 estrellas");
		crearServicio("Hotel 4 estrellas", "Hospedaje", "Hospedaje en hoteles de 4 estrellas");
		crearServicio("Hotel 5 estrellas", "Hospedaje", "Hospedaje en hoteles de 5 estrellas");
		crearServicio("Vuelo comercial", "Transporte", "Vuelos comerciales nacionales e internacionales");
		crearServicio("Tren", "Transporte", "Servicios de tren turístico");
		crearServicio("City tour", "Turismo", "Recorridos turísticos por la ciudad");
		crearServicio("Guía turístico", "Turismo", "Guías profesionales certificados");
		crearServicio("Restaurante", "Alimentación", "Alimentación en restaurantes recomendados");
	}

	private void crearServicio(String nombre, String categoria, String descripcion) {
		Servicio s = new Servicio();
		s.setNombre(nombre);
		s.setCategoria(categoria);
		s.setDescripcion(descripcion);
		s.setActivo(true);
		s.setFechaCreacion(LocalDateTime.now());
		servicioRepository.save(s);
	}

	private void sembrarAgencias() {
		if (agenciaRepository.count() > 0) return;
		crearAgencia("Travel Solutions SAC", "Travel Solutions", "20512345678", "Mayorista", "Lima");
		crearAgencia("Andean Travel", "Andean Travel", "20587654321", "Minorista", "Cusco");
		crearAgencia("Amazon Tours", "Amazon Tours", "20511122233", "Mayorista", "Iquitos");
	}

	private void crearAgencia(String razonSocial, String nombreComercial, String ruc, String categoria, String ciudad) {
		Agencia a = new Agencia();
		a.setRazonSocial(razonSocial);
		a.setNombreComercial(nombreComercial);
		a.setRuc(ruc);
		a.setCategoria(categoria);
		a.setCiudad(ciudad);
		a.setEsPrioritaria(false);
		a.setActivo(true);
		a.setFechaCreacion(LocalDateTime.now());
		agenciaRepository.save(a);
	}

	private void sembrarProveedores() {
		if (proveedorRepository.count() > 0) return;
		crearProveedor("Inka Hotels SAC", "Inka Hotels", "20123456789", "Hoteles", "Cusco");
		crearProveedor("Peru Rail SA", "Peru Rail", "20987654321", "Transporte", "Cusco");
		crearProveedor("AeroPeru", "AeroPeru", "20445566778", "Aéreo", "Lima");
		crearProveedor("Restaurantes del Norte SAC", "RdN", "20667788990", "Alimentación", "Lima");
	}

	private void crearProveedor(String razonSocial, String nombreComercial, String ruc, String tipo, String contacto) {
		Proveedor p = new Proveedor();
		p.setRazonSocial(razonSocial);
		p.setNombreComercial(nombreComercial);
		p.setRuc(ruc);
		p.setTipoProveedor(tipo);
		p.setContactoNombre(contacto);
		p.setActivo(true);
		p.setFechaCreacion(LocalDateTime.now());
		proveedorRepository.save(p);
	}

	private void sembrarTarifas() {
		if (tarifaRepository.count() > 0) return;
		Destino cusco = destinoRepository.findByNombre("Cusco").orElse(null);
		Destino machuPicchu = destinoRepository.findByNombre("Machu Picchu").orElse(null);
		Proveedor inkaHotels = proveedorRepository.findByRuc("20123456789").orElse(null);
		Proveedor peruRail = proveedorRepository.findByRuc("20987654321").orElse(null);
		Servicio hotel3 = servicioRepository.findByNombre("Hotel 3 estrellas").orElse(null);
		Servicio tren = servicioRepository.findByNombre("Tren").orElse(null);

		if (cusco != null && inkaHotels != null && hotel3 != null) {
			crearTarifa(inkaHotels, hotel3, cusco, "Tarifa base", new BigDecimal("150.00"), "PEN");
		}
		if (machuPicchu != null && peruRail != null && tren != null) {
			crearTarifa(peruRail, tren, machuPicchu, "Tarifa turística", new BigDecimal("280.00"), "PEN");
		}
	}

	private void crearTarifa(Proveedor proveedor, Servicio servicio, Destino destino,
			String tipo, BigDecimal precio, String moneda) {
		Tarifa t = new Tarifa();
		t.setProveedor(proveedor);
		t.setServicio(servicio);
		t.setDestino(destino);
		t.setTipoTarifa(tipo);
		t.setPrecio(precio);
		t.setMoneda(moneda);
		t.setFechaDesde(LocalDate.now());
		t.setFechaHasta(LocalDate.now().plusMonths(6));
		t.setFechaCreacion(LocalDateTime.now());
		tarifaRepository.save(t);
	}

	private void sembrarPaquetes() {
		if (paqueteRepository.count() > 0) return;
		Destino cusco = destinoRepository.findByNombre("Cusco").orElse(null);
		if (cusco == null) return;

		crearPaquete("Cusco Clásico 4D/3N", "Recorrido por Cusco, Valle Sagrado y Machu Picchu",
				cusco, new BigDecimal("850.00"), "PEN", "ACTIVO", true);
		crearPaquete("Cusco Premium 5D/4N", "Experiencia premium con hoteles 5 estrellas",
				cusco, new BigDecimal("1450.00"), "PEN", "ACTIVO", false);
		crearPaquete("Aventura Amazónica 3D/2N", "Exploración de la selva amazónica desde Iquitos",
				destinoRepository.findByNombre("Iquitos").orElse(cusco),
				new BigDecimal("620.00"), "PEN", "BORRADOR", false);
	}

	private void crearPaquete(String nombre, String descripcion, Destino destino,
			BigDecimal precio, String moneda, String estado, boolean destacado) {
		Paquete p = new Paquete();
		p.setNombre(nombre);
		p.setDescripcion(descripcion);
		p.setDestino(destino);
		p.setPrecioDesde(precio);
		p.setMoneda(moneda);
		p.setEstado(estado);
		p.setDestacado(destacado);
		p.setFechaInicioViaje(LocalDate.now().plusDays(30));
		p.setFechaFinViaje(LocalDate.now().plusDays(34));
		p.setFechaCreacion(LocalDateTime.now());
		p.setFechaActualizacion(LocalDateTime.now());
		paqueteRepository.save(p);
	}
}
