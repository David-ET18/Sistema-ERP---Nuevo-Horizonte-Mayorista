package com.example.demo.security;

import com.example.demo.modulos.gestionUsuariosRolesPermisos.repository.UsuarioRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

	private final JwtService jwtService;
	private final UsuarioRepository usuarioRepository;

	public JwtAuthFilter(JwtService jwtService, UsuarioRepository usuarioRepository) {
		this.jwtService = jwtService;
		this.usuarioRepository = usuarioRepository;
	}

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {
		String header = request.getHeader("Authorization");

		if (header == null || !header.startsWith("Bearer ")) {
			filterChain.doFilter(request, response);
			return;
		}

		String token = header.substring(7);
		if (jwtService.isValid(token) && SecurityContextHolder.getContext().getAuthentication() == null) {
			String username = jwtService.extractUsername(token);
			usuarioRepository.findByUsername(username).ifPresent(usuario -> {
				List<SimpleGrantedAuthority> authorities = usuario.getUsuarioRoles().stream()
						.map(usuarioRol -> new SimpleGrantedAuthority(usuarioRol.getRol().getNombre()))
						.toList();

				UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
						usuario.getUsername(), null, authorities);
				authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
				SecurityContextHolder.getContext().setAuthentication(authentication);
			});
		}

		filterChain.doFilter(request, response);
	}
}