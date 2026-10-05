package com.example.demo.integration;

import java.io.InputStream;

import org.springframework.core.io.Resource;

/**
 * Persistencia de archivos en un almacen externo.
 * Permite cambiar de disco local a un bucket sin tocar los controllers.
 */
public interface AlmacenamientoService {

	/**
	 * Guarda el contenido bajo la carpeta y nombre indicados y devuelve el nombre final.
	 */
	String guardar(String carpeta, String nombreArchivo, InputStream contenido);

	/**
	 * Obtiene el archivo almacenado, o null si no existe.
	 */
	Resource leer(String carpeta, String nombreArchivo);
}
