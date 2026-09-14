const TELEFONO_WHATSAPP = '593998232445';
let productosGlobales = [];
let categoriaActual = 'Todas';

// 1. WhatsApp General
function abrirWhatsappGeneral() {
  const mensaje = `¡Hola! Quisiera más información sobre la asesoría técnica para mi cultivo.`;
  window.open(`https://wa.me/${TELEFONO_WHATSAPP}?text=${encodeURIComponent(mensaje)}`, '_blank');
}

// 2. Obtener productos de la API/Backend
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('productosGrid')) {
    cargarProductos();
  }
});

async function cargarProductos() {
  const grid = document.getElementById('productosGrid');
  try {
    const respuesta = await fetch('./productos.json');
    if (!respuesta.ok) throw new Error('Error al obtener datos');
    
    productosGlobales = await respuesta.json();
    mostrarProductos(productosGlobales);
  } catch (error) {
    console.warn('Cargando vista local o error de red:', error);
    if (grid) {
      grid.innerHTML = `<p style="text-align:center; width:100%; color:#666;">No se pudieron cargar los productos automáticos. Por favor, consulta directamente por WhatsApp.</p>`;
    }
  }
}

// 3. Renderizado de Catálogo sin precio visible
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
    html += `
      <div class="producto-card" data-id="${producto.rowId || index}">
        <img src="${producto.imagen}" 
     alt="${producto.nombre} - ${producto.categoria} | CGS Del Ecuador" 
     class="producto-imagen" 
     onerror="this.src='https://via.placeholder.com/300x220?text=Sin+Imagen'">
        <div class="producto-info">
          <span class="producto-categoria">${categoriaBadge}</span>
          <h3 class="producto-nombre">${producto.nombre}</h3>
          <p class="producto-descripcion">${producto.detalleAdicional || 'Sin detalles adicionales'}</p>
          
          <div class="producto-footer">
            <div>
              ${producto.presentacion ? `<span class="producto-unidad">Presentación: ${producto.presentacion}</span>` : ''}
            </div>
            <button class="btn-agregar" onclick='verDetalleProducto(${productosGlobales.indexOf(producto)})'>
              Más información
            </button>
          </div>
        </div>
      </div>
    `;
  });

  grid.innerHTML = html;
}

// 4. Modal de Producto
function verDetalleProducto(index) {
  const prod = productosGlobales[index];
  if (!prod) return;

  const detalleContainer = document.getElementById('modalProductoDetalle');
  const modal = document.getElementById('modalProducto');

  const mensajeProducto = `¡Hola! Quisiera consultar precio y envío del producto *${prod.nombre}*.`;
  const urlWaProducto = `https://wa.me/${TELEFONO_WHATSAPP}?text=${encodeURIComponent(mensajeProducto)}`;

  detalleContainer.innerHTML = `
    <img src="${prod.imagen}" alt="${prod.nombre}" style="width:100%; max-height:200px; object-fit:contain; margin-bottom:15px;" onerror="this.src='https://via.placeholder.com/300x220?text=Sin+Imagen'">
    <span class="producto-categoria" style="display:inline-block; margin-bottom: 8px;">${prod.categoria || 'General'}</span>
    <h2 style="margin: 5px 0 10px 0; color: #2e7d32; font-size: 1.4rem;">${prod.nombre}</h2>
    <p style="margin: 4px 0;"><strong>Presentación:</strong> ${prod.presentacion || 'N/A'}</p>
    <hr style="margin: 12px 0; border: 0; border-top: 1px solid #eee;">
    <p style="color: #444; line-height: 1.4; font-size: 0.95rem;">${prod.detalleAdicional || 'Sin detalles adicionales registrados.'}</p>
    
    <button onclick="window.open('${urlWaProducto}', '_blank')" class="btn-cotizar-general" style="width: 100%; margin-top: 18px; padding: 12px; font-size: 1rem;">
      📲 Consultar precio y disponibilidad por WhatsApp
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

// 5. Filtros
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
    const coincideBusqueda = (prod.nombre || '').toLowerCase().includes(busqueda) || 
                             (prod.detalleAdicional || '').toLowerCase().includes(busqueda);
    return coincideCat && coincideBusqueda;
  });

  mostrarProductos(filtrados);
}

const path = require('path');
const express = require('express');
const app = express();

// -------------------------------------------------------------
// CARRUSEL AUTOMÁTICO (Agrega esta función al final de todo)
// -------------------------------------------------------------
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

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', iniciarCarruselValor);
} else {
  iniciarCarruselValor();
}

// Servir la carpeta estática "public"
app.use(express.static(path.join(__dirname, 'public')));

