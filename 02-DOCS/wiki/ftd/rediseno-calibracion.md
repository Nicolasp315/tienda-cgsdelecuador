---
author: Nicolás P
branch: feat/rediseno-calibracion
status: in-progress
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
- [ ] **Fuentes auto-hospedadas.** `public/fonts/` con woff2 + `@font-face` + `preload`.
      Prueba: cada archivo responde 200 servido por HTTP y la página no pide `fonts.gstatic.com`.
- [ ] **Tokens de la placa.** `:root` con `placa`, `grabado`, `alarma`, `boquilla-*`, y los alias
      viejos mientras dure la migración. Prueba: detector sin `low-contrast`.
- [ ] **Degradados eliminados.** Prueba: `grep -c linear-gradient public/styles.css` → 0.
- [ ] **Primer viewport del index.** Banda en `placa`, tick, cuadrante SVG con la aguja en rojo,
      trío de estados, dos acciones. Prueba: render a 390×844 y ~1440 px.
- [ ] **Interacción firma.** Los 4 pasos con la aguja barriendo. Prueba: con
      `prefers-reduced-motion: reduce` la aguja salta a la posición final, sin animación.
- [ ] **Componentes compartidos.** Botón grabado, tick/ruler, redline, chip ISO con etiqueta de
      texto. Prueba: el chip comunica sin depender del color (WCAG 1.4.1).
- [ ] **Catálogo y ficha reestilados.** Prueba: `git diff --stat public/script.js` vacío.
- [ ] **Servicios y bioestimulantes.** Prueba: render de las dos páginas.
- [ ] **AA en las 4 páginas.** Contraste ≥4.5:1 texto y ≥3:1 componentes, targets ≥44×44, foco
      visible, landmarks, `aria-current`. Prueba: detector sin `low-contrast` en ninguna.
- [ ] **Invariantes intactos.** 0 apariciones del claim de certificación; `certificad*` solo dentro
      de "courier certificada" (2 veces en `index.html`); los 5 pares del `FAQPage` idénticos byte a
      byte; los 2 JSON-LD parsean; `productos.json` sin cambios.

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

## Next

Descargar los 6 woff2 (`latin` + `latin-ext` × Big Shoulders / Martian Mono / Archivo) a
`public/fonts/` y escribir los `@font-face`.
