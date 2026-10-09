package com.example.demo.modulos;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/modulos")
public class ModuloController {

	@GetMapping
	public List<Modulo> listar() {
		return ModuloCatalogo.MODULOS;
	}
}