package com.example.demo.acceso.service;

import com.example.demo.acceso.dto.PermisoRequest;
import com.example.demo.acceso.dto.RolDTO;
import com.example.demo.acceso.dto.RolRequest;
import com.example.demo.acceso.entity.Rol;
import com.example.demo.acceso.entity.RolPermiso;
import com.example.demo.acceso.mapper.RolMapper;
import com.example.demo.acceso.repository.RolRepository;
import com.example.demo.exception.BusinessException;
import com.example.demo.exception.NotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class RolService {

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

		rol.getRolPermisos().clear();
		cargarPermisos(rol, request);
		return RolMapper.toDTO(rol);
	}

	@Transactional
	public void eliminar(Long id) {
		Rol rol = obtenerRol(id);
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
			rolPermiso.setPuedeEscribir(permiso.puedeEscribir());
			rol.getRolPermisos().add(rolPermiso);
		}
	}
}