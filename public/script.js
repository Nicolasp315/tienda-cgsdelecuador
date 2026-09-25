const TELEFONO_WHATSAPP = '593963518696';
let productosGlobales = [];
let categoriaActual = 'Todas';

// 1. WhatsApp General
function abrirWhatsappGeneral() {
  const mensaje = `¡Hola! Quisiera más información sobre la asesoría técnica para mi cultivo.`;
  window.open(`https://wa.me/${TELEFONO_WHATSAPP}?text=${encodeURIComponent(mensaje)}`, '_blank');
}

// 2. Inicialización al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('productosGrid')) {
    cargarProductos();
  }
  iniciarCarruselValor();
});

// 3. Obtener productos del JSON
async function cargarProductos() {
  const grid = document.getElementById('productosGrid');
  try {
    const respuesta = await fetch('./productos.json');
    if (!respuesta.ok) throw new Error('Error al obtener datos');
    
    productosGlobales = await respuesta.json();
    mostrarProductos(productosGlobales);
  } catch (error) {
    console.warn('Error cargando los productos:', error);
    if (grid) {
      grid.innerHTML = `<p style="text-align:center; width:100%; color:#666;">No se pudieron cargar los productos automáticos. Por favor, consulta directamente por WhatsApp.</p>`;
    }
  }
}

// 4. Renderizado del Catálogo (Sin presentación en la tarjeta principal)
function mostrarProductos(lista) {
  const grid = document.getElementById('productosGrid');
  if (!grid) return;

  if (lista.length === 0) {
    grid.innerHTML = `<p style="text-align:center; width:100%; color:#666;">No se encontraron productos en esta categoría.</p>`;
    return;
  }

  let html = '';
  lista.forEach((producto, index) => {
    const categoriaBadge = producto.categoria || 'General';
    const descripcionCorta = producto.descripcionCorta || producto.detalleAdicional || 'Sin descripción disponible';

    html += `
      <div class="producto-card" data-id="${producto.id || index}">
        <img src="${producto.imagen}" 
             alt="${producto.nombre} - ${categoriaBadge} | CGS Del Ecuador" 
             class="producto-imagen" 
             onerror="this.src='img/placeholder.svg'">
        <div class="producto-info">
          <span class="producto-categoria">${categoriaBadge}</span>
          <h3 class="producto-nombre">${producto.nombre}</h3>
          <p class="producto-descripcion">${descripcionCorta}</p>
          
          <div class="producto-footer" style="justify-content: flex-end;">
            <button class="btn-agregar" onclick="verDetalleProducto(${index})" style="width: 100%;">
              Más información
            </button>
          </div>
        </div>
      </div>
    `;
  });

  grid.innerHTML = html;
}

// 5. Modal de Detalle con Información Enriquecida
function verDetalleProducto(index) {
  const prod = productosGlobales[index];
  if (!prod) return;

  const detalleContainer = document.getElementById('modalProductoDetalle');
  const modal = document.getElementById('modalProducto');

  const mensajeProducto = `¡Hola! Quisiera consultar precio y disponibilidad del producto/servicio: *${prod.nombre}*.`;
  const urlWaProducto = `https://wa.me/${TELEFONO_WHATSAPP}?text=${encodeURIComponent(mensajeProducto)}`;

  const detalles = prod.detalleModal || {};
  const beneficios = detalles.beneficios || prod.detalleAdicional || 'Información detallada disponible vía WhatsApp.';
  const composicion = detalles.composicion ? `<p style="margin: 8px 0; font-size: 0.9rem;"><strong>Composición / Enfoque:</strong> ${detalles.composicion}</p>` : '';
  const uso = detalles.uso ? `<p style="margin: 8px 0; font-size: 0.9rem;"><strong>Modo de Uso / Aplicación:</strong> ${detalles.uso}</p>` : '';
  const presentacionHTML = prod.presentacion ? `<p style="margin: 4px 0; font-size: 0.95rem;"><strong>Presentación disponible:</strong> ${prod.presentacion}</p>` : '';

  detalleContainer.innerHTML = `
    <img src="${prod.imagen}" alt="${prod.nombre}" style="width:100%; max-height:200px; object-fit:contain; margin-bottom:15px;" onerror="this.src='img/placeholder.svg'">
    <span class="producto-categoria" style="display:inline-block; margin-bottom: 8px;">${prod.categoria || 'General'}</span>
    <h2 style="margin: 5px 0 10px 0; color: #2e7d32; font-size: 1.4rem;">${prod.nombre}</h2>
    ${presentacionHTML}
    
    <hr style="margin: 12px 0; border: 0; border-top: 1px solid #eee;">
    
    <div style="color: #444; text-align: left; line-height: 1.5;">
      <p style="margin: 8px 0; font-size: 0.95rem;"><strong>Beneficios clave:</strong> ${beneficios}</p>
      ${composicion}
      ${uso}
    </div>
    
    <button onclick="window.open('${urlWaProducto}', '_blank')" class="btn-cotizar-general" style="width: 100%; margin-top: 18px; padding: 12px; font-size: 1rem;">
      📲 Consultar o Cotizar por WhatsApp
    </button>
  `;

  modal.classList.add('active');
}

function cerrarModalProducto() {
  const modal = document.getElementById('modalProducto');
  if (modal) modal.classList.remove('active');
}

function cerrarModalFuera(event) {
  if (event.target.id === 'modalProducto') {
    cerrarModalProducto();
  }
}

// 6. Filtros y Búsqueda
function filtrarCategoria(cat, boton) {
  categoriaActual = cat;
  document.querySelectorAll('.btn-categoria').forEach(b => b.classList.remove('active'));
  if (boton) boton.classList.add('active');
  aplicarFiltros();
}

function aplicarFiltros() {
  const busqueda = (document.getElementById('searchInput')?.value || '').toLowerCase();
  
  const filtrados = productosGlobales.filter(prod => {
    const coincideCat = (categoriaActual === 'Todas') || (prod.categoria === categoriaActual);
    const textoBuscar = `${prod.nombre} ${prod.descripcionCorta || ''} ${prod.detalleAdicional || ''}`.toLowerCase();
    const coincideBusqueda = textoBuscar.includes(busqueda);
    return coincideCat && coincideBusqueda;
  });

  mostrarProductos(filtrados);
}

// 7. Carrusel Automático (Para la sección de valores en móviles)
function iniciarCarruselValor() {
  const container = document.querySelector('.valor-grid');
  if (!container) return;

  let autoScrollTimer = null;
  const INTERVALO_MS = 3000;

  function siguienteTarjeta() {
    if (window.innerWidth > 768) return;

    const anchuraTarjeta = container.clientWidth;
    const maxScroll = container.scrollWidth - anchuraTarjeta;

    if (Math.ceil(container.scrollLeft) >= maxScroll - 5) {
      container.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      container.scrollBy({ left: anchuraTarjeta, behavior: 'smooth' });
    }
  }

  function iniciar() {
    parar();
    autoScrollTimer = setInterval(siguienteTarjeta, INTERVALO_MS);
  }

  function parar() {
    if (autoScrollTimer) clearInterval(autoScrollTimer);
  }

  iniciar();

  container.addEventListener('touchstart', parar, { passive: true });
  container.addEventListener('touchend', iniciar, { passive: true });
}