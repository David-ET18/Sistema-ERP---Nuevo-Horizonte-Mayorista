package com.example.demo.modulos.reservas;

import com.example.demo.modulos.Modulo;
import com.example.demo.modulos.ModuloCatalogo;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/modulos/reservas")
public class ReservasController {

	@GetMapping
	public Modulo info() {
		return ModuloCatalogo.porClave(ModuloCatalogo.RESERVAS);
	}
}