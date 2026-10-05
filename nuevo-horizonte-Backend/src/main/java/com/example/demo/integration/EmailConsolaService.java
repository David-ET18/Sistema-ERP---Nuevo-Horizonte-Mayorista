package com.example.demo.integration;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

/**
 * Implementacion por defecto: registra el correo en la consola.
 * Es el fallback: se usa mientras no haya un servicio SMTP activo.
 * Al agregar spring-boot-starter-mail, una implementacion SMTP puede activarse
 * con app.email.enabled=true y esta dejara de registrarse.
 */
@Component
@ConditionalOnProperty(name = "app.email.enabled", havingValue = "false", matchIfMissing = true)
public class EmailConsolaService implements EmailService {

	private static final Logger log = LoggerFactory.getLogger(EmailConsolaService.class);

	@Override
	public void enviar(String destinatario, String asunto, String cuerpo) {
		log.info("=== CORREO (modo consola) ===");
		log.info("Destinatario: {}", destinatario);
		log.info("Asunto: {}", asunto);
		log.info("Cuerpo: {}", cuerpo);
	}
}
