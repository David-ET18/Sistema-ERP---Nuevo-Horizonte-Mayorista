package com.example.demo.modulos.gestionUsuariosRolesPermisos.service;

import com.example.demo.modulos.ModuloCatalogo;
import com.example.demo.modulos.gestionUsuariosRolesPermisos.dto.PermisoRequest;
import com.example.demo.modulos.gestionUsuariosRolesPermisos.dto.RolDTO;
import com.example.demo.modulos.gestionUsuariosRolesPermisos.dto.RolRequest;
import com.example.demo.modulos.gestionUsuariosRolesPermisos.entity.Rol;
import com.example.demo.modulos.gestionUsuariosRolesPermisos.entity.RolPermiso;
import com.example.demo.modulos.gestionUsuariosRolesPermisos.mapper.RolMapper;
import com.example.demo.modulos.gestionUsuariosRolesPermisos.repository.RolRepository;
import com.example.demo.exception.BusinessException;
import com.example.demo.exception.NotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class RolService {

	private static final List<String> PALETA = Arrays.asList(
			"#2563eb", "#7c3aed", "#059669", "#d97706", "#0ea5e9", "#dc2626");

	private final RolRepository rolRepository;

	public RolService(RolRepository rolRepository) {
		this.rolRepository = rolRepository;
	}

	@Transactional(readOnly = true)
	public List<RolDTO> listar() {
		return rolRepository.findAll().stream()
				.map(RolMapper::toDTO)
				.toList();
	}

	@Transactional(readOnly = true)
	public RolDTO obtener(Long id) {
		return RolMapper.toDTO(obtenerRol(id));
	}

	@Transactional
	public RolDTO crear(RolRequest request) {
		if (rolRepository.existsByNombre(request.nombre())) {
			throw new BusinessException("El rol ya existe");
		}

		Rol rol = new Rol();
		rol.setNombre(request.nombre());
		rol.setDescripcion(request.descripcion());
		rol.setColor(normalizarColor(request.color(), request.nombre()));
		rol.setActivo(request.activo() == null || request.activo());
		rol.setFechaCreacion(LocalDateTime.now());
		rol.setFechaActualizacion(LocalDateTime.now());

		cargarPermisos(rol, request);
		return RolMapper.toDTO(rolRepository.save(rol));
	}

	@Transactional
	public RolDTO actualizar(Long id, RolRequest request) {
		Rol rol = obtenerRol(id);

		rolRepository.findByNombre(request.nombre()).ifPresent(existente -> {
			if (!existente.getId().equals(id)) {
				throw new BusinessException("El rol ya existe");
			}
		});

		rol.setNombre(request.nombre());
		rol.setDescripcion(request.descripcion());
		if (request.color() != null && !request.color().isBlank()) {
			rol.setColor(request.color());
		}
		if (request.activo() != null) {
			if (rol.isEsSistema() && !request.activo()) {
				throw new BusinessException("No se puede desactivar un rol del sistema");
			}
			rol.setActivo(request.activo());
		}
		rol.setFechaActualizacion(LocalDateTime.now());

		rol.getRolPermisos().clear();
		cargarPermisos(rol, request);
		return RolMapper.toDTO(rol);
	}

	@Transactional
	public void eliminar(Long id) {
		Rol rol = obtenerRol(id);
		if (rol.isEsSistema()) {
			throw new BusinessException("No se puede eliminar un rol del sistema");
		}
		if (!rol.getUsuarioRoles().isEmpty()) {
			throw new BusinessException("No se puede eliminar un rol asignado a usuarios");
		}
		rolRepository.delete(rol);
	}

	private Rol obtenerRol(Long id) {
		return rolRepository.findById(id)
				.orElseThrow(() -> new NotFoundException("Rol no encontrado con id " + id));
	}

	/**
	 * Carga los permisos del rol validando cada "modulo" contra el catalogo real
	 * de la aplicacion ({@link ModuloCatalogo}), no texto libre: un modulo
	 * inexistente o mal escrito aqui es la misma vulnerabilidad que dejar que
	 * cualquiera escriba a mano la clave que protege rutas y endpoints (ver
	 * PermisoEvaluator). Tambien rechaza modulos repetidos: dos filas para el
	 * mismo modulo en un rol son ambiguas (PermisoEvaluator.anyMatch dejaria
	 * ganar la mas permisiva sin que sea obvio para quien edita el rol).
	 */
	private void cargarPermisos(Rol rol, RolRequest request) {
		if (request.permisos() == null) {
			return;
		}
		Set<String> modulosVistos = new HashSet<>();
		for (PermisoRequest permiso : request.permisos()) {
			if (permiso == null || permiso.modulo() == null || permiso.modulo().isBlank()) {
				continue;
			}
			String modulo = permiso.modulo().trim();
			if (!ModuloCatalogo.existe(modulo)) {
				throw new BusinessException("El modulo '" + modulo + "' no existe en el catalogo del sistema");
			}
			if (!modulosVistos.add(modulo)) {
				throw new BusinessException("El modulo '" + modulo + "' esta duplicado en los permisos del rol");
			}

			RolPermiso rolPermiso = new RolPermiso();
			rolPermiso.setRol(rol);
			rolPermiso.setModulo(modulo);
			rolPermiso.setPuedeLeer(Boolean.TRUE.equals(permiso.puedeLeer()));
			rolPermiso.setPuedeCrear(Boolean.TRUE.equals(permiso.puedeCrear()));
			rolPermiso.setPuedeActualizar(Boolean.TRUE.equals(permiso.puedeActualizar()));
			rolPermiso.setPuedeEliminar(Boolean.TRUE.equals(permiso.puedeEliminar()));
			rol.getRolPermisos().add(rolPermiso);
		}
	}

	private String normalizarColor(String color, String nombre) {
		if (color != null && !color.isBlank()) {
			return color;
		}
		int indice = Math.abs(nombre.hashCode()) % PALETA.size();
		return PALETA.get(indice);
	}
}