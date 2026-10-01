package com.example.demo.modulos.gestionUsuariosRolesPermisos.service;

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
import java.util.List;
import java.util.Set;

@Service
public class RolService {

	private static final Set<String> TIPOS_BASE = Set.of("system", "custom", "admin");

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
		rol.setTipoBase(normalizarTipoBase(request.tipoBase()));
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
		if (request.tipoBase() != null && !request.tipoBase().isBlank()) {
			rol.setTipoBase(normalizarTipoBase(request.tipoBase()));
		}
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

	private void cargarPermisos(Rol rol, RolRequest request) {
		if (request.permisos() == null) {
			return;
		}
		for (PermisoRequest permiso : request.permisos()) {
			RolPermiso rolPermiso = new RolPermiso();
			rolPermiso.setRol(rol);
			rolPermiso.setModulo(permiso.modulo());
			rolPermiso.setPuedeLeer(permiso.puedeLeer());
			rolPermiso.setPuedeCrear(permiso.puedeCrear());
			rolPermiso.setPuedeActualizar(permiso.puedeActualizar());
			rolPermiso.setPuedeEliminar(permiso.puedeEliminar());
			rol.getRolPermisos().add(rolPermiso);
		}
	}

	private String normalizarTipoBase(String tipoBase) {
		if (tipoBase == null || tipoBase.isBlank()) {
			return "custom";
		}
		String normalizado = tipoBase.toLowerCase();
		if (!TIPOS_BASE.contains(normalizado)) {
			throw new BusinessException("El tipo_base debe ser: system, custom o admin");
		}
		return normalizado;
	}

	private String normalizarColor(String color, String nombre) {
		if (color != null && !color.isBlank()) {
			return color;
		}
		int indice = Math.abs(nombre.hashCode()) % PALETA.size();
		return PALETA.get(indice);
	}
}