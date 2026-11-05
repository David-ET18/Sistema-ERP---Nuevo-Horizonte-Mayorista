package com.example.demo.modulos.promociones.service;

import com.example.demo.exception.BusinessException;
import com.example.demo.exception.NotFoundException;
import com.example.demo.modulos.catalogo.entity.Servicio;
import com.example.demo.modulos.catalogo.repository.ServicioRepository;
import com.example.demo.modulos.notificaciones.service.NotificacionService;
import com.example.demo.modulos.promociones.dto.ImagenPromocionDTO;
import com.example.demo.modulos.promociones.dto.KpiPromocionesDTO;
import com.example.demo.modulos.promociones.dto.PromocionDTO;
import com.example.demo.modulos.promociones.dto.PromocionRequest;
import com.example.demo.modulos.promociones.dto.ServicioPromocionDTO;
import com.example.demo.modulos.promociones.entity.Promocion;
import com.example.demo.modulos.promociones.mapper.PromocionMapper;
import com.example.demo.modulos.promociones.repository.PromocionRepository;
import com.example.demo.modulos.tarifas.repository.TarifaRepository;
import com.example.demo.util.Textos;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class PromocionService {

	private static final long MAX_IMAGEN_BYTES = 5L * 1024 * 1024;
	private static final Set<String> ESTADOS_VALIDOS = Set.of("VIGENTE", "PROGRAMADA", "VENCIDA", "INACTIVA");
	private static final DateTimeFormatter FECHA_CORTA = DateTimeFormatter.ofPattern("dd/MM/yyyy");

	private final PromocionRepository promocionRepository;
	private final ServicioRepository servicioRepository;
	private final TarifaRepository tarifaRepository;
	private final NotificacionService notificacionService;

	public PromocionService(PromocionRepository promocionRepository,
			ServicioRepository servicioRepository,
			TarifaRepository tarifaRepository,
			NotificacionService notificacionService) {
		this.promocionRepository = promocionRepository;
		this.servicioRepository = servicioRepository;
		this.tarifaRepository = tarifaRepository;
		this.notificacionService = notificacionService;
	}

	public Page<PromocionDTO> listar(String q, Boolean activa, Boolean destacada, Long servicioId, String estado,
			Pageable pageable) {
		String patron = Textos.patronContiene(q);
		String estadoNormalizado = normalizarEstado(estado);
		return promocionRepository.listar(patron, activa, destacada, servicioId, estadoNormalizado,
				LocalDate.now(), pageable);
	}

	public KpiPromocionesDTO kpis() {
		LocalDate hoy = LocalDate.now();
		return new KpiPromocionesDTO(
				promocionRepository.count(),
				promocionRepository.countByActivaTrue(),
				promocionRepository.countByDestacadaTrue(),
				promocionRepository.countVigentes(hoy),
				promocionRepository.countPorVencer(hoy, hoy.plusDays(7)));
	}

	/**
	 * Servicios activos del catalogo para el selector (opcional) de la
	 * promocion. El precio de referencia es la tarifa vigente mas baja del
	 * servicio; si no tiene tarifas vigentes queda en null.
	 */
	public List<ServicioPromocionDTO> serviciosDisponibles() {
		Map<Long, BigDecimal> precios = tarifaRepository.findPrecioMinimoVigentePorServicio().stream()
				.filter(item -> item.getServicioId() != null && item.getPrecio() != null)
				.collect(Collectors.toMap(
						TarifaRepository.PrecioMinimoServicio::getServicioId,
						TarifaRepository.PrecioMinimoServicio::getPrecio,
						(actual, siguiente) -> actual));
		return servicioRepository.findByActivoTrueOrderByNombreAsc().stream()
				.map(servicio -> new ServicioPromocionDTO(
						servicio.getId(),
						servicio.getNombre(),
						servicio.getCategoria(),
						precios.get(servicio.getId())))
				.toList();
	}

	public PromocionDTO detalle(Long id) {
		return PromocionMapper.toDTO(obtener(id));
	}

	@Transactional
	public PromocionDTO crear(PromocionRequest request, MultipartFile imagen) {
		validarFechas(request);
		Promocion promocion = new Promocion();
		promocion.setActiva(request.getActiva() == null || request.getActiva());
		promocion.setDestacada(Boolean.TRUE.equals(request.getDestacada()));
		PromocionMapper.aplicar(promocion, request, resolverServicio(request.getServicioId()));
		calcularPrecioPromocional(promocion);
		aplicarImagen(promocion, imagen, request.getQuitarImagen());

		Promocion guardada = promocionRepository.save(promocion);
		if (guardada.isActiva()) {
			notificar(guardada, "Nueva promoción: ", "Nueva promoción disponible");
		}
		return PromocionMapper.toDTO(guardada);
	}

	@Transactional
	public PromocionDTO actualizar(Long id, PromocionRequest request, MultipartFile imagen) {
		validarFechas(request);
		Promocion promocion = obtener(id);
		boolean estabaActiva = promocion.isActiva();

		PromocionMapper.aplicar(promocion, request, resolverServicio(request.getServicioId()));
		calcularPrecioPromocional(promocion);
		aplicarImagen(promocion, imagen, request.getQuitarImagen());
		Promocion guardada = promocionRepository.save(promocion);

		// Solo se notifica cuando la promocion pasa de inactiva a activa.
		if (!estabaActiva && guardada.isActiva()) {
			notificar(guardada, "Promoción activada: ", "Promoción reactivada");
		}
		return PromocionMapper.toDTO(guardada);
	}

	@Transactional
	public PromocionDTO activar(Long id) {
		Promocion promocion = obtener(id);
		boolean estabaActiva = promocion.isActiva();
		promocion.setActiva(true);
		promocion.setFechaActualizacion(LocalDateTime.now());
		Promocion guardada = promocionRepository.save(promocion);
		if (!estabaActiva) {
			notificar(guardada, "Promoción activada: ", "Promoción reactivada");
		}
		return PromocionMapper.toDTO(guardada);
	}

	@Transactional
	public PromocionDTO desactivar(Long id) {
		Promocion promocion = obtener(id);
		promocion.setActiva(false);
		promocion.setFechaActualizacion(LocalDateTime.now());
		return PromocionMapper.toDTO(promocionRepository.save(promocion));
	}

	@Transactional
	public void eliminar(Long id) {
		promocionRepository.delete(obtener(id));
	}

	public ImagenPromocionDTO obtenerImagen(Long id) {
		PromocionRepository.ImagenProyeccion imagen = promocionRepository.findImagenById(id)
				.orElseThrow(() -> new NotFoundException("Promoción no encontrada con id " + id));
		if (imagen.getImagen() == null || imagen.getImagen().length == 0) {
			throw new NotFoundException("La promoción no tiene una imagen registrada");
		}
		String contentType = imagen.getImagenContentType();
		if (contentType == null || contentType.isBlank()) {
			contentType = "image/jpeg";
		}
		String nombre = imagen.getImagenNombre();
		if (nombre == null || nombre.isBlank()) {
			nombre = "promocion-" + id;
		}
		return new ImagenPromocionDTO(imagen.getImagen(), contentType, nombre);
	}

	private Promocion obtener(Long id) {
		return promocionRepository.findById(id)
				.orElseThrow(() -> new NotFoundException("Promoción no encontrada con id " + id));
	}

	private Servicio resolverServicio(Long servicioId) {
		if (servicioId == null) {
			return null;
		}
		return servicioRepository.findById(servicioId)
				.orElseThrow(() -> new NotFoundException("Servicio no encontrado con id " + servicioId));
	}

	private String normalizarEstado(String estado) {
		if (!Textos.noVacio(estado)) {
			return null;
		}
		String normalizado = estado.trim().toUpperCase(Locale.ROOT);
		if (!ESTADOS_VALIDOS.contains(normalizado)) {
			throw new BusinessException("Estado de vigencia no válido: " + estado);
		}
		return normalizado;
	}

	private void validarFechas(PromocionRequest request) {
		if (request.getFechaInicio() != null && request.getFechaFin() != null
				&& request.getFechaFin().isBefore(request.getFechaInicio())) {
			throw new BusinessException("La fecha de fin no puede ser anterior a la fecha de inicio");
		}
	}

	/**
	 * El precio promocional se deriva siempre del precio original y el
	 * descuento: no se acepta un valor manual para evitar incoherencias.
	 */
	private void calcularPrecioPromocional(Promocion promocion) {
		if (promocion.getPrecioOriginal() == null || promocion.getDescuentoPorcentaje() == null) {
			promocion.setPrecioPromocional(null);
			return;
		}
		BigDecimal factor = BigDecimal.valueOf(100).subtract(promocion.getDescuentoPorcentaje());
		promocion.setPrecioPromocional(promocion.getPrecioOriginal()
				.multiply(factor)
				.divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP));
	}

	private void aplicarImagen(Promocion promocion, MultipartFile imagen, Boolean quitarImagen) {
		if (imagen != null && !imagen.isEmpty()) {
			if (imagen.getSize() > MAX_IMAGEN_BYTES) {
				throw new BusinessException("La imagen no puede superar los 5 MB");
			}
			byte[] contenido;
			try {
				contenido = imagen.getBytes();
			} catch (IOException ex) {
				throw new BusinessException("No se pudo leer la imagen enviada");
			}
			String contentType = detectarContentType(contenido);
			if (contentType == null) {
				throw new BusinessException("Formato de imagen no permitido. Usa JPG, PNG, WEBP o GIF");
			}
			promocion.setImagen(contenido);
			promocion.setImagenContentType(contentType);
			promocion.setImagenNombre(nombreArchivo(imagen.getOriginalFilename()));
			promocion.setImagenTamano((long) contenido.length);
			return;
		}
		if (Boolean.TRUE.equals(quitarImagen)) {
			promocion.setImagen(null);
			promocion.setImagenContentType(null);
			promocion.setImagenNombre(null);
			promocion.setImagenTamano(null);
		}
	}

	private String nombreArchivo(String original) {
		if (!Textos.noVacio(original)) {
			return "promocion-imagen";
		}
		String limpio = original.trim().replace('\\', '/');
		int corte = limpio.lastIndexOf('/');
		String nombre = corte >= 0 ? limpio.substring(corte + 1) : limpio;
		return nombre.length() > 200 ? nombre.substring(nombre.length() - 200) : nombre;
	}

	/**
	 * Valida el contenido real del archivo por firma binaria, no solo por la
	 * extension o el Content-Type que declara el navegador.
	 */
	private String detectarContentType(byte[] b) {
		if (b.length >= 3
				&& (b[0] & 0xFF) == 0xFF && (b[1] & 0xFF) == 0xD8 && (b[2] & 0xFF) == 0xFF) {
			return "image/jpeg";
		}
		if (b.length >= 8
				&& (b[0] & 0xFF) == 0x89 && b[1] == 'P' && b[2] == 'N' && b[3] == 'G'
				&& (b[4] & 0xFF) == 0x0D && (b[5] & 0xFF) == 0x0A && (b[6] & 0xFF) == 0x1A && (b[7] & 0xFF) == 0x0A) {
			return "image/png";
		}
		if (b.length >= 6
				&& b[0] == 'G' && b[1] == 'I' && b[2] == 'F' && b[3] == '8'
				&& (b[4] == '7' || b[4] == '9') && b[5] == 'a') {
			return "image/gif";
		}
		if (b.length >= 12
				&& b[0] == 'R' && b[1] == 'I' && b[2] == 'F' && b[3] == 'F'
				&& b[8] == 'W' && b[9] == 'E' && b[10] == 'B' && b[11] == 'P') {
			return "image/webp";
		}
		return null;
	}

	private void notificar(Promocion promocion, String prefijoTitulo, String contexto) {
		String titulo = prefijoTitulo + promocion.getNombre();
		StringBuilder mensaje = new StringBuilder(contexto)
				.append(": ")
				.append(promocion.getDescuentoPorcentaje().stripTrailingZeros().toPlainString())
				.append("% de descuento");
		if (promocion.getServicio() != null) {
			mensaje.append(" en ").append(promocion.getServicio().getNombre());
		}
		if (promocion.getFechaFin() != null) {
			mensaje.append(". Válida hasta el ").append(promocion.getFechaFin().format(FECHA_CORTA));
		}
		notificacionService.crearParaUsuariosActivos(
				titulo,
				recortar(mensaje.toString(), 500),
				NotificacionService.TIPO_PROMOCION,
				"/promociones",
				notificacionService.actorActual(),
				detallePromocion(promocion));
	}

	/** Texto ampliado que ve el usuario al abrir el detalle de la notificacion. */
	private String detallePromocion(Promocion promocion) {
		StringBuilder detalle = new StringBuilder();
		detalle.append("Promoción \u00AB").append(promocion.getNombre()).append("\u00BB");
		detalle.append(" · ")
				.append(promocion.getDescuentoPorcentaje().stripTrailingZeros().toPlainString())
				.append("% de descuento");
		if (promocion.getServicio() != null) {
			detalle.append(" en \u00AB").append(promocion.getServicio().getNombre()).append("\u00BB");
		}
		detalle.append(". Vigencia: ");
		if (promocion.getFechaInicio() != null) {
			detalle.append("desde el ").append(promocion.getFechaInicio().format(FECHA_CORTA)).append(" ");
		}
		detalle.append(promocion.getFechaFin() != null
				? "hasta el " + promocion.getFechaFin().format(FECHA_CORTA)
				: "sin fecha límite");
		if (promocion.getPrecioOriginal() != null) {
			detalle.append(". Precio original: S/ ")
					.append(promocion.getPrecioOriginal().setScale(2, RoundingMode.HALF_UP).toPlainString());
		}
		if (promocion.getPrecioPromocional() != null) {
			detalle.append(". Precio promocional: S/ ")
					.append(promocion.getPrecioPromocional().setScale(2, RoundingMode.HALF_UP).toPlainString());
		}
		detalle.append(". Estado: ").append(promocion.isActiva() ? "activa" : "inactiva");
		if (promocion.isDestacada()) {
			detalle.append(" y destacada");
		}
		detalle.append(".");
		return detalle.toString();
	}

	private String recortar(String valor, int maximo) {
		return valor.length() <= maximo ? valor : valor.substring(0, maximo);
	}
}
