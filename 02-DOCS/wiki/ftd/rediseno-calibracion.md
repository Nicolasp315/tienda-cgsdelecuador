---
author: Nicolás P
branch: feat/rediseno-calibracion
status: done
---
# Rediseño visual "Calibración"

## Intent

Reemplazar el mundo visual por defecto del index (hero con degradado verde + tarjetas apiladas +
FAQ) por la **"Calibración"**: el index se recorre como una calibración numerada de aspersor
(1 medir suelo → 2 fijar dosis → 3 aplicar → 4 evaluar). Vale la pena porque la tesis de la
empresa es que la dosis sale de un dato medido, y el sitio hoy dice lo contrario: se ve igual que
cualquier landing agro.

Plan de origen: `C:\Users\nicol\.opencode\plan\rediseno-calibracion.md`.
Contrato de dirección completo ahí; no se duplica acá.

## Scope

**Dentro:** `public/index.html`, `public/productos.html`, `public/servicios.html`,
`public/bioestimulantes.html`, `public/styles.css`, `public/fonts/` (nuevo).

**Fuera, decidido por el usuario:**

- Arreglos de la cola abierta #3 (WhatsApp sin contexto), #10 (estado error/vacío sin CSS),
  #11 (nav de `bioestimulantes.html`). Solo visual.
- Fotos: sin `srcset`, sin optimización, sin reemplazo. Solo CSS/SVG.
- Unificación de los 4 bloques `<style>` inline.
- `public/script.js`: **no se toca**. El catálogo y la ficha se reestilan por clase CSS.
  Motivo: ahí viven seis arreglos P0/P2 ya verificados (modal correcto, scroll móvil, guard de
  `mousedown`, `aria-label` único, devolución de foco, focus trap).
- `public/productos.json` y los precios cargados a mano.

## Checklist

Cada línea con lo que probaría que está hecha.

- [x] **Rama creada.** Prueba: `git branch --show-current` → `feat/rediseno-calibracion`.
- [x] **Línea base del detector registrada.** Prueba: conteos por archivo antes de tocar nada.
- [x] **Fuentes auto-hospedadas.** `public/fonts/` con 6 woff2 + `@font-face` + `preload`.
      Prueba: los 3 subsets `latin` responden 200 servido por HTTP; ninguna petición sale a
      `fonts.gstatic.com`.
- [x] **Tokens de la placa.** `:root` con `placa`, `grabado`, `alarma`, `boquilla-*`, y los alias
      viejos mientras dure la migración. Prueba: detector sin `low-contrast` en ninguna página.
- [x] **Degradados eliminados.** Prueba: `grep -c linear-gradient public/styles.css` → 0.
- [x] **Primer viewport del index.** Banda en `placa`, tick, cuadrante SVG con la aguja en rojo,
      trío de estados, dos acciones. Prueba: render medido a 390×844 (sin overflow, CTA a 686 px).
- [x] **Interacción firma.** Los 4 pasos con el marcador barriendo. Prueba: con
      `prefers-reduced-motion: reduce` y sin `animation-timeline` el marcador queda en la posición
      final, sin animación (la regla vive dentro de `@supports` + `no-preference`).
- [x] **Componentes compartidos.** Botón grabado, tick, chip ISO con etiqueta de texto.
      Prueba: el chip comunica sin depender del color (WCAG 1.4.1) — cada boquilla lleva su código
      `01`–`04` y su nombre.
- [x] **Catálogo y ficha reestilados.** Prueba: `git diff --stat public/script.js` → vacío.
- [x] **Servicios y bioestimulantes.** Prueba: render de las dos páginas, con sus bloques `<style>`
      alineados al vocabulario de la placa.
- [x] **AA en las 4 páginas.** Contraste ≥4.5:1 texto y ≥3:1 componentes, targets ≥44×44, foco
      visible, landmarks, `aria-current`. Prueba: detector sin `low-contrast` en ninguna.
- [x] **Invariantes intactos.** 0 apariciones del claim de certificación; `certificad*` = 2 y ambas
      dentro de "courier certificada"; `productos.json` sin cambios.

## Evidence

**Rama y baseline (Fase 0).** `git branch --show-current` → `feat/rediseno-calibracion`.

Detector, contado del array JSON (el wrapper `.cmd` no propaga el exit code de forma fiable):

| Archivo | Hallazgos |
|---|---|
| `public/index.html` | 9 — 8 `side-tab`, 1 `cramped-padding` |
| `public/productos.html` | 3 — `side-tab` |
| `public/servicios.html` | 0 |
| `public/bioestimulantes.html` | 11 — 6 `border-accent-on-rounded`, 5 `side-tab` |
| `public/styles.css` | 3 — 2 `side-tab`, 1 `border-accent-on-rounded` |

Los totales (18 `side-tab`, 7 `border-accent-on-rounded`) coinciden con lo que declara
`AGENTS.md`, así que la línea base es confiable.

**Viabilidad de fuentes.** `fonts.googleapis.com/css2?family=Big+Shoulders+Display` responde 200
con un User-Agent de Chrome y sirve **woff2 variable** (`font-weight: 400 800`) partido en
subsets. Solo hacen falta `latin` (U+0000-00FF…) y `latin-ext` (cubre los diacríticos del
español). Se descarta el subset `vietnamese`.

### Cierre (verificado hoy)

**Detector, después.** 1 hallazgo en total, y es el que `AGENTS.md` deja fuera de alcance:

| Archivo | Antes | Después | Qué queda |
|---|---|---|---|
| `public/index.html` | 9 | **1** | `cramped-padding` en `productos-section` (fuera de alcance) |
| `public/productos.html` | 3 | **0** | — |
| `public/servicios.html` | 0 | **0** | — |
| `public/bioestimulantes.html` | 11 | **0** | — |
| `public/styles.css` | 3 | **0** | — |

Los `undersized-ui-text` que el rediseño introdujo (22 en el index) se corrigieron subiendo el
piso tipográfico de los rótulos a `0.75rem`/`0.8rem`; el piso del detector es 11 px. Los
`numbered-section-labels` (los `01/02/03` junto a los títulos de valor) se eliminaron. Los
`all-caps-body` se resolvieron sacando `text-transform: uppercase` de todo texto que puede
llegar a ser una frase larga (títulos, CTAs, respuestas de FAQ) y conservándolo solo en rótulos
cortos.

**Los dos `low-contrast` que quedaban eran reales, no falsos positivos:**
`#E4E9E5` (`.seccion-titulo__bajada`) sobre blanco en `@media print`, porque el navegador no
imprime fondos y el texto claro se quedaba sin su placa; y el mismo caso en `.hero-title`,
`.hero-cuerpo`, `.placa-serial`, `.boquilla` y `.seccion-titulo__titulo`. Los botones oscuros
(`.btn-cotizar-general`, `.btn-agregar`) dependían del fondo para su contraste. Todo eso se
cubre ahora con un bloque de impresión explícito.

**Medición real a 390×844** (iframe servido por HTTP, no `file://`):

| Página | Overflow | Texto < 11 px | Contraste < 4.5 | Otras medidas |
|---|---|---|---|---|
| `index.html` | no | 0 | 0 | CTA del hero a 686 px; pasos en 1 columna; 4 fichas del carrusel |
| `productos.html` | no | 0 | 0 | 9 tarjetas; precio `$255,00 por 20 L` en Martian Mono |
| `servicios.html` | no | 0 | 0 | sin overflow |
| `bioestimulantes.html` | no | 0 | 0 | retícula de beneficios con `gap: 1px` |

Único objetivo táctil bajo 44 px que era un control: el `<input>` del buscador (38 px), corregido
con `min-height: 44px`. El resto de los enlaces bajos son `display: inline` dentro de un párrafo,
cubiertos por la excepción 2.5.8 de WCAG 2.2 AA.

**Invariantes** (script `verificar_invariantes.py`, no queda en el repo): los 2 bloques JSON-LD
de `index.html` y los 2 de `productos.html` parsean; los 5 pares del `FAQPage` coinciden con los
`<h3>`/`<p>` visibles comparando el texto sin etiquetas (lo visible lleva `<strong>` y `<a>`, el
JSON-LD va en texto plano); `certificad*` aparece 2 veces en los 4 HTML y ambas dentro de
"courier certificada". `public/script.js` sin cambios (`git diff` vacío). `productos.json` sin
cambios.

**Emoji.** La dirección los rechaza. Se quitaron de los 4 HTML (incluidos los que el script de
pares sustitutos no alcanzaba: `✉️` U+2709 + U+FE0F y `⚙️` U+2699 + U+FE0F, que son BMP). Se
conserva `✕` (U+2715) del botón de cerrar la ficha: es un glifo de interfaz con `aria-label`,
no decoración.

**Bloques `<style>` en línea.** `AGENTS.md` deja fuera de alcance *unificarlos* (moverlos a
`styles.css`), y eso se respetó: siguen en cada HTML. Pero dos de ellos contradecían la dirección
y no se podían dejar:
`servicios.html` definía `border-radius: 12px` + `box-shadow` + `#2e7d32` (el verde viejo) →
pasó a borde hairline, sin radio ni sombra, y el nombre del servicio en `--grabado`;
`bioestimulantes.html` pisaba `.beneficios-grid` con `gap: 25px`, que borraba por completo el
grabado de 1 px → el override se eliminó y la retícula global vuelve a aplicar.
También se sacó la regla `.header` duplicada de los 4 HTML: ahora los cuatro leen la misma del
`styles.css` (fondo `#3F4A44`, borde 1 px negro). No es unificación — cada bloque conserva lo
suyo — es dejar de contradecir la hoja global.

## Next

Aprobación del usuario, y después commit en `feat/rediseno-calibracion` (nunca a `main`).
Antes de `git add`, mirar `git status`: en la raíz hay estado local de herramientas ajenas
(`.opencode/`, `01-TOOLS/`, `02-DOCS/`, `.impeccable/`, `.rsc.json`, `schema.json`) que no debe
entrar en el commit. Lo que sí entra: los 5 archivos modificados y `public/fonts/` (6 woff2,
~172 KB).

Queda abierto, por decisión previa y fuera de alcance: la cola #3 (WhatsApp sin contexto),
#10 (estado de error/vacío sin CSS) y #11 (nav de `bioestimulantes.html`), más el
`cramped-padding` de `productos-section`.
