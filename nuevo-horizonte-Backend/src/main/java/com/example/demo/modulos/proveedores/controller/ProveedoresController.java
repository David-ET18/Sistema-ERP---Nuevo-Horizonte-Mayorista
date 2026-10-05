package com.example.demo.modulos.proveedores.controller;

import com.example.demo.modulos.Modulo;
import com.example.demo.modulos.ModuloCatalogo;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/modulos/proveedores")
public class ProveedoresController {

	@GetMapping
	public Modulo info() {
		return ModuloCatalogo.porClave(ModuloCatalogo.PROVEEDORES);
	}
}