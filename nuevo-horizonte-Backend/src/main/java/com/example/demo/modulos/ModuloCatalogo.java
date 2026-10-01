package com.example.demo.modulos;

import java.util.List;

public final class ModuloCatalogo {

	private ModuloCatalogo() {
	}

	public static final String PROVEEDORES = "proveedores";
	public static final String TARIFAS = "tarifas";
	public static final String PAQUETES = "paquetes";
	public static final String PROMOCIONES = "promociones";
	public static final String COTIZACIONES = "cotizaciones";
	public static final String VENTAS = "ventas";
	public static final String RESERVAS = "reservas";
	public static final String PAGOS = "pagos";
	public static final String GESTION_AGENCIAS = "gestion-agencias";
	public static final String SEGUIMIENTO_COMERCIAL = "seguimiento-comercial";
	public static final String MARKETING = "marketing";
	public static final String REPORTES = "reportes";
	public static final String DOCUMENTOS = "documentos";
	public static final String NOTIFICACIONES = "notificaciones";
	public static final String GESTION_USUARIOS_ROLES_PERMISOS = "gestion-usuarios-roles-permisos";

	public static final List<Modulo> MODULOS = List.of(
			new Modulo(PROVEEDORES, "Gestion de Proveedores",
					"Registro y administracion de operadores turisticos (hoteles, transporte, operadores)"),
			new Modulo(TARIFAS, "Gestion de Tarifas",
					"Control de precios con fechas de vigencia y actualizaciones"),
			new Modulo(PAQUETES, "Armado de Paquetes Turisticos",
					"Composicion de paquetes combinando tarifas de distintos proveedores"),
			new Modulo(PROMOCIONES, "Gestion de Promociones",
					"Descuentos y ofertas especiales aplicables a tarifas y paquetes"),
			new Modulo(COTIZACIONES, "Gestion de Cotizaciones",
					"Generacion y seguimiento de propuestas comerciales para agencias"),
			new Modulo(VENTAS, "Gestion de Ventas",
					"Registro y consulta de ventas confirmadas a partir de cotizaciones cerradas"),
			new Modulo(RESERVAS, "Gestion de Reservas",
					"Registro de reservas confirmadas a partir de cotizaciones cerradas"),
			new Modulo(PAGOS, "Gestion de Pagos",
					"Control de pagos asociados a reservas (monto, metodo, estado)"),
			new Modulo(GESTION_AGENCIAS, "Gestion de Agencias",
					"Directorio maestro de clientes B2B: registro, contacto y categoria"),
			new Modulo(SEGUIMIENTO_COMERCIAL, "Seguimiento Comercial",
					"Bitacora de interacciones con agencias (llamadas, correos, reuniones)"),
			new Modulo(MARKETING, "Difusion y Marketing",
					"Publicacion de promociones y programas en canales de marketing"),
			new Modulo(REPORTES, "Dashboard y Reportes",
					"Indicadores KPIs y reportes gerenciales del negocio"),
			new Modulo(DOCUMENTOS, "Repositorio de Documentos",
					"Almacenamiento centralizado de archivos (contratos, flyers, PDFs)"),
			new Modulo(NOTIFICACIONES, "Notificaciones",
					"Alertas automaticas del sistema (tarifas por vencer, errores)"),
			new Modulo(GESTION_USUARIOS_ROLES_PERMISOS, "Gestion de Usuarios, Roles y Permisos",
					"Administracion de usuarios, roles y permisos del sistema"));

	public static boolean existe(String clave) {
		return MODULOS.stream().anyMatch(modulo -> modulo.clave().equals(clave));
	}

	public static Modulo porClave(String clave) {
		return MODULOS.stream().filter(modulo -> modulo.clave().equals(clave)).findFirst().orElse(null);
	}
}