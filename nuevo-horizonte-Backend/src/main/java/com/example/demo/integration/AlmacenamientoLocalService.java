package com.example.demo.integration;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Component;

/**
 * Almacenamiento en el sistema de archivos local, bajo la carpeta base configurada.
 */
@Component
public class AlmacenamientoLocalService implements AlmacenamientoService {

	private final Path base;

	public AlmacenamientoLocalService(
			@Value("${app.almacenamiento.ruta:uploads}") String rutaBase) {
		this.base = Paths.get(rutaBase).toAbsolutePath().normalize();
	}

	@Override
	public String guardar(String carpeta, String nombreArchivo, InputStream contenido) {
		try {
			Path destino = resolver(carpeta, nombreArchivo);
			Files.createDirectories(destino.getParent());
			Files.copy(contenido, destino, StandardCopyOption.REPLACE_EXISTING);
			return nombreArchivo;
		} catch (IOException e) {
			throw new IllegalStateException("No se pudo guardar el archivo " + nombreArchivo, e);
		}
	}

	@Override
	public Resource leer(String carpeta, String nombreArchivo) {
		try {
			Path ruta = resolver(carpeta, nombreArchivo);
			if (!Files.exists(ruta)) {
				return null;
			}
			return new UrlResource(ruta.toUri());
		} catch (IOException e) {
			throw new IllegalStateException("No se pudo leer el archivo " + nombreArchivo, e);
		}
	}

	/**
	 * Resuelve la ruta garantizando que no escape de la carpeta base
	 * (evita ataques de recorrido de directorios).
	 */
	private Path resolver(String carpeta, String nombreArchivo) {
		Path raiz = base.resolve(carpeta).normalize();
		Path destino = raiz.resolve(nombreArchivo).normalize();
		if (!destino.startsWith(base) || !destino.startsWith(raiz)) {
			throw new IllegalArgumentException("Ruta de archivo no permitida");
		}
		return destino;
	}
}
