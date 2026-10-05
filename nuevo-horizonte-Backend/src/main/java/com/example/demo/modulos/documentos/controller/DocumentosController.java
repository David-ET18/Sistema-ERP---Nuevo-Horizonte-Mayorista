package com.example.demo.modulos.documentos.controller;

import com.example.demo.modulos.Modulo;
import com.example.demo.modulos.ModuloCatalogo;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/modulos/documentos")
public class DocumentosController {

	@GetMapping
	public Modulo info() {
		return ModuloCatalogo.porClave(ModuloCatalogo.DOCUMENTOS);
	}
}