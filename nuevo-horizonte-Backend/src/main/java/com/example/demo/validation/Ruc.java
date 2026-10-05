package com.example.demo.validation;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

/**
 * Valida que un RUC peruano tenga 11 digitos numericos.
 */
@Documented
@Constraint(validatedBy = RucValidator.class)
@Target({ ElementType.FIELD, ElementType.PARAMETER, ElementType.RECORD_COMPONENT })
@Retention(RetentionPolicy.RUNTIME)
public @interface Ruc {

	String message() default "El RUC debe tener 11 digitos";

	Class<?>[] groups() default {};

	Class<? extends Payload>[] payload() default {};
}
