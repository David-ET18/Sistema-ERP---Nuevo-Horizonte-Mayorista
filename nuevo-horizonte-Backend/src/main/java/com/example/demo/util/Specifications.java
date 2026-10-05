package com.example.demo.util;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Path;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;

/**
 * Predicados reutilizables para Specifications de Spring Data.
 * Evita duplicar el patron "contains ignorando mayusculas" en cada modulo.
 */
public final class Specifications {

	private Specifications() {
	}

	/**
	 * Predicado LIKE que ignora mayusculas y_minusculas.
	 */
	public static Predicate contiene(CriteriaBuilder cb, Path<String> path, String valor) {
		return cb.like(cb.lower(path), Textos.patronContiene(valor));
	}

	/**
	 * Predicado de igualdad que ignora mayusculas y acentos de mayusculas.
	 */
	public static Predicate igual(CriteriaBuilder cb, Expression<String> path, String valor) {
		return cb.equal(cb.lower(path), Textos.normalizar(valor));
	}

	/**
	 * Combina varios campos con OR usando el mismo criterio de busqueda.
	 */
	public static Predicate algunoContiene(CriteriaBuilder cb, Root<?> root, String valor,
			Collection<String> atributos) {
		List<Predicate> alternativas = new ArrayList<>();
		for (String atributo : atributos) {
			alternativas.add(contiene(cb, root.get(atributo), valor));
		}
		return cb.or(alternativas.toArray(new Predicate[0]));
	}
}
