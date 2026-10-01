/* ==========================================================================
   CGS Del Ecuador — catálogo, ficha técnica y carrusel de valor
   HTML/CSS/JS planos, sin framework ni build step. Leer AGENTS.md antes de tocar.

   Contrato de datos: productos.json es la única fuente de producto. Todo lo que
   llega de ahí se inserta como TEXT CONTENT (nunca como HTML), y cada tarjeta
   se enlaza con el objeto de producto que la originó, no con un índice: un
   índice es una posición, no una identidad, y se rompe en cuanto se filtra.
   ========================================================================== */

const TELEFONO_WHATSAPP = '593963518696';

/* En 3G un fetch sin plazo puede quedarse colgado indefinidamente y el usuario
   ve el spinner girando para siempre. Cortamos a los 12 s y ofrecemos reintento. */
const MS_CARGA_MAXIMA = 12000;
const MS_INTERVALO_CARRUSEL = 4000;

let productosGlobales = [];
let categoriaActual = 'Todas';
let productosPorClave = new Map();
let referenciaPreviaModal = null;

const enlaceWhatsapp = (texto) =>
  `https://wa.me/${TELEFONO_WHATSAPP}?text=${encodeURIComponent(texto)}`;

/* 1. WhatsApp General ------------------------------------------------------
   El mensaje genérico y sus 5 call sites están en cola para /impeccable clarify
   (AGENTS.md, regla 3). No se tocan aquí. */
function abrirWhatsappGeneral() {
  const mensaje = '¡Hola! Quisiera más información sobre la asesoría técnica para mi cultivo.';
  window.open(enlaceWhatsapp(mensaje), '_blank', 'noopener');
}

/* 2. Arranque -------------------------------------------------------------- */
function iniciar() {
  if (document.getElementById('productosGrid')) {
    escucharCatalogo();
    cargarProductos();
  }
  iniciarCarruselValor();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', iniciar);
} else {
  iniciar();
}

/* 3. Carga del catálogo ---------------------------------------------------- */
function mostrarCargando(grid) {
  grid.textContent = '';
  const caja = document.createElement('div');
  caja.className = 'loading';
  caja.setAttribute('role', 'status');

  const spinner = document.createElement('div');
  spinner.className = 'spinner';
  spinner.setAttribute('aria-hidden', 'true');

  const texto = document.createElement('p');
  texto.textContent = 'Cargando productos agrícolas...';

  caja.append(spinner, texto);
  grid.append(caja);
}

function indexarProductos(lista) {
  productosPorClave = new Map();
  lista.forEach((producto, i) => {
    productosPorClave.set(claveDe(producto, i), producto);
  });
}

/* Identidad estable de un producto. El id del JSON manda; si faltara, la
   posición en la lista original sirve de clave, no la posición en la filtrada. */
function claveDe(producto, indiceOriginal) {
  if (producto.id !== undefined && producto.id !== null && producto.id !== '') {
    return String(producto.id);
  }
  const i = indiceOriginal !== undefined ? indiceOriginal : productosGlobales.indexOf(producto);
  return `sin-id-${i}`;
}

async function cargarProductos() {
  const grid = document.getElementById('productosGrid');
  if (!grid) return;

  mostrarCargando(grid);

  try {
    const control = new AbortController();
    const reloj = setTimeout(() => control.abort(), MS_CARGA_MAXIMA);
    let respuesta;
    try {
      respuesta = await fetch('./productos.json', { signal: control.signal });
    } finally {
      clearTimeout(reloj);
    }
    if (!respuesta.ok) throw new Error('HTTP ' + respuesta.status);

    const datos = await respuesta.json();
    if (!Array.isArray(datos)) {
      throw new Error('productos.json no contiene una lista de productos');
    }

    productosGlobales = datos;
    indexarProductos(productosGlobales);
    mostrarProductos(productosGlobales);
  } catch (error) {
    console.warn('Error cargando los productos:', error);
    productosGlobales = [];
    productosPorClave = new Map();
    mostrarEstadoCatalogo(grid, 'error', error);
  }
}

/* 4. Estados del catálogo: cargando / con resultados / vacío / error -------- */
function crearCajaEstado(clase) {
  const caja = document.createElement('div');
  caja.className = 'catalogo-estado ' + clase;
  return caja;
}

function crearAccion(texto, clase, alPulsar) {
  const boton = document.createElement('button');
  boton.type = 'button';
  boton.className = clase;
  boton.textContent = texto;
  boton.addEventListener('click', alPulsar);
  return boton;
}

function mostrarEstadoCatalogo(grid, tipo, error) {
  const termino = (document.getElementById('searchInput')?.value || '').trim();
  const caja = crearCajaEstado(tipo === 'error' ? 'catalogo-estado--error' : 'catalogo-estado--vacio');
  caja.setAttribute('role', tipo === 'error' ? 'alert' : 'status');

  const titulo = document.createElement('p');
  titulo.className = 'catalogo-estado__titulo';

  const texto = document.createElement('p');
  texto.className = 'catalogo-estado__texto';

  const acciones = document.createElement('div');
  acciones.className = 'catalogo-estado__acciones';

  if (tipo === 'error') {
    const sinConexion = error && (error.name === 'AbortError' || error.name === 'TypeError');
    titulo.textContent = 'No pudimos cargar el catálogo.';
    texto.textContent = sinConexion
      ? 'Tu conexión parece lenta o se interrumpió. Puedes reintentar la carga, o preguntarle al ingeniero directamente por WhatsApp.'
      : 'Hubo un problema al leer los productos. Reintenta, o pregúntale al ingeniero directamente por WhatsApp.';

    acciones.append(
      crearAccion('Reintentar', 'btn-agregar', () => cargarProductos()),
      crearAccion('Escribir por WhatsApp', 'btn-categoria', () =>
        window.open(
          enlaceWhatsapp('¡Hola! Quisiera más información sobre la asesoría técnica para mi cultivo.'),
          '_blank',
          'noopener'
        )
      )
    );
  } else {
    titulo.textContent = termino
      ? `Ningún producto coincide con «${termino}».`
      : `No hay productos en la categoría «${categoriaActual}».`;
    texto.textContent =
      'Prueba con otra palabra o con otra categoría. Si buscas una fórmula que no aparece en el catálogo, el ingeniero la recomienda según tu cultivo y la dosis que necesita.';

    if (termino) {
      const limpiar = crearAccion('Limpiar búsqueda', 'btn-categoria', () => {
        const campo = document.getElementById('searchInput');
        if (campo) {
          campo.value = '';
          campo.focus();
        }
        aplicarFiltros();
      });
      acciones.append(limpiar);
    }

    acciones.append(
      crearAccion('Consultar por WhatsApp', 'btn-agregar', () =>
        window.open(
          enlaceWhatsapp('¡Hola! Quisiera más información sobre la asesoría técnica para mi cultivo.'),
          '_blank',
          'noopener'
        )
      )
    );
  }

  caja.append(titulo, texto, acciones);
  grid.textContent = '';
  grid.append(caja);
}

function anunciarResultados(cantidad) {
  const region = document.getElementById('resultadosCatalogo');
  if (!region) return;
  const termino = (document.getElementById('searchInput')?.value || '').trim();
  const sufijo = termino ? ` que coinciden con «${termino}»` : '';
  region.textContent =
    cantidad === 1
      ? `1 producto${sufijo} en el catálogo.`
      : `${cantidad} productos${sufijo} en el catálogo.`;
}

/* 5. Renderizado de tarjetas ----------------------------------------------- */
function crearImagenProducto(producto, clase) {
  const imagen = document.createElement('img');
  imagen.className = clase;
  imagen.alt = producto.nombre || '';
  imagen.decoding = 'async';
  imagen.src = producto.imagen || 'img/placeholder.svg';
  /* Si el placeholder también fallara, reintentar el onerror en bucle dispara
     peticiones sin fin. Se anula el manejador antes de reasignar el src. */
  imagen.addEventListener('error', function alFallarImagen() {
    imagen.removeEventListener('error', alFallarImagen);
    imagen.src = 'img/placeholder.svg';
  });
  return imagen;
}

function construirTarjeta(producto) {
  const tarjeta = document.createElement('div');
  tarjeta.className = 'producto-card';
  if (producto.id) tarjeta.dataset.id = String(producto.id);

  const info = document.createElement('div');
  info.className = 'producto-info';

  const categoria = document.createElement('span');
  categoria.className = 'producto-categoria';
  categoria.textContent = producto.categoria || 'General';

  const nombre = document.createElement('h3');
  nombre.className = 'producto-nombre';
  nombre.textContent = producto.nombre || 'Producto sin nombre';

  const descripcion = document.createElement('p');
  descripcion.className = 'producto-descripcion';
  descripcion.textContent =
    producto.descripcionCorta || producto.detalleAdicional || 'Sin descripción disponible.';

  const pie = document.createElement('div');
  pie.className = 'producto-footer producto-footer--detalle';

  const boton = document.createElement('button');
  boton.type = 'button';
  boton.className = 'btn-agregar btn-agregar--ancho';
  boton.textContent = 'Más información';
  /* WCAG 2.5.3 (Label in Name): el nombre accesible debe CONTENER el texto
     visible. Con el texto solo, una lectora de pantalla anuncia "Más
     información, botón" nueve veces seguidas y no hay forma de saber cuál es
     cuál. El prefijo conserva el texto visible, el sufijo desambigua. */
  boton.setAttribute(
    'aria-label',
    `Más información sobre ${producto.nombre || 'este producto'}`
  );
  boton.dataset.detalle = claveDe(producto);

  pie.append(boton);
  info.append(categoria, nombre, descripcion, pie);
  tarjeta.append(crearImagenProducto(producto, 'producto-imagen'), info);
  return tarjeta;
}

function mostrarProductos(lista) {
  const grid = document.getElementById('productosGrid');
  if (!grid) return;

  if (!Array.isArray(lista) || lista.length === 0) {
    mostrarEstadoCatalogo(grid, 'vacio');
    anunciarResultados(0);
    return;
  }

  const fragmento = document.createDocumentFragment();
  lista.forEach((producto) => fragmento.append(construirTarjeta(producto)));
  grid.textContent = '';
  grid.append(fragmento);
  anunciarResultados(lista.length);
}

/* Delegación de eventos: un solo oyente sobrevive a cada re-renderizado, y el
   botón resuelve por clave de producto en lugar de por posición en la lista. */
function escucharCatalogo() {
  const grid = document.getElementById('productosGrid');
  if (grid) {
    grid.addEventListener('click', (evento) => {
      const boton = evento.target.closest('button[data-detalle]');
      if (boton) abrirDetalleProducto(productosPorClave.get(boton.dataset.detalle), boton);
    });
  }

  const chips = document.querySelectorAll('.btn-categoria[data-categoria]');
  chips.forEach((chip) => {
    chip.addEventListener('click', () => filtrarCategoria(chip.dataset.categoria, chip));
  });

  const modal = document.getElementById('modalProducto');
  if (modal) {
    /* El overlay ahora es contenedor de scroll (overflow-y: auto). Sin este
       registro, scrollear la ficha y soltar el puntero sobre el fondo dispara
       un click cuyo target es el overlay, y el dialogo se cerraba solo.
       Solo se cierra si el gesto empezo Y termino sobre el backdrop. */
    let inicioSobreOverlay = false;
    modal.addEventListener('mousedown', (evento) => {
      inicioSobreOverlay = evento.target === modal;
    });
    modal.addEventListener('click', (evento) => {
      if (evento.target.closest('[data-cerrar-modal]')) {
        cerrarModalProducto();
      } else if (evento.target === modal && inicioSobreOverlay) {
        cerrarModalProducto();
      }
      inicioSobreOverlay = false;
    });
    /* El teclado se escucha a nivel de documento, no del overlay. Atado al
       overlay solo intercepta el Tab si el foco ya está adentro; si el foco
       escapó (click en el fondo, lector de pantalla, virtual cursor), el
       usuario sigue tabulando por la página que queda detrás del diálogo. */
    document.addEventListener('keydown', manejarTecladoModal);
  }
}

/* 6. Ficha técnica --------------------------------------------------------- */
function crearParrafoFicha(etiqueta, valor, clase) {
  const p = document.createElement('p');
  p.className = clase;
  const fuerte = document.createElement('strong');
  fuerte.textContent = `${etiqueta}: `;
  p.append(fuerte, document.createTextNode(String(valor)));
  return p;
}

function abrirDetalleProducto(producto, elementoInvocador) {
  const contenedor = document.getElementById('modalProductoDetalle');
  const modal = document.getElementById('modalProducto');
  const panel = modal?.querySelector('.modal-content');
  if (!contenedor || !modal || !producto) return;

  const detalles = producto.detalleModal || {};
  const nombre = producto.nombre || 'Producto';
  const urlCotizacion = enlaceWhatsapp(
    `¡Hola! Quisiera consultar precio y disponibilidad del producto/servicio: *${nombre}*.`
  );

  const titulo = document.createElement('h2');
  titulo.id = 'modalProductoTitulo';
  titulo.className = 'ficha-titulo';
  titulo.textContent = nombre;

  const badge = document.createElement('span');
  badge.className = 'producto-categoria ficha-badge';
  badge.textContent = producto.categoria || 'General';

  const cuerpo = document.createElement('div');
  cuerpo.className = 'ficha-texto';

  const separador = document.createElement('hr');
  separador.className = 'ficha-separador';

  const beneficio = detalles.beneficios || producto.detalleAdicional ||
    'Información detallada disponible vía WhatsApp.';
  cuerpo.append(crearParrafoFicha('Beneficios clave', beneficio, 'ficha-dato'));
  if (detalles.composicion) {
    cuerpo.append(crearParrafoFicha('Composición / Enfoque', detalles.composicion, 'ficha-dato ficha-dato--secundario'));
  }
  if (detalles.uso) {
    cuerpo.append(crearParrafoFicha('Modo de Uso / Aplicación', detalles.uso, 'ficha-dato ficha-dato--secundario'));
  }

  const cta = document.createElement('a');
  cta.className = 'btn-cotizar-general ficha-cta';
  cta.href = urlCotizacion;
  cta.target = '_blank';
  cta.rel = 'noopener noreferrer';
  cta.textContent = '📲 Consultar o Cotizar por WhatsApp';

  contenedor.textContent = '';
  contenedor.append(crearImagenProducto(producto, 'ficha-imagen'), badge, titulo);
  if (producto.presentacion) {
    contenedor.append(crearParrafoFicha('Presentación disponible', producto.presentacion, 'ficha-presentacion'));
  }
  contenedor.append(separador, cuerpo, cta);

  panel.setAttribute('aria-labelledby', titulo.id);
  abrirModal(modal, elementoInvocador);
}

const FOCO_UTIL = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

function abrirModal(modal, elementoInvocador) {
  /* iOS/Safari no enfoca un <button> al hacer clic: document.activeElement queda
     en <body> y devolverle el foco es un no-op silencioso, el teclado pierde el
     lugar en el catálogo. Por eso el elemento que invoca se pasa explícito.
     La captura previa se descarta si ya no está en el documento (un re-render
     del catálogo entre la apertura y el cierre lo habría desconectado). */
  referenciaPreviaModal =
    elementoInvocador && elementoInvocador.isConnected
      ? elementoInvocador
      : document.activeElement;
  modal.classList.add('active');
  modal.removeAttribute('aria-hidden');
  const cerrar = modal.querySelector('.modal-close');
  if (cerrar) cerrar.focus();
}

function cerrarModalProducto() {
  const modal = document.getElementById('modalProducto');
  if (!modal) return;
  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
  const panel = modal.querySelector('.modal-content');
  if (panel) panel.removeAttribute('aria-labelledby');
  /* Devolver el foco al botón que abrió la ficha: si no, el teclado cae al
     principio del documento y se pierde el lugar en el catálogo. */
  if (referenciaPreviaModal && typeof referenciaPreviaModal.focus === 'function') {
    /* Si la referencia se desconectó (búsqueda re-renderizada con la ficha
       abierta), el foco iría a un nodo huérfano y se perdería igual. */
    if (referenciaPreviaModal.isConnected) referenciaPreviaModal.focus();
  }
  referenciaPreviaModal = null;
}

function manejarTecladoModal(evento) {
  const modal = document.getElementById('modalProducto');
  if (!modal) return;
  /* Con el oyente en `document` hay que filtrar por estado: sin esto, Escape
     cerraría la ficha aunque no estuviera abierta. */
  if (!modal.classList.contains('active')) return;

  if (evento.key === 'Escape') {
    evento.preventDefault();
    cerrarModalProducto();
    return;
  }
  if (evento.key !== 'Tab') return;

  const focalizables = Array.from(modal.querySelectorAll(FOCO_UTIL)).filter(
    (nodo) => nodo.offsetParent !== null || nodo === document.activeElement
  );
  if (focalizables.length === 0) return;

  const primero = focalizables[0];
  const ultimo = focalizables[focalizables.length - 1];

  /* Rama de re-entrada: el foco está FUERA del diálogo. El cierre cíclico de
     abajo no aplica (activeElement no es ni primero ni ultimo), así que sin
     este caso el Tab se escapaba al documento y el diálogo dejaba de ser
     modal. Se devuelve el foco al primer control. */
  if (!modal.contains(document.activeElement)) {
    evento.preventDefault();
    primero.focus();
    return;
  }
  /* Sin este cierre, el teclado sigue recorriendo la página que está detrás
     del overlay, que sigue siendo alcanzable para lectoras de pantalla. */
  if (evento.shiftKey && document.activeElement === primero) {
    evento.preventDefault();
    ultimo.focus();
  } else if (!evento.shiftKey && document.activeElement === ultimo) {
    evento.preventDefault();
    primero.focus();
  }
}

/* 7. Filtros y búsqueda ---------------------------------------------------- */
function filtrarCategoria(cat, boton) {
  categoriaActual = cat;
  document.querySelectorAll('.btn-categoria[data-categoria]').forEach((chip) => {
    const activa = chip === boton;
    chip.classList.toggle('active', activa);
    chip.setAttribute('aria-pressed', String(activa));
  });
  aplicarFiltros();
}

function aplicarFiltros() {
  const busqueda = (document.getElementById('searchInput')?.value || '').toLowerCase();

  const filtrados = productosGlobales.filter((prod) => {
    const coincideCat = categoriaActual === 'Todas' || prod.categoria === categoriaActual;
    const textoBuscar =
      `${prod.nombre} ${prod.descripcionCorta || ''} ${prod.detalleAdicional || ''}`.toLowerCase();
    return coincideCat && textoBuscar.includes(busqueda);
  });

  mostrarProductos(filtrados);
}

/* 8. Carrusel de valor (solo móvil) ---------------------------------------
   Contenido que se mueve solo durante más de 5 s: necesita una forma de
   pausarlo (WCAG 2.2.2), respetar prefers-reduced-motion, y ser alcanzable
   con teclado. Los puntos indicators también tienen que reflejar la tarjeta
   real: hoy el primero queda activo para siempre. */
function iniciarCarruselValor() {
  const contenedor = document.querySelector('.valor-grid');
  if (!contenedor) return;

  const tarjetas = Array.from(contenedor.querySelectorAll('.valor-card'));
  if (tarjetas.length < 2) return;

  const puntos = document.querySelector('.dots-indicator');
  const botonPausa = document.getElementById('btnPausaCarrusel');
  const esMovil = window.matchMedia('(max-width: 768px)');
  const sinMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)');

  let indice = 0;
  let temporizador = null;
  let pausadoPorUsuario = false;
  let scrollPendiente = false;

  const conMovimiento = () => esMovil.matches && !sinMovimiento.matches;

  function actualizarPuntos() {
    if (!puntos) return;
    /* Los puntos son un indicador visual duplicado de lo que ya ve la persona.
       El contenedor lleva aria-hidden, así que aquí solo Reflecta la posición. */
    Array.from(puntos.querySelectorAll('.dot')).forEach((punto, i) => {
      punto.classList.toggle('active', i === indice);
    });
  }

  function pintarBotonPausa() {
    if (!botonPausa) return;
    /* Sin desplazamiento automático no hay nada que pausar: el botón sobra. */
    botonPausa.hidden = !conMovimiento();
    botonPausa.textContent = pausadoPorUsuario ? 'Reanudar' : 'Pausar';
    botonPausa.setAttribute('aria-pressed', String(pausadoPorUsuario));
  }

  function parar() {
    if (temporizador) {
      clearInterval(temporizador);
      temporizador = null;
    }
  }

  function avanzar() {
    /* Termina en la última tarjeta en lugar de reiniciar: el bucle infinito
       es lo que hace el carrusel agresivo. */
    if (indice >= tarjetas.length - 1) {
      parar();
      return;
    }
    indice += 1;
    contenedor.scrollTo({
      left: indice * contenedor.clientWidth,
      behavior: sinMovimiento.matches ? 'auto' : 'smooth',
    });
    actualizarPuntos();
  }

  function arrancar() {
    parar();
    if (!conMovimiento() || pausadoPorUsuario) return;
    temporizador = setInterval(avanzar, MS_INTERVALO_CARRUSEL);
  }

  /* El carrusel real es un scroller horizontal: sin tabindex no recibe foco y
     sus tarjetas son inalcanzables con teclado en móvil. */
  function sincronizarModo() {
    if (esMovil.matches) {
      contenedor.setAttribute('tabindex', '0');
      contenedor.setAttribute('role', 'group');
      contenedor.setAttribute('aria-label', 'Ventajas de CGS Del Ecuador');
    } else {
      contenedor.removeAttribute('tabindex');
      contenedor.removeAttribute('role');
      contenedor.removeAttribute('aria-label');
      indice = 0;
      contenedor.scrollTo({ left: 0, behavior: 'auto' });
    }
    actualizarPuntos();
    pintarBotonPausa();
    arrancar();
  }

  /* El scroll manual (swipe) también cambia la tarjeta: sin esto los puntos
     volverían a mentir. */
  contenedor.addEventListener('scroll', () => {
    if (scrollPendiente) return;
    scrollPendiente = true;
    requestAnimationFrame(() => {
      scrollPendiente = false;
      const paso = Math.max(contenedor.clientWidth, 1);
      const siguiente = Math.round(contenedor.scrollLeft / paso);
      if (siguiente !== indice && siguiente >= 0 && siguiente < tarjetas.length) {
        indice = siguiente;
        actualizarPuntos();
      }
    });
  }, { passive: true });

  const pausarPorInteraccion = () => parar();
  contenedor.addEventListener('touchstart', pausarPorInteraccion, { passive: true });
  contenedor.addEventListener('pointerdown', pausarPorInteraccion, { passive: true });
  contenedor.addEventListener('focusin', pausarPorInteraccion);
  contenedor.addEventListener('mouseenter', pausarPorInteraccion);

  if (botonPausa) {
    botonPausa.addEventListener('click', () => {
      pausadoPorUsuario = !pausadoPorUsuario;
      pintarBotonPausa();
      arrancar();
    });
  }

  /* No gastar ciclos ni desplazar contenido con la pestaña en segundo plano. */
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) parar();
    else arrancar();
  });
  /* Liberar el temporizador al abandonar la página. */
  window.addEventListener('pagehide', parar);

  const alCambiarMovil = () => sincronizarModo();
  const alCambiarMovimiento = () => sincronizarModo();
  if (typeof esMovil.addEventListener === 'function') {
    esMovil.addEventListener('change', alCambiarMovil);
    sinMovimiento.addEventListener('change', alCambiarMovimiento);
  }

  sincronizarModo();
}
