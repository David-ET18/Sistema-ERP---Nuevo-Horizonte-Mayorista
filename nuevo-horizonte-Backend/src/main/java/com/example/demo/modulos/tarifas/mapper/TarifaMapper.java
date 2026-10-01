package com.example.demo.modulos.tarifas.mapper;

import com.example.demo.modulos.tarifas.dto.TarifaDTO;
import com.example.demo.modulos.tarifas.entity.Tarifa;
import com.example.demo.modulos.proveedores.mapper.ProveedorMapper;

public final class TarifaMapper {

	private TarifaMapper() {
	}

	public static TarifaDTO toDTO(Tarifa tarifa) {
		return new TarifaDTO(
				tarifa.getId(),
				tarifa.getServicio().getNombre(),
				tarifa.getDestino().getNombre(),
				tarifa.getDestino().getId(),
				ProveedorMapper.nombre(tarifa.getProveedor()),
				tarifa.getPrecio(),
				tarifa.getMoneda(),
				tarifa.getFechaDesde(),
				tarifa.getFechaHasta());
	}
}
