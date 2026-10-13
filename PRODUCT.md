# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Agricultores, floricultores y productores agropecuarios de todo el Ecuador, desde pequeños huertos hasta cultivos extensivos y de exportación.

Se llegan al sitio con un problema concreto ya visible en el campo: suelos degradados, rendimiento por debajo de lo esperado, o cultivos bajo estrés. No están buscando un producto genérico; necesitan resolver un síntoma.

Flujo real de compra: llegan por búsqueda (es una de las señales de SEO más fuertes del sitio: "abono orgánico en Ecuador", "análisis de suelo", "visita técnica agronómica"), revisan el catálogo, y cierran la conversación con un ingeniero por WhatsApp. La decisión la toma una persona técnica, no un consumidor de retail.

## Product Purpose

CGS Del Ecuador es una empresa ecuatoriana productora de abonos orgánicos bioestimulantes, nutrientes vegetales líquidos y acondicionadores de suelo, con sede en Balzar (Guayas). Vende a productores de todo el país y combina el producto con asesoría técnica de campo: la fórmula se recomienda según cultivo y etapa fenológica, no por catálogo.

El sitio existe para convertir esa demanda en conversaciones de WhatsApp bien calificadas. El éxito de la web es la cita y el pedido bien justificado; el éxito del negocio es que el litro aplicado rinda.

## Positioning

La combinación de tres cosas que un revendedor no puede copiar:

1. **Formulación propia.** CGS produce; el sitio lo dice explícitamente ("compra sin intermediarios"), y eso es un argumento central frente a la competencia que vende marcas de terceros.
2. **Respaldo de ingenieros graduados de la Escuela Agrícola Panamericana El Zamorano.** Es el activo de marca más fuerte y el que más se repite en el copy. "Ingenieros Zamoranos" es el lenguaje propio de la empresa.
3. **Diagnóstico antes que dosis.** Análisis de suelo y visita técnica en campo como servicios de primer nivel, no como agregado. La tesis es que la dosis se calcula con datos del terreno, lo que además evita aplicaciones innecesarias y justifica el precio.

Entrega a domicilio a todas las provincias por courier certificada, en envases de 20 L.

## Operating Context

- **WhatsApp es el único canal transaccional:** +593 96 351 8696. Cotización, pedido, agendar visita técnica y solicitar análisis de suelo pasan por ahí. No hay carrito, ni pago en línea, ni cuentas de usuario.
- **El precio se publica por envase de 20 L.** Hay un campo `precio` fijo por producto, cargado a mano en `public/productos.json` (ver "Cómo cargar un precio"). Sin precio cargado, la ficha no muestra ningún bloque y todo sigue pasando por WhatsApp. La **dosis** sigue calculándose con cultivo y etapa fenológica, y eso no lo resuelve un precio en la tarjeta.
- **El IVA no se menciona en el sitio.** Decisión del usuario (2026-10-11): estos productos no generan IVA, así que el precio publicado es el precio final. No lleva "+ IVA", ni "IVA incluido", ni nota al pie, ni `priceSpecification` fiscal. No lo agregues: no hay nada que aclarar y la mención instala una duda donde no la hay.
- **El precio no se inventa.** Lo carga el usuario con los valores reales de su lista de precios. Sin el dato, `precio` queda en `null` y no se publica nada.
- **La conversación es con un ingeniero, no con un bot.** Quien cotiza recomienda; quien compra puede pedir justificación técnica.
- **Envíos por courier certificada** hasta la finca, invernadero o distribuidora del cliente.
- **Atención:** lunes a viernes 7:30–17:00, sábado 8:00–13:00 (horario de Ecuador continental). Contacto: contacto@cgsdelecuador.com.
- **El sitio es la puerta de entrada, no el punto de venta.** Su trabajo es convencer y calificar, no transaccionar.
- El sitio se consulta y se comparte por WhatsApp, y la mayor parte del tráfico llega desde buscador según las queries de SEO declaradas arriba.

### Cómo cargar un precio

**Son dos pasos.** El segundo es un comando; si te lo olvidás, la página muestra el precio pero Google sigue sin verlo (y Google penaliza un `offers` que la página no muestra, así que tampoco sirve marcarlo antes).

**1. Cargá el número en `public/productos.json`.** Cada entrada tiene el campo `precio`:

```json
    "presentacion": "20 L",
    "precio": 38.5,
```

- `null` o vacío → la ficha **no** muestra ningún bloque de precio, ni un hueco ni un "$0". Es el estado actual de las 9 entradas.
- Un número (`38.5`) o un texto (`"38,50"`) → la tarjeta muestra `$38,50` junto a la presentación, y la ficha el mismo valor.
- Se acepta coma o punto como separador decimal, **sin** separador de miles. `0` o un valor no numérico se ignoran igual que vacío.

**2. Corré el generador**, desde la raíz del repo:

```bash
python scripts/actualizar-itemlist.py
```

Escribe el campo `offers` de cada producto en el bloque `ItemList` de `public/productos.html`. Es idempotente: sin precios nuevos no toca nada. `--check` no escribe y sale con código 1 si hay cambios pendientes. El script **solo** administra `offers` — los nombres, descripciones, imágenes, marcas y categorías de ese bloque están escritos a mano y el script aborta si detecta que tocó algo más.

```bash
python scripts/actualizar-itemlist.py --check   # ¿está al día? (código 1 = no)
```

Así el precio que Google lee sale del mismo campo que el precio que ve el visitante: no pueden desincronizarse. Verificado sirviendo por HTTP que, con 3 precios cargados, el `offers` del JSON-LD coincide con el número pintado en las 7 tarjetas.

**Lo que el `offers` NO declara, a propósito** (haría falta inventar un dato): `priceValidUntil` (necesita una fecha de vigencia que el negocio no definió), `availability` (afirmaría stock, y no hay sistema de stock), `url`, `itemCondition` y `sku` (no hay página de producto ni SKU comercial). Google no los exige para un Product snippet; solo los recomienda.

## Capabilities and Constraints

**Capacidades confirmadas**

- Cuatro páginas: Inicio, Productos (catálogo), Servicios, y una guía educativa larga sobre abono orgánico bioestimulante y nutrición vegetal.
- Catálogo de 7 líneas de producto y 2 servicios (9 entradas en total), alimentado desde `public/productos.json` y renderizado por `public/script.js` (filtro por categoría + búsqueda + modal de detalle técnico).
- Datos técnicos reales por producto: beneficios, composición (con concentraciones en g/l), modo de uso y dosis, y presentación.
- Dos servicios agendables: Visita Técnica Zamorana y Análisis de Suelo.
- SEO técnico completo: datos estructurados `FAQPage` y `AgriculturalBusiness`, canonical, Open Graph, Twitter Cards, `sitemap.xml`, `robots.txt`, `llms.txt`, y Google Analytics 4 (G-TWZJ9JYKYK).
- WhatsApp flotante persistente en todas las páginas.

**Restricciones técnicas (derivadas del repo, no negociables sin decidir)**

- Sitio estático: HTML, CSS y JS planos, sin framework ni build step. Se despliega en Vercel con `vercel.json` sirviendo `public/**` como contenido estático.
- **Idioma único: español.** Todo el copy está en español y el SEO está escrito para búsquedas en Ecuador.
- El número de WhatsApp está duplicado: constante `TELEFONO_WHATSAPP` en `script.js` y también escrito a mano en el HTML de cada página. Cualquier cambio de número toca varios archivos.
- Los datos de producto viven en un solo archivo (`productos.json`); las categorías son `Cultivos` (7) y `Servicios` (2). **Resuelto 2026-10-11:** los chips "Hogar" y "Potreros" —que no existían en el JSON y devolvían cero resultados siempre— se quitaron de `productos.html`. Quedan Todas / Cultivos / Servicios y cada chip devuelve al menos una entrada.
- **Resuelto 2026-10-11:** el buscador de `script.js` indexa `nombre`, `categoria`, `descripcionCorta`, `presentacion`, `detalleAdicional` y el `detalleModal` completo (`beneficios`, `composicion`, `uso`), y normaliza acentos (NFD). "NPK", "20 l", "flores", "soja" y "acidos humicos" devuelven resultados. Antes indexaba solo nombre + descripción corta y era sensible a acentos.
- **Resuelto 2026-10-01 — la presentación es de 20 L, y solo de 20 L.** El usuario decidió que no existe formato de 200 L. Se normalizó `presentacion` a "20 L" en los 7 productos de `Cultivos`, se quitó la mención "y 200 L" del `uso` de PotreroCorplus y FungiCorPlus (las únicas 2 entradas que la tenían, de 9), y se alineó el copy público de `index.html`. **No vuelvas a introducir "200 L" en ningún lado** sin que el usuario lo confirme: ya se eliminó dos veces y no hay dato que lo respalde.
- No hay imágenes optimizadas: el JPG más pesado (`producto-calciiborcorplus.jpg`) ronda los 275 KB, no hay `srcset` ni `loading="lazy"`, y varias tarjetas usan la misma imagen de producto genérica.
- No hay analítica de comportamiento más allá de GA4, ni registro de leads, ni forma de medir si un WhatsApp se convirtió en pedido.

**Hechos por registrar, no por asumir**

- **El claim "Certificado" está prohibido (decisión del usuario, 2026-09-26).** Ningún trabajo futuro debe reintroducir "certificado" ni una palabra que lo sugiera, ni un número de certificado, un estándar (BIO, OCP, SNAP, Registro-Agroecuario) ni un gráfico de sello: no hay nada detrás. **Resuelto 2026-09-26:** las 7 apariciones en `index.html` se borraron y en su lugar va una afirmación verificable (formulación propia, producida en Balzar, Guayas, con ingenieros graduados de El Zamorano). Verificado 2026-10-11 en las 4 páginas: solo quedan 2 ocurrencias de la raíz `certificad`, y ambas están dentro de la frase `"courier certificada"`.
- **"Courier certificada" sí se conserva.** Aparece 2 veces en `index.html` (el `FAQPage` y el `<p>` visible del FAQ de entregas, que son el mismo texto sincronizado byte a byte), aplicada al servicio de transporte, que sí es un hecho. No confundir con el claim de producto ni eliminarlo.
- El número de WhatsApp es **+593 96 351 8696** (`593963518696` en `script.js:1`) y es consistente en `script.js:1`, los dos bloques JSON-LD y los seis `wa.me` hrefs. No hay drift hoy, pero está escrito a mano en los cuatro HTML.
- `AGENTS.md` menciona una página **"Nosotros"** planificada: no está construida y ninguna página del sitio la enlaza ni la promete.
- `AGENTS.md` también describe un snapshot de critique del 2026-09-26 con una cola de trabajo P0/P1 abierta. Es hoja de ruta de trabajo, no producto: no la conviertas en una fuente de restricciones nuevas.

## Brand Commitments

- **Nombre:** "CGS Del Ecuador" (en el header, "CGS DEL ECUADOR"). Dominio: cgsdelecuador.com.
- **Logo y favicon:** `public/img/logo.jpg` — el mismo archivo sirve de favicon y de apple-touch-icon.
- **Identidad verbal:** "Ingenieros Zamoranos" / "asesoría Zamorana" es lenguaje propio y no debe sustituirse por un genérico como "expertos agrónomos".
- **Familia de nombres de producto:** la línea usa el sufijo "CorPlus" (Bioscorplus, Humicorplus, Algascorplus, CalcioCorplus, PotreroCorplus, CalciBorCorPlus, FungiCorPlus). Nombres y fichas técnicas son estables y no se cambian por capricho.
- **Registro de voz:** español técnico y directo, con tuteo ("tu cultivo", "tu finca"). Se dirige a un interlocutor que entiende de agricultura; no simplifica la terminología agronómica ni la infantiliza. Las unidades técnicas (g/l, l/ha, N-P-K, pH) se muestran tal cual.
- **Locator:** Balzar, Guayas, Ecuador. Cobertura declarada a todo el país.

## Evidence on Hand

Contenido real y existente, con rutas:

- Fotografía real de producto y de servicios: **11 fotos** en `public/img/` (`producto-abono.jpg`, `producto-acondicionadores.jpg`, `producto-bioscorplus.jpg`, `producto-humicorplus.jpg`, `producto-algascorplus.jpg`, `producto-calciocorplus.jpg`, `producto-poterocorplus.jpg`, `producto-calciiborcorplus.jpg`, `producto-fungicorplus.jpg`, `producto-visita-tecnica.jpg`, `servicio-analisis-suelo.jpg`), más `logo.jpg` y `placeholder.svg`.
- Fichas técnicas reales con concentraciones y dosis en `public/productos.json`.
- Copy real en español en `index.html`, `productos.html`, `servicios.html` y `bioestimulantes.html`.
- Guía educativa existente sobre el abono orgánico bioestimulante (`bioestimulantes.html`), que es el activo de contenido más largo del sitio.
- Analítica real: GA4 `G-TWZJ9JYKYK`.

**Ausencias que el trabajo futuro no debe fabricar:**

- No hay testimonios, clientes nombrados, casos de éxito ni cifras de resultado.
- No hay documentación de certificación (ver "Capacidades and Constraints").
- No hay precios publicados, ni tarifas de los servicios, ni una lista de presentaciones por producto confiable (ver el conflicto de presentación arriba).
- No hay fotografías del equipo, de las visitas técnicas en campo, ni de la planta en Balzar.
- No hay logos de terceros, sellos, premios ni aval de ninguna institución.
- No hay registro de cuántos pedidos o visitas se generan; cualquier cifra de escala o volumen sería inventada.

## Product Principles

1. **La conversación empieza por el síntoma y termina en la recomendación, no en la ficha.** El copy arranca en "suelos degradados, bajo rendimiento, estrés"; la dosis se calcula con cultivo y etapa fenológica, por eso la asesoría precede a la venta y por eso no hay precios públicos.
2. **Producir da una ventaja que el sitio debe hacer explícita.** "Sin intermediarios" es un argumento central y verificable, no una frase decorativa.
3. **WhatsApp es la terminación de cada intención.** Toda acción pedida —cotizar, agendar visita, solicitar análisis— se resuelve en WhatsApp, con el mensaje ya contextualizado al producto o servicio que la persona estaba viendo.
4. **Cero contenido inventado.** El sitio tiene fotografía y datos reales, y el comprador técnico detecta lo inventado al instante. Antes de agregar texto, se necesita el dato.
5. **Se optimiza para la conversión, no para el tráfico.** El sitio existe para producir citas calificadas con un ingeniero. Añadir páginas o secciones que no terminen en una acción concreta resta más de lo que suma.

## Accessibility & Inclusion

**Estándar: WCAG 2.2 AA, requisito vigente** (decisión del usuario, confirmada en la sesión de init). Todo trabajo de UI se audita contra AA, no como referencia: contraste de texto y de componentes no textuales, objetivos táctiles, foco visible y gestionable, landmarks, y respeto a `prefers-reduced-motion`. Los hallazgos se corrigen en el mismo cambio que los introduce.

Nota de provenance: una versión anterior de este registro atribuía el uso en campo (Android de gama media, datos móviles) a evidencia del repo. El usuario confirmó el 2026-09-26 que **es una suposición, no un dato**. No se registra como hecho ni se usa como justificación de decisiones responsive sin confirmarlo antes.
