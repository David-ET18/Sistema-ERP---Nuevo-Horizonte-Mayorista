package com.example.demo.integration;

/**
 * Envio de correos electronicos a servicios externos.
 * La implementacion activa depende de la configuracion del proyecto.
 */
public interface EmailService {

	void enviar(String destinatario, String asunto, String cuerpo);
}
