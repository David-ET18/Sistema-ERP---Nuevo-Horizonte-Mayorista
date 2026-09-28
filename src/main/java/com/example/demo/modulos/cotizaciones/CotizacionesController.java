package com.example.demo.modulos.cotizaciones;

import com.example.demo.modulos.Modulo;
import com.example.demo.modulos.ModuloCatalogo;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/modulos/cotizaciones")
public class CotizacionesController {

	@GetMapping
	public Modulo info() {
		return ModuloCatalogo.porClave(ModuloCatalogo.COTIZACIONES);
	}
}