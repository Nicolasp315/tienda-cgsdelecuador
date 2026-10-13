# AGENTS.md

Instrucciones operativas para cualquier agente de IA que trabaje en este repositorio.

**El registro de producto vive en [`PRODUCT.md`](./PRODUCT.md).** No lo dupliques aquí. Si una regla de este archivo contradice a `PRODUCT.md`, `PRODUCT.md` manda; si necesitas cambiarlo, hazlo explícito y di por qué.

---

## Qué es esto

Sitio web de marketing para **CGS Del Ecuador**, productora ecuatoriana de abonos orgánicos bioestimulantes, nutrientes vegetales líquidos y acondicionadores de suelo (Balzar, Guayas). Dominio en producción: `cgsdelecuador.com`.

**El sitio no vende: convierte.** No hay carrito, ni pago en línea, ni cuentas de usuario. Desde el 2026-10-13 **sí hay precio público: fijo por envase de 20 L**, cargado a mano en `public/productos.json` y publicado también en los datos estructurados (política completa en `PRODUCT.md`). Lo que no hay es transacción: la única conversación que cierra es un WhatsApp con un ingeniero agrónomo. Todo lo que hagas debe terminar, o ayudar a terminar, en esa conversación.

## Stack

- HTML, CSS y JS planos. **Sin framework, sin build step, sin bundler.**
- `public/` es la raíz servida. `vercel.json` la publica como estático con `@vercel/static` y enruta `/(.*)` → `/public/$1`.
- No existe `package.json`. `node_modules/` solo contiene el CLI de Vercel de una corrida anterior; está en `.gitignore` y no es una dependencia del proyecto.
- Un solo archivo de estilos global (`public/styles.css`) más un bloque `<style>` inline por página.

### Correr en local

Hay que servirlo por HTTP. **`file://` no funciona**: `script.js` hace `fetch('./productos.json')` y el navegador lo bloquea por CORS, así que el catálogo queda vacío sin error visible.

```bash
# desde public/
python -m http.server 8400 --bind 127.0.0.1
# o
npx serve public
```

### Deploy

Push a `main` en `https://github.com/Nicolasp315/tienda-cgsdelecuador.git` → Vercel despliega. No hay build que correr ni variables de entorno. No hay link local de Vercel (`.vercel/` no existe).

## Mapa de archivos

| Ruta | Qué es | Tocar con cuidado |
|---|---|---|
| `public/index.html` | Home. Hero, valor-prop trío, tarjetas de soluciones, FAQ. Contiene `<title>`, meta, FAQPage y AgriculturalBusiness JSON-LD, GA4 | El bloque JSON-LD se renderiza en el SERP |
| `public/productos.html` | Catálogo. Chips de categoría, buscador, grilla, modal. El `ItemList` JSON-LD vive entre los marcadores `GENERADO:INICIO`/`GENERADO:FIN` | El bloque generado no se edita a mano: lo escribe `scripts/actualizar-itemlist.py` |
| `public/servicios.html` | Visita Técnica Zamorana + Análisis de Suelo | — |
| `public/bioestimulantes.html` | Guía educativa larga. El activo de contenido más extenso | — |
| `public/productos.json` | **Única fuente de datos de producto.** 7 productos (`Cultivos`) + 2 servicios = 9 entradas, cada una con un campo `precio` | Todo el catálogo se renderiza desde aquí. La presentación es **solo 20 L**, decidido por el usuario el 2026-10-01: `presentacion` dice "20 L" en los 7 y no existe formato de 200 L en ninguna parte. `precio` es el precio final por envase de 20 L y lo carga el usuario a mano; si es `null`, no se pinta ningún bloque de precio. El IVA no se menciona en ninguna página: estos productos no lo generan |
| `public/script.js` | Render del catálogo, filtros, búsqueda, modal, carrusel | 26 KB, sin framework. Un solo archivo, sin tests |
| `public/styles.css` | Tokens + todos los componentes | — |
| `public/img/` | 13 archivos: 11 fotos de contenido (JPEG, sin `srcset`, hasta 275 KB) + `logo.jpg` (96 KB, también favicon y OG image) + `placeholder.svg` | Sin conversor de imágenes disponible en el entorno |
| `public/sitemap.xml`, `robots.txt`, `llms.txt` | SEO | Actualizar junto a cualquier cambio de rutas |
| `scripts/actualizar-itemlist.py` | Genera los `offers` del `ItemList` de `productos.html` a partir de `precio` en `productos.json` | **Único writer** del campo `offers`. Solo reescribe el tramo entre los marcadores `GENERADO:INICIO` / `GENERADO:FIN`; si cambió cualquier otro campo del `ItemList`, aborta, porque ese copy es a mano y no vive en el JSON. Idempotente; `--check` no escribe y sale con código 1 |

## Reglas duras

Estas no son preferencias. Violarlas rompe el producto.

1. **No inventes contenido.** No hay testimonios, ni clientes nombrados, ni casos de éxito, ni cifras de resultado, ni fotos del equipo, ni logos de terceros. Los precios **sí** existen desde el 2026-10-13, pero los carga el usuario a mano en `productos.json`: no los inventes, no los calcules y no los cambies por tu cuenta. El comprador técnico detecta lo inventado al instante. Si una sección necesita un dato que no existe, **pregúntalo** en vez de rellenarlo.
2. **"Certificado" está prohibido y ya fue eliminado (2026-09-26).** Decisión del usuario: la prohibición es permanente. Las 7 apariciones del claim de producto se borraron de `index.html` — `<title>`, `meta description`, `meta keywords`, `FAQPage` `name` + `text`, `<h1>` del hero y el `<h3>` visible del FAQ. En su lugar va una afirmación verificable: **formulación propia, producida en Balzar (Guayas), con ingenieros graduados de la Escuela Agrícola Panamericana El Zamorano.**
   - No lo reintroduzcas bajo ninguna forma: ni copy, ni número de certificado, ni estándar (BIO, OCP, SNAP, Registro-Agroecuario), ni gráfico de sello. No hay nada detrás.
   - **Única excepción, y es intencional:** la frase `"courier certificada"` se refiere al servicio de transporte y **se conserva**. Aparece **2 veces** en `index.html` (`FAQPage` + el `<p>` visible del FAQ de entregas) porque ambos son el mismo texto tras la sincronización del 2026-10-01. **No esperes 1 sola coincidencia** — el invariante real es que `certificad*` solo aparezca dentro de la frase `"courier certificada"`, y jamás aplicado al producto. Que nadie lo "limpie" de paso.
   - **Las 5 parejas del `FAQPage` están sincronizadas byte a byte con los `<h3>` y `<p>` visibles** (verificado 2026-10-01: 5/5 en pregunta y respuesta). Si tocás una, tocá las dos y re-verificá.
3. **WhatsApp es el único canal y el mensaje va contextualizado.** `abrirWhatsappGeneral()` hoy no recibe argumento y manda una frase genérica desde 5 sitios distintos — eso es un bug conocido, no un patrón a replicar. Cuando toques esos call sites, pásale el contexto (servicio o producto) y pre-carga los dos datos que el ingeniero necesita: **cultivo** y **superficie/etapa**.
4. **El número es uno solo:** `+593 96 351 8696`, constante `TELEFONO_WHATSAPP` en `script.js:1`. Hoy está replicado a mano en los cuatro HTML (6+ lugares). No introduzcas un número nuevo sin actualizar todos.
5. **Copy en español, registro técnico, con tuteo** ("tu cultivo", "tu finca"). El interlocutor entiende de agricultura: no simplifiques la terminología agronómica ni la infantilices. Las unidades (g/l, l/ha, N-P-K, pH) se muestran tal cual.
6. **Nombres de producto son estables.** La familia usa el sufijo `CorPlus` (Bioscorplus, Humicorplus, Algascorplus, CalcioCorplus, PotreroCorplus, CalciBorCorPlus, FungiCorPlus). No se renombran.
7. **Las categorías son `Cultivos` y `Servicios`.** No inventes taxonomías para llenar una fila de chips.
8. **No rompas el SEO sin reemplazarlo.** Hay canonical, Open Graph, Twitter Cards, dos bloques JSON-LD, sitemap, `robots.txt` y `llms.txt`. Si cambias una pregunta de FAQ, actualiza **también** el JSON-LD, y hazlos idénticos carácter por carácter: Google exige que el contenido marcado sea visible en la página.
9. **WCAG 2.2 AA es requisito, no referencia.** Confirmado por el usuario. Todo cambio de UI se audita contra AA en el mismo cambio que lo introduce, no en una pasada posterior. Concretamente: contraste ≥4.5:1 en texto y ≥3:1 en componentes no textuales y focus visible, objetivos táctiles ≥44×44 CSS px, landmarks (`nav`, `main`) y `aria-current` en la página actual, foco visible y gestionable, y respeto a `prefers-reduced-motion`.
   - Estado actual (verificado por conteo, no de memoria): **cumplido en lo estructural.** `styles.css` tiene 1 regla `:focus-visible` con anillo y overrides `--focus` por superficie (header/hero/footer oscuros usan blanco), 2 declaraciones `outline`, y 1 bloque `prefers-reduced-motion`. Los 4 HTML tienen `<nav aria-label="Principal">`, `<main id="contenido">` y skip link; 3 de 4 tienen `aria-current="page"`. Los controles tienen `min-height: 44px`. Los 4 CTAs pasan contraste (`#0F7B3E`, hover `#0B6333`). Los 9 botones de ficha ya tienen nombre accesible único. **Lo que sigue sin cumplir está en la cola de abajo, no acá.** Si este archivo contradice al código, el código manda: contá antes de Creerle a este párrafo (ya pasó: una versión anterior de esta línea decía "0 reglas `:focus`" y era falso).
10. **El precio visible y el `offers` del JSON-LD salen del mismo campo, y el bloque generado no se toca a mano.** Los dos leen `precio` de `productos.json`, así que no pueden desincronizarse por construcción — y como Google exige que el precio marcado sea visible en la página, esa coincidencia no es opcional. Después de cambiar un `precio`, corré `python scripts/actualizar-itemlist.py` y commiteá `productos.json` y `productos.html` juntos.

## Cola de trabajo abierta

Origen: `/impeccable critique` del 2026-09-26 (snapshot `.impeccable/critique/2026-09-26T01-29-21Z__public-index-html.md`, fingerprint `sha256:ab026f2a48e9`, score **18/40**). Decisiones del usuario: **embudo primero**, alcance **P0 + P1**, "certificado" fuera, y **no re-correr el critique** — el snapshot queda como línea de base histórica aunque el código haya avanzado.

> **Ojo: el snapshot ya no describe el código.** El sitio cambió mucho después del critique (otra herramienta reescribió `script.js` de 7 KB a 21 KB y tocó los cuatro HTML y `styles.css`). Verificá el estado real antes de tocar algo de esta tabla. La columna "Estado" de abajo está medida al 2026-09-26, no heredada del critique.

| # | Sev | Qué | Estado verificado | Comando |
|---|---|---|---|---|
| 1 | **P0** | El modal servía el producto equivocado y envenenaba el mensaje de WhatsApp (`script.js` pasaba el índice del array filtrado y leía el sin filtrar; 0/7 con filtro Cultivos) | **ARREGLADO.** `claveDe()` indexa por `product.id`, con fallback a `productosGlobales.indexOf()` — identidad de objeto, nunca posición filtrada. Verificado 18/18 casos | — |
| 2 | **P0** | En móvil el CTA de la ficha era inalcanzable: 3 de 9 fichas se recortaban, `scrollTop` clavado en 0, `✕` fuera de pantalla, el float de WhatsApp encima del CTA | **ARREGLADO.** El overlay es el único contenedor de scroll: `align-items: flex-start` + `overflow-y: auto` + `z-index: 2100` (el float quedó en 1000), con `margin: auto` en `.modal-content`. Medido a 390×844 real: `✕` visible al inicio, CTA visible al fondo, el CTA pinta encima del float | — |
| 3 | **P1** | El handoff a WhatsApp manda la misma frase genérica desde 5 sitios; `index.html:302` manda un `wa.me` pelado sin mensaje | **ABIERTO.** `abrirWhatsappGeneral()` sigue sin argumento | `/impeccable clarify` |
| 4 | **P1** | El buscador no busca lo que promete: el haystack no incluye `composicion`/`uso`, así que "NPK", "20 l", "flores", "soja" y "Zamorano" dan 0. Es sensible a acentos. 2 de 5 chips ("Hogar", "Potreros") devuelven 0 siempre | **ARREGLADO** (mergeado a `main` el 2026-10-13). `textoBuscable()` suma `composicion`, `uso`, `beneficios` y `presentacion`; `normalizarTexto()` baja a NFD y borra los diacríticos. Los chips quedaron en `Todas`/`Cultivos`/`Servicios`, que son las categorías reales | — |
| 5 | **P1** | `.btn-cotizar-general` medía 1.98:1 de contraste (necesita 4.5:1) y su `:hover` 2.61:1; el float fallaba el 3:1 de no-textual | **ARREGLADO.** Fill `#0F7B3E` y hover `#0B6333`, en los dos CTAs. Medido: 5.35:1 texto, 7.38:1 hover, y el disco del float contra `#f4f8f5` de 1.85:1 a 4.99:1. El detector ya no reporta `low-contrast` en ninguna página | — |
| 6 | **P1** | Regresión que introduce el fix #2: con el overlay scrolleable, scrollear la ficha y soltar sobre el backdrop cerraba el diálogo | **ARREGLADO.** Guard de `mousedown` en el handler: solo cierra si el gesto empezó **y** terminó sobre el overlay | — |
| 7 | **P2** | Los 9 botones "Más información" compartían un único nombre accesible. Un `aria-label` debe **contener** el texto visible o rompe WCAG 2.5.3 | **ARREGLADO.** `aria-label` = "Más información sobre `<nombre del producto>`": el texto visible queda como prefijo (2.5.3) y los 9 nombres quedan distintos. Sin `innerHTML` | — |
| 8 | **P2** | La devolución de foco se pierde en iOS/Safari: Safari no enfoca un `<button>` al hacer clic, así que se captura `<body>` y el `.focus()` final es un no-op | **ARREGLADO.** El botón que invoca se pasa explícito por parámetro (`abrirDetalleProducto(prod, boton)` → `abrirModal(modal, invocado)`), con fallback a `document.activeElement` si el nodo ya no está en el documento (`isConnected`), que pasa si el catálogo se re-renderiza con la ficha abierta | — |
| 9 | **P2** | El focus trap no se dispara si el foco ya salió del diálogo: `manejarTecladoModal` estaba ligado a `#modalProducto`, así que Tab solo se interceptaba con el foco adentro | **ARREGLADO.** El `keydown` se escucha en `document` y filtra por `modal.classList.contains('active')`; si el foco está fuera del diálogo lo devuelve al primer control. El ciclo normal (Tab en el último → primero, Shift+Tab en el primero → último) se conserva | — |
| 10 | **P2** | `.catalogo-estado--error` y `--vacio` se emiten sin una sola regla CSS: el estado de error y el vacío se ven idénticos | **ABIERTO.** | `/impeccable colorize` |
| 11 | **P2** | `bioestimulantes.html` no tiene ningún enlace en el `<nav>` del header (solo Inicio/Productos/Servicios), así que no puede llevar `aria-current="page"`: en esa página nada indica dónde estás. Los otros 3 HTML sí lo llevan | **ABIERTO.** Es una decisión de IA, no un bug: agregar un 4to link al nav en las 4 páginas cambia la arquitectura de navegación | — |
| 12 | **P2** | El `apple-touch-icon` sigue siendo un JPEG. iOS no acepta JPEG en `apple-touch-icon` y cae al screenshot de la página | **ABIERTO.** Requiere un PNG; no hay conversor de imágenes en el entorno. El `favicon.ico` sí se resolvió (1.4 KB en vez de `logo.jpg` de 95 KB) | — |

**Verificado limpio:** `low-contrast` en 0 páginas, 31 links y assets internos en 200, un solo `<h1>` por página, `lang="es"` en las cuatro, ambos JSON-LD parsean, `productos.json` en 200 y la grilla renderiza 9 tarjetas sin errores de consola.

> **ALERTA: `public/index.html` ya fue revertido una vez y restableció el claim prohibido.** Durante la corrida del `/impeccable harden` del 2026-09-26, otro proceso hizo `git checkout` sobre `public/index.html` y lo devolvió al estado de HEAD, reapareciendo las 7 apariciones de "Certificado" (regla 2) y perdiendo `<nav>`, `<main>`, el skip link, el favicon `.ico`, el `?v=` y el botón de pausa. Se restauró todo y se reverificó (0 apariciones del claim, 1 sola de `courier certificada`, los dos JSON-LD parsean, `name` del FAQPage idéntico byte a byte al `<h3>` visible). **Si aparece "Certificado" en `index.html`, no lo reconstruyas desde cero y no asumas que fue un cambio intencional: es una regresión.** Verificalo contando: 0 apariciones del claim y `certificad*` solo dentro de `courier certificada`, más el detector de la sección de abajo. (No existe un `verify-html.js` en este repo; una versión anterior de esta nota lo mencionaba.)

**Pendiente de decisión de producto, no de código:** no hay nada que responda "¿cómo sé que esto no me quema el cultivo?". Hay dos líneas tranquilizadoras reales en `productos.json` que hoy son invisibles (`"nula toxicidad en mamíferos y nula fitotoxicidad"` en FungiCorPlus, `"compatible con la gran mayoría de fitosanitarios"` en CalciBorCorPlus). Publicarlas es seguro; inventar un tamaño de prueba o una muestra no.

**Conocido, sin dueño claro:** la raíz tiene directorios y archivos sin trackear que no son del sitio (`.opencode/`, `01-TOOLS/`, `02-DOCS/`, `.impeccable/live/`, `.rsc.json`): estado local de herramientas. La regla se mantiene: **antes de cualquier `git add -A`, mirá `git status`** — si agregás todo a ciegas, commiteás herramientas ajenas al producto. (Los 4 HTML de 0 bytes que había en la raíz ya no están.)

**Fuera de alcance hasta que se pida:** sistema de tarjetas por defecto (18 `side-tab`, 7 `border-accent-on-rounded`), `cramped-padding` en `productos-section`, escala tipográfica de 13.6px, ancho de lectura de ~136ch, unificación de los 4 bloques `<style>`, `loading="lazy"` y optimización de imágenes, la página "Nosotros", y la navegación por síntoma→producto.

## Antes de dar por terminado un cambio de UI

```bash
# 1. el detector mecánico, una vez, no antes
.opencode/skills/impeccable/scripts/impeccable.cmd detect --json public/<archivo-modificado>

# 2. serves over HTTP, check 390x844 AND ~1440px
```

El paso 1 no es opcional: la última pasada encontró 2 reglas que solo aparecen en la pasada renderizada y que ninguna revisión manual había visto.

**No confíes en el exit code del wrapper `.cmd`** — no lo propaga de forma fiable. Contá los elementos del array JSON que devuelve.

## Contexto de diseño

`impeccable init` escribió el registro en `PRODUCT.md`, no en un `## Design Context` de este archivo. Para el contexto de diseño y audiencia, leé `PRODUCT.md`.


<!-- rsc-suggest:start -->

# rsc-suggest — the always-on layer

Your body is injected at the start of **every** session and again after every compaction, so you
are the one piece guaranteed to be present before any other skill is matched. Two jobs, in order:

1. **Classify every turn into one of three lanes** before anything is written.
2. **Keep the session equipped** — spot the skill the task needs but the user does not have.

---

## 1. The decisor: classify the turn before acting

Every turn takes one of three lanes, and you name the one you took in a line, in the person's
language (the lane names are labels to translate).

**Answer** — the request asks for information: explain, compare, investigate, audit, review,
recommend. Read-only: write nothing, create no artifact, delegate no writer. Asking you to *think
about* building something is still this lane; only asking to build authorises it. When change
intent is ambiguous, ask one question and stay here — ambiguity slows the lane, never raises it.

**You choose the lane; never hand that choice to the person.** Simple → **FTD**: one feature document
in `02-DOCS` (intent, scope, checklist, evidence, next step), tasks checked off against observed proof.
Big, or decisions that affect each other → **SDD**: enter the chain; the person approves the spec and
clarify, then picks manual or autopilot. Say which and why in one line; switch if asked.
→ `../ftd/SKILL.md` · `../sdd/SKILL.md`.

**Where.** Default branch open (chosen at install, or nothing complex) → work on it, no branch
question. Closed («ramas y PR», CI, team) → before each code change ask: this branch, a new one, or
`rsc main unlock`? Never branch alone. Another session here → `.worktrees/<branch>`.

Judge the **meaning**, not the wording: the trigger is semantic in any language. A bug fix restoring
intended behaviour is `debug`. Autopilot consent covers a whole run — advance without re-asking.

Lane's skill missing? Offer it (§2) first. SDD recorded as deferred in `.rsc.json`? Run
`npx @ericrisco/rsc@latest reassess`; silent on `RSC_REASSESSMENT_NO_CHANGE`, and on new evidence
show the plan command — SDD still needs a newly accepted plan id, never added silently.

---

## 2. Keeping the session equipped

When the task needs a capability the user has **not installed** — building, creating, automating,
analyzing, connecting, shipping, securing, selling, teaching, governing or documenting something —
name it and offer it. This runs mid-conversation, not only at project start.

1. `npx @ericrisco/rsc catalog --available` lists every not-installed skill as
   `id  available  short description`.
2. Pick the single best fit **by meaning**, the way you would match a request to a teammate's
   expertise — "mandar emails de bienvenida" → an email/outreach skill, though not one keyword
   overlaps. If nothing genuinely fits, say so
   and move on: a tangential suggestion is worse than none.
3. Ask once, plainly: "Para esto instalaría `<id>`, que aún no tienes. ¿La instalo? (sí/no)".
4. On yes, run `npx @ericrisco/rsc add <id>`, then continue the original task.

Installing changes the user's environment, so it is always their call. One suggestion at a time,
and never to interrupt a flow with a nice-to-have. Never recommend something already installed
(`npx @ericrisco/rsc list`).

`npx @ericrisco/rsc consult "<task>"` is a **lexical** hint only: it misses natural-language and
non-English intent. Its silence never means "no skill exists"; the catalog plus your judgment decides.

### Automation gap — after the work

Delivered work a repeatable **procedure**? Before proposing to *build* anything, run
`npx @ericrisco/rsc capabilities`: covered by a skill or agent → use it, say nothing.
Not covered → one line, skill or agent. Rules: `skill-scout`.

---

## 3. A harness that is broken fixes itself

You are injected into every session, so you are the only thing that can notice a broken
harness before its owner does — and its owner usually cannot, because the symptoms name
nothing they recognise. When any of these is true, act on it **once** in the session:

- `.rsc.json` exists and what it declares is not what is installed;
- the same hook seems to run several times;
- the harness is wired for an assistant that is not the one running.

Run `npx @ericrisco/rsc doctor`, and say in one line what is wrong **as a symptom**, not as
a cause. Then:

- **Nothing built** — `.rsc.json` without `.rsc/`: a clone. Name
  `npx @ericrisco/rsc@<catalogVersion in .rsc.json> sync`, that exact version, **never** `@latest`
  — a release nobody here adopted is drift. Ask in one line, **keep working either way**; silence
  is not a no, `.rsc/.no-harness` is.
- Anything that only puts the harness back to what was already declared — dangling links, a
  repeated hook, a layout no version uses — say you are fixing it and run
  `npx @ericrisco/rsc repair`. Restoring is not deciding, and a recoverable copy is kept.
- Anything that would change a decision — moving to another assistant, adopting a skill a
  teammate added, disarming a gate — **ask first**. A `git pull` never rewrites someone's
  machine.

Offer once per session. Never mention any of it when the harness is healthy.

## 4. First contact

Before handling the first request of a session, check the workspace:

- No `02-DOCS/wiki/harness/user-profile.md` **and** no `.rsc/.no-harness` → invoke `init` first
  (one question: technical terms or analogies) before the task.
- A clone (`.rsc.json` committed) is not first contact: ask that once, in one line, then continue
  with their task; with `.rsc/.profile-offered`, never again.
- The user declines a harness here ("sin harness", "solo código") → create an empty
  `.rsc/.no-harness`, confirm in one line, and never auto-start `init` in this repo again.
- With a profile, this gate is inert. Never re-onboard.

## Explain without assuming

Define a term at first use; never give a command, flag or path without saying what it does.

## Orientación (siempre)

Habla con la voz de `orient`: frases cortas, una idea por frase, al grano, y cada respuesta se entiende sola. Registro técnico o con analogías según `technical_level` en `02-DOCS/wiki/harness/user-profile.md`. Cierra cada turno con el **bloque-brújula** (📍 dónde estás · ➡️ siguiente, terminando en pregunta; ✅ y 🧭 cuando hay algo hecho o decidido). **Nunca termines en seco.** Protocolo completo: skill `orient` → `skills/orient/references/orientation-contract.md`. (Defiere a §2 el "¿instalo la skill que falta?".)

**rsc updates.** Claude Code, Codex, Gemini CLI, Cursor and OpenCode check for a new rsc on their own. In any other assistant, run `node .rsc/auto-update.mjs` once on the first turn of a session and relay any notice it prints in one line; "up to date" needs no mention.

<!-- rsc-suggest:end -->
