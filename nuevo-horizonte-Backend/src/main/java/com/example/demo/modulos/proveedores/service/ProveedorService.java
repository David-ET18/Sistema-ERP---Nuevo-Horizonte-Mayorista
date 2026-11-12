package com.example.demo.modulos.proveedores.service;

import java.util.ArrayList;
import java.util.List;
import java.util.TreeSet;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import com.example.demo.modulos.catalogo.dto.DestinoDTO;
import com.example.demo.modulos.catalogo.entity.Destino;
import com.example.demo.modulos.catalogo.mapper.DestinoMapper;
import com.example.demo.modulos.catalogo.repository.DestinoRepository;
import com.example.demo.modulos.catalogo.repository.ServicioRepository;
import com.example.demo.modulos.notificaciones.service.NotificacionService;
import com.example.demo.modulos.proveedores.dto.KpiProveedoresDTO;
import com.example.demo.modulos.proveedores.dto.ProveedorDTO;
import com.example.demo.modulos.proveedores.dto.ProveedorDetalleDTO;
import com.example.demo.modulos.proveedores.dto.ProveedorListaDTO;
import com.example.demo.modulos.proveedores.dto.ProveedorRequest;
import com.example.demo.modulos.proveedores.entity.Proveedor;
import com.example.demo.modulos.proveedores.mapper.ProveedorMapper;
import com.example.demo.modulos.proveedores.repository.ProveedorRepository;
import com.example.demo.util.Specifications;

import jakarta.persistence.criteria.Predicate;

@Service
@Transactional(readOnly = true)
public class ProveedorService {

	private static final List<String> CAMPOS_BUSQUEDA =
			List.of("razonSocial", "nombreComercial", "ruc", "contactoNombre");

	private final ProveedorRepository proveedorRepository;
	private final DestinoRepository destinoRepository;
	private final ServicioRepository servicioRepository;
	private final NotificacionService notificacionService;

	public ProveedorService(ProveedorRepository proveedorRepository, DestinoRepository destinoRepository,
			ServicioRepository servicioRepository, NotificacionService notificacionService) {
		this.proveedorRepository = proveedorRepository;
		this.destinoRepository = destinoRepository;
		this.servicioRepository = servicioRepository;
		this.notificacionService = notificacionService;
	}

	public Page<ProveedorListaDTO> listar(String q, String tipoProveedor, Boolean activo, Long destinoId,
			Pageable pageable) {
		Specification<Proveedor> spec = construirFiltros(q, tipoProveedor, activo, destinoId);
		return proveedorRepository.findAll(spec, pageable).map(ProveedorMapper::toListaDTO);
	}

	public KpiProveedoresDTO kpis() {
		return new KpiProveedoresDTO(
				proveedorRepository.countByActivoTrue(),
				proveedorRepository.countRegistradosEsteMes(),
				proveedorRepository.countSinTarifas());
	}

	/**
	 * Categorias de servicio activas del catalogo, mas los tipos que ya usan
	 * proveedores existentes (para no perder valores historicos).
	 */
	public List<String> tiposServicio() {
		TreeSet<String> tipos = new TreeSet<>(String.CASE_INSENSITIVE_ORDER);
		tipos.addAll(servicioRepository.findCategoriasActivas());
		tipos.addAll(proveedorRepository.findTiposServicio());
		return new ArrayList<>(tipos);
	}

	public List<String> condicionesComerciales() {
		return ProveedorMapper.CONDICIONES_COMERCIALES;
	}

	public List<DestinoDTO> destinos() {
		return destinoRepository.findByActivoTrueOrderByNombreAsc().stream()
				.map(DestinoMapper::toDTO)
				.toList();
	}

	public List<ProveedorDTO> listarActivos() {
		return proveedorRepository.findByActivoTrueOrderByRazonSocialAsc().stream()
				.map(ProveedorMapper::toRefDTO)
				.toList();
	}

	public ProveedorDetalleDTO detalle(Long id) {
		return ProveedorMapper.toDetalleDTO(obtener(id));
	}

	/**
	 * Entidad completa, para que otros modulos (tarifas) resuelvan la relacion
	 * sin conocer la tabla de proveedores.
	 */
	public Proveedor obtener(Long id) {
		return proveedorRepository.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
						"Proveedor no encontrado"));
	}

	@Transactional
	public ProveedorDetalleDTO crear(ProveedorRequest request) {
		validarRuc(request.ruc(), null);
		Proveedor proveedor = new Proveedor();
		ProveedorMapper.aplicar(proveedor, request, resolverDestino(request.destinoId()));
		Proveedor guardado = proveedorRepository.save(proveedor);
		notificar("Nuevo proveedor: " + ProveedorMapper.nombre(guardado),
				"Se registró el proveedor " + ProveedorMapper.nombre(guardado) + ".",
				"RUC: " + guardado.getRuc() + " · Tipo: " + guardado.getTipoProveedor());
		return ProveedorMapper.toDetalleDTO(guardado);
	}

	@Transactional
	public ProveedorDetalleDTO actualizar(Long id, ProveedorRequest request) {
		validarRuc(request.ruc(), id);
		Proveedor proveedor = obtener(id);
		ProveedorMapper.aplicar(proveedor, request, resolverDestino(request.destinoId()));
		Proveedor guardado = proveedorRepository.save(proveedor);
		notificar("Proveedor actualizado: " + ProveedorMapper.nombre(guardado),
				"Se actualizaron los datos del proveedor " + ProveedorMapper.nombre(guardado) + ".",
				"RUC: " + guardado.getRuc() + " · Tipo: " + guardado.getTipoProveedor());
		return ProveedorMapper.toDetalleDTO(guardado);
	}

	/**
	 * Baja logica: un proveedor con tarifas (historicas o vigentes) no se puede
	 * borrar fisicamente sin romper esos registros, asi que "eliminar" solo lo
	 * desactiva. Mismo criterio que UsuarioService.desactivar.
	 */
	@Transactional
	public void eliminar(Long id) {
		Proveedor proveedor = obtener(id);
		proveedor.setActivo(false);
		proveedorRepository.save(proveedor);
		notificar("Proveedor desactivado: " + ProveedorMapper.nombre(proveedor),
				"El proveedor " + ProveedorMapper.nombre(proveedor) + " fue desactivado.",
				"RUC: " + proveedor.getRuc() + " · Estado: inactivo");
	}

	@Transactional
	public void activar(Long id) {
		Proveedor proveedor = obtener(id);
		proveedor.setActivo(true);
		proveedorRepository.save(proveedor);
		notificar("Proveedor reactivado: " + ProveedorMapper.nombre(proveedor),
				"El proveedor " + ProveedorMapper.nombre(proveedor) + " volvió a estar activo.",
				"RUC: " + proveedor.getRuc() + " · Estado: activo");
	}

	private Destino resolverDestino(Long destinoId) {
		if (destinoId == null) {
			return null;
		}
		return destinoRepository.findById(destinoId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
						"Destino no encontrado"));
	}

	private void notificar(String titulo, String mensaje, String detalle) {
		notificacionService.crearParaUsuariosActivos(titulo, mensaje,
				NotificacionService.TIPO_PROVEEDOR, "/proveedores",
				notificacionService.actorActual(), detalle);
	}

	private void validarRuc(String ruc, Long idExcluido) {
		boolean existe = (idExcluido == null)
				? proveedorRepository.existsByRuc(ruc)
				: proveedorRepository.existsByRucAndIdNot(ruc, idExcluido);
		if (existe) {
			throw new ResponseStatusException(HttpStatus.CONFLICT,
					"Ya existe un proveedor registrado con el RUC " + ruc);
		}
	}

	private Specification<Proveedor> construirFiltros(String q, String tipoProveedor, Boolean activo,
			Long destinoId) {
		return (root, query, cb) -> {
			List<Predicate> predicates = new ArrayList<>();

			if (StringUtils.hasText(q)) {
				predicates.add(Specifications.algunoContiene(cb, root, q, CAMPOS_BUSQUEDA));
			}
			if (StringUtils.hasText(tipoProveedor)) {
				predicates.add(Specifications.igual(cb, root.get("tipoProveedor"), tipoProveedor));
			}
			if (activo != null) {
				predicates.add(cb.equal(root.get("activo"), activo));
			}
			if (destinoId != null) {
				predicates.add(cb.equal(root.get("destino").get("id"), destinoId));
			}

			return predicates.isEmpty() ? cb.conjunction() : cb.and(predicates.toArray(new Predicate[0]));
		};
	}
}
