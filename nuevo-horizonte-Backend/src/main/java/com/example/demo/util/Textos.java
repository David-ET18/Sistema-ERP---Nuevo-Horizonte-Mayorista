package com.example.demo.util;

import java.util.Locale;

/**
 * Funciones auxiliares para texto usadas por varios modulos.
 */
public final class Textos {

	private Textos() {
	}

	/**
	 * Normaliza un valor de texto: recorta los espacios y devuelve null si queda vacio.
	 */
	public static String sinEspacios(String valor) {
		if (valor == null) {
			return null;
		}
		String recortado = valor.trim();
		return recortado.isEmpty() ? null : recortado;
	}

	/**
	 * Indica si el valor tiene contenido una vez recortado.
	 */
	public static boolean noVacio(String valor) {
		return valor != null && !valor.trim().isEmpty();
	}

	/**
	 * Devuelve el primer valor con contenido, o null si todos estan vacios.
	 * Util para resolver nombres de negocio (nombre comercial vs razon social).
	 */
	public static String primeroConContenido(String... valores) {
		for (String valor : valores) {
			if (noVacio(valor)) {
				return valor.trim();
			}
		}
		return null;
	}

	/**
	 * Construye el patron de busqueda "contiene" ya normalizado a minusculas.
	 */
	public static String patronContiene(String valor) {
		String normalizado = sinEspacios(valor);
		return normalizado == null ? null : "%" + normalizado.toLowerCase(Locale.ROOT) + "%";
	}

	/**
	 * Normaliza a minusculas para comparaciones seguras entre bases de datos.
	 */
	public static String normalizar(String valor) {
		return valor == null ? null : valor.trim().toLowerCase(Locale.ROOT);
	}
}
