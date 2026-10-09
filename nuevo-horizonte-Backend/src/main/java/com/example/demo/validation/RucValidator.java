package com.example.demo.validation;

import java.util.regex.Pattern;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class RucValidator implements ConstraintValidator<Ruc, String> {

	private static final Pattern FORMATO = Pattern.compile("^\\d{11}$");

	@Override
	public boolean isValid(String value, ConstraintValidatorContext context) {
		if (value == null) {
			return true;
		}
		return FORMATO.matcher(value.trim()).matches();
	}
}
