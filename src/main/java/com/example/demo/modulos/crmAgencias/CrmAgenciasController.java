package com.example.demo.modulos.crmAgencias;

import com.example.demo.modulos.Modulo;
import com.example.demo.modulos.ModuloCatalogo;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/modulos/crm-agencias")
public class CrmAgenciasController {

	@GetMapping
	public Modulo info() {
		return ModuloCatalogo.porClave(ModuloCatalogo.CRM_AGENCIAS);
	}
}