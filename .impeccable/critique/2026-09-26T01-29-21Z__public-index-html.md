---
target: public/index.html
total_score: 18
max_score: 40
na_heuristics: 
p0_count: 2
p1_count: 3
target_identity: "file:C:\\Users\\nicol\\Desktop\\Tienda CGS Del Ecuador\\public\\index.html"
target_fingerprint: "sha256:ab026f2a48e9247b6e0883d0ab44e931d31fc62f74ba0c192a2cedfd2757f1fc"
target_path: "C:\\Users\\nicol\\Desktop\\Tienda CGS Del Ecuador\\public\\index.html"
timestamp: 2026-09-26T01-29-21Z
slug: public-index-html
---
Method: dual-agent (A: ses_f24b4f09affeyuz5e9dOCKfbA5 · B: ses_f24b4f094ffeHyDzBoOYYJV4m4)

Target: `public/index.html` (whole-site scope: index, productos, servicios, bioestimulantes).
Browser: `browser.*` MCP tools were disconnected for both agents. No user-visible overlay exists and none is claimed. Assessment B drove the installed Chrome directly via headless CDP; the 390x844 viewport was forced with a same-origin iframe after `--window-size` was found to be clamped to 500x692 by headless Chrome on this machine.

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | No result count anywhere; `aria-live=0` on all 4 pages, so filter/search change the grid silently. `productos.html:240-244` ships `.loading`/`.spinner` markup with zero CSS rules, so a throttled user gets an unstyled 1rem black text flash. No confirmation that a WhatsApp handoff fired. |
| 2 | Match System / Real World | 2 | Spanish throughout with real units (g/l, pH, NPK, l/ha). Undermined by chips offering `Hogar`/`Potreros`, which are not system categories, and by "Más información", a label carrying no information. |
| 3 | User Control and Freedom | 1 | Modal has no Escape (measured `CLOSES=false`), no focus trap, no `role="dialog"`/`aria-modal`, no focus return (`activeElement=BODY` after open). `.modal-content` has no `max-height` and `.modal-overlay` no `overflow-y`, so clipped content is unreachable. Auto-carousel hijacks scroll every 3s with no pause and no `prefers-reduced-motion` guard. |
| 4 | Consistency and Standards | 2 | Heading outline is `1>3>3>3>3>3` on productos and `1>3>3>3>3` on servicios — measured zero `<h2>` on both. Site-wide: 0 `<nav>`, 0 `role=`, 0 `<label>`, 0 `aria-current`, 0 `aria-live`, 0 `:focus` rules, 0 `prefers-reduced-motion`. The header nav is a `<div class="header-right">` on all 4 pages. `bioestimulantes.html` has no current-page indicator at all. |
| 5 | Error Prevention | 1 | `script.js:63` passes the filtered-array index while `:77` reads `productosGlobales[index]` — measured 0/7 correct under the Cultivos filter, 0/3 under "bio", 0/2 under "calcio". 2 of 5 category chips return 0 results by construction. Search input has no label. All 9 catalog buttons share the label "Más información". |
| 6 | Recognition Rather Than Recall | 2 | Chips and badges are the right call, but the search haystack is `nombre + descripcionCorta + detalleAdicional`, and `detalleAdicional` is defined on 0 of 9 products, so the whole composition corpus is unindexed. Measured 0 hits for "NPK", "micronutrientes", "extractos", "pH", "20 l", "flores", "soja", and "Zamorano". Accent-sensitive: "analisis" 0 vs "análisis" 1. `presentacion` is deliberately stripped from cards. |
| 7 | Flexibility and Efficiency | 2 | Real search and chips exist and the modal pre-fills a product name. Loses it: the index bug destroys it for the returning user; filter/search state never reaches the URL, so nothing is shareable, and PRODUCT.md records that the site is shared over WhatsApp; no debounce on `keyup`. |
| 8 | Aesthetic and Minimalist Design | 2 | Clean and uncluttered, but the homepage is one undifferentiated scroll of five equal-weight centred-H2 sections with no narrative escalation. 10 inline `style=` attributes plus a per-page `<style>` block duplicate a system that already lives in `styles.css`. Detector confirms 18 `side-tab` and 7 `border-accent-on-rounded` instances. |
| 9 | Help Users Recover from Errors | 2 | One genuinely good path: `script.js:28-33` is a real failure state that routes to WhatsApp. Everything else fails silently — dead chips render "No se encontraron productos en esta categoría." with no clear-filters action and no contact, zero-result search has no recovery, and the wrong-product modal raises nothing. |
| 10 | Help and Documentation | 2 | The right shape — real contextual help in the ficha and a long guide. The wrong content: no "síntoma → producto" routing anywhere, no dose per hectare on any card, and no application-safety or compatibility guidance for someone about to put an unfamiliar liquid on a living crop. Measured: 0 `<details>`/`<summary>` site-wide, so the FAQ is a 5-card wall that never honours the accordion expectation its own heading sets. |
| **Total** | | **18/40** | **Poor** (45%) |

Applicable max: 40 (all ten heuristics scored; none n/a). Both 7 and 10 genuinely apply — there is a catalog search and filter, and there is an FAQ plus a long guide.

Note on band: the reference band table places 18 in 12-19 = Poor. Assessment A's own scale called it "Needs work"; the reference band is used here. Two heuristics (#3, #5) could defensibly drop to 0 given the measured unreachability of the modal CTA, which would make the total 16/40.

## Design Specificity Verdict

**Generic. An unrelated agrochemical vendor could drop this in unchanged.**

The composition is the default agro landing page: green gradient hero, three emoji value-prop cards, four image cards, five FAQ cards, three-column footer. All four pages share an identical header, footer and `valor-grid` band; only the middle strip changes. `productos.html` and `servicios.html` are structurally the same page.

- **"Ingenieros Zamoranos" — the strongest brand asset per PRODUCT.md — has no visual existence.** It appears in one card title, one card body, one `productos.json` field and two FAQ sentences. It is not in the header, the H1, the logo lockup, the favicon or the nav. On `productos.html` it is invisible except inside a modal. Measured: searching "Zamorano" returns 0 results.
- **The real technical data layer is demoted to body copy.** CaO 26.5% / N 15.5%, NPK 1:3:1, pH 2.8, 32 g/l B, density 1.6 g/cm³, vida útil 2 años, "Soja/Colza 1-2 l/ha en floración" all render as undifferentiated 0.9rem grey prose behind a button labelled "Más información". A 9-element composition list is set as one running paragraph where a `<dl>` would be trivial.
- **"Diagnóstico antes que dosis" is never visualized.** No soil → sample → lab → dose sequence anywhere.
- **The emoji set (13 glyphs) is a generic farming kit** that says "agriculture", not fertilizer chemistry, not Zamorano, not Ecuador. It also renders inconsistently on the exact Android mid-range devices PRODUCT.md names.
- **"Sin intermediarios" — the verified differentiator PRODUCT.md ranks first — appears once**, buried mid-sentence in an FAQ answer, and is absent from the value-prop trio.
- Location is footer-only. The "produced by us, courier-certified, 20 L and 200 L, all provinces" story is one line in a value card.

Roughly 5% of the design decisions could only belong to this business. The material to fix it is already in the repo.

**Deterministic scan:** 35 static findings site-wide (side-tab 18, low-contrast 8, border-accent-on-rounded 7, skipped-heading 2), plus 102 in the rendered pass (two viewport-dependent rules: `body-text-viewport-edge` ×18 at 390x844 only, `line-length` ×16 at 1280x800 only, worst ~136 chars/line on productos.html). Both viewport-only rules were found by neither the design review nor manual reading.

Count caveat so severity is not inflated: the 18 `side-tab` findings are **2 CSS declarations** (`styles.css:172` `.valor-card`, `styles.css:437` `.faq-item`); the 7 `border-accent-on-rounded` are **1 declaration** (`styles.css:397` `.beneficio-card`). The HTML findings all report `line: 0`, so per-file scans carry no line attribution — the true locations came from the directory scan.

**Detector false negatives (proof, not speculation):** the identical `#ffffff` on `#25d366` = 1.98:1 defect on `.whatsapp-float` is flagged on index, servicios and bioestimulantes but reported 0 times on `productos.html`, in both the static and the rendered pass. `skipped-heading` emits 1 finding per page where zero `<h2>` exist, naming only the first skip. `detect` on a URL returns `[]` with a false "no Chrome found" error on this machine until `IMPECCABLE_BROWSER` is set, even though Chrome is installed.

**No user-visible overlay is available.** No in-page `detect.js` ships with this skill build — `.opencode/skills/impeccable/scripts/` contains only `live-browser.js` (a Node-side CDP driver), `live-browser-dom.js`, `live-browser-session.js`, `live-browser-ignores.js` and `modern-screenshot.umd.js`. The `live-server --background` verb reported pid 22896/port 8400 and then exited. Nothing was claimed as an overlay.

## Overall Impression

Calm, legible, honest — and quietly broken at the exact moment a technical buyer is supposed to decide. Measured in real Chrome: filter the catalog to Cultivos and **0 of 7 cards open the right ficha técnica**, each one pre-filling WhatsApp with the wrong product name. On a 390x844 phone, **3 of 9 fichas clip off both the top and the bottom of the screen, the overlay does not scroll (`scrollTop` stays 0 when set to 9999), the close button is clipped off-screen for two of them, and the WhatsApp float paints on top of the modal CTA.** A farmer who clicks Humicorplus and reaches the engineer is talking about soil analysis. Fix the funnel before anything else: a bolder site sends more leads through the same broken modal.

## What's Working

1. **The data layer is real and unusually honest for a producer this size.** `productos.json` carries actual formulations and per-crop, per-phenological-stage doses, and the `uso` field already speaks the diagnosis-first vocabulary PRODUCT.md calls for. Almost every competing agro page shows a stock photo and a slogan; this one can show a number. The reason a redesign is worth doing is that the material to build it on already exists — the design is currently throwing it away.
2. **The conversion is correctly narrowed to one channel and correctly contextualized at the deepest point.** No cart, no fake price, no newsletter, no "síguenos". `script.js:83-84` pre-fills the product name, so the highest-intent moment arrives at the engineer already labelled. That is the right pattern; it is just not applied consistently.
3. **The foundation is solid and cheap to build on.** One 10 KB stylesheet, one 7 KB script, no framework, no build step. All 31 internal links and assets resolve 200, every `<img>` has an `alt`, exactly one `<h1>` per page, `lang="es"` throughout, both JSON-LD blocks parse. `productos.json` returns 200 and the grid renders 9 cards with no console errors. The problems are in what the design chose to say, not in whether it works.

## Priority Issues

### 1. [P0] The catalog modal serves the wrong product and poisons the WhatsApp message
`script.js:63` emits `verDetalleProducto(${index})` with the index of the **filtered** array; `script.js:77` reads `productosGlobales[index]`, the **unfiltered** one. Reproduced by clicking the real filter in Chrome: under Cultivos, 0/7 correct — Bioscorplus→Visita Técnica Zamorana, Humicorplus→Análisis de Suelo, Algascorplus→Bioscorplus, CalcioCorplus→Humicorplus, PotreroCorplus→Algascorplus, CalciBorCorPlus→CalcioCorplus, FungiCorPlus→PotreroCorplus. Search makes it strictly worse: "bio" 0/3, "calcio" 0/2. The last two products are unreachable from any filtered view. The generated URL confirms the leak: `wa.me/593963518696?text=...*Visita%20Tecnica%20Zamorana*` after clicking Bioscorplus.

**Why:** the site's only output is a WhatsApp message to an agronomist, and it is confidently naming the wrong product. For a technical buyer this is not cosmetic — the same wrong ficha would ship a wrong dose. The card already carries an unused `data-id` at `script.js:52`.

**Fix:** key by identity, not position — `onclick="verDetalleProducto('${producto.id}')"` plus `productosGlobales.find(p => p.id === id)`. One line, kills the whole failure class.

**Suggested command:** `/impeccable harden`

### 2. [P0] On a phone the ficha's only CTA is off-screen and unreachable
Measured at a true 390x844 viewport, all 9 products. `.modal-overlay` is `position:fixed; display:flex; align-items:center` with no `overflow-y`; `.modal-content` has no `max-height`. Content heights run 608-909px against an 814px viewport. Three fichas overflow symmetrically: PotreroCorplus (top −10 / bottom 854), **CalciBorCorPlus (top −32 / bottom 876)**, FungiCorPlus (top −20 / bottom 864). The `✕` is clipped off-screen for CalciBorCorPlus and FungiCorPlus. `overlay.scrollTop = 9999` returns **0** in all 9 cases — the overlay is not a scroll container, so the clipped content is unreachable. `.whatsapp-float` shares `z-index:1000` and appears later in the DOM, so it paints over the modal CTA for all three.

**Why:** this is the conversion step, on the device PRODUCT.md names as primary, and it is unrecoverable — not merely awkward.

**Fix:** `align-items:flex-start` + `overflow-y:auto` on the overlay, `max-height: calc(100dvh - 32px)` + internal scroll on `.modal-content`, modal z-index above the float, close button ≥44x44 with `aria-label`. Then add Escape, focus trap and focus return.

**Suggested command:** `/impeccable adapt`

### 3. [P1] The WhatsApp handoff is broken in two separate ways
`abrirWhatsappGeneral()` takes no argument and sends one fixed sentence, "asesoría técnica para mi cultivo", from "Solicitar Análisis" (`index.html:270`), "Agendar Visita" (`index.html:282`), "Agendar Visita por WhatsApp" (`servicios.html:156`), "Solicitar Análisis por WhatsApp" (`servicios.html:180`) and the guide banner (`bioestimulantes.html:196`) — on the pages whose entire job is booking one of two specific services. `index.html:302` is a **second** variant: a bare `wa.me/593963518696` with no message.

> **CORRECTION (verified after this snapshot was written):** this issue originally also claimed the FAQPage JSON-LD at `index.html:89` and `:121` published a wrong phone number. **That claim is false and is retracted.** `script.js:1` (`TELEFONO_WHATSAPP = '593963518696'`), both JSON-LD strings, and all six `wa.me` hrefs resolve to the same number: **+593 96 351 8696**. There is no number drift. Assessment A miscounted the digit string. This is a two-way defect, not three, and the "dead phone number in the SERP" sub-finding does not exist.

**Why:** PRODUCT.md principle 4 states every requested action resolves in WhatsApp with the message already contextualized to what the person was looking at. It doesn't. The site asks the customer to do all the diagnostic work and transfers none of it — on a business whose thesis is "diagnóstico antes de dosis".

**Fix:** `abrirWhatsappGeneral(ctx)` with the service or product named, prefilled to prompt the two facts the engineer needs (cultivo + superficie/etapa). While in there, make the number a single source of truth — it is currently hand-written in all four HTML files, so a future change touches 6+ locations even though no drift exists today.

**Suggested command:** `/impeccable clarify`

### 4. [P1] The search box does not search what it advertises, and 2 of 5 chips are fiction
`productos.html:231` placeholder promises "ingredientes activos". The haystack at `script.js:138` is `nombre + descripcionCorta + detalleAdicional`, and `detalleAdicional` is defined on **0 of 9** products, so the entire composition corpus is unindexed. Verified against live data: "NPK" 0, "micronutrientes" 0, "extractos" 0, "pH" 0, "200 L" 0, "20 l" 0 despite being in all 7 presentations, "raíz" 0, "flores" 0, "soja" 0, "Zamorano" 0. Accent-sensitive: "analisis" 0 vs "análisis" 1. The chips at `productos.html:223-227` offer `Hogar` and `Potreros`; `productos.json` contains only `Cultivos` (7) and `Servicios` (2), so both return 0 results every time — confirmed by clicking each. "Potreros" is the cruel one, because PotreroCorplus exists and is filed under Cultivos.

**Why:** a technical buyer types an active ingredient or an NPK ratio — that is how they think. A silent zero reads as "this supplier has nothing", which is the worst possible false signal on a Persuade site. "Hogar" is the most inviting word on the page for the kitchen-garden farmer PRODUCT.md puts in scope, and it is a lie.

**Fix:** index `beneficios + composicion + uso`; normalize both sides with NFD; add a result count, `aria-live`, and an empty state that names the real cause and offers a clear-filters action; delete the two dead chips rather than invent taxonomy to fill a row; label `#searchInput`; give the nine buttons distinct labels.

**Suggested command:** `/impeccable clarify`

### 5. [P1] The single conversion action fails WCAG AA at 1.98:1
Measured, not estimated: `.btn-cotizar-general` is `rgb(255,255,255)` on `rgb(37,211,102)` = **1.98:1** against a 4.5:1 requirement, and its `:hover` `#1eb855` is 2.61:1. The same fill on `.whatsapp-float` fails the 3:1 non-text bar at 1.98:1, and the disc itself is 1.85:1 against the `#f4f8f5` page. It hits the modal CTA, both servicios CTAs, the guide banner and the homepage service cards. The detector independently flags it on 3 of 4 pages and misses it on the fourth.

Not everything fails: `.btn-agregar` measures 5.13:1, `.btn-agregar:hover` 7.87:1, the first hero button 7.87:1, `.btn-categoria.active` 5.13:1, the footer 11.76:1. The correct inverted pattern already exists at `styles.css:99-102` and simply was not applied to its sibling.

**Why:** the user is in a field, often in direct sun, on a mid-range Android. The one thing that must be readable is the one thing that isn't.

**Fix:** darken the CTA fill within the same green family. `#0F7B3E` computes to 5.35:1 on white, 7.38:1 on its hover `#0B6333`, and 4.98:1 against the page background — it stays WhatsApp-adjacent, which is the recognition cue the float needs. Verify the final value rather than trusting the arithmetic.

**Suggested command:** `/impeccable colorize`

## Persona Red Flags

**Casey — Distracted Mobile User (primary).** `index.html` pulls **673.3 KB** on first view (8 requests), of which 280 KB is `producto-abono.jpg` and 91 KB is `logo.jpg` — the hero text is the cheapest thing on the page. Zero `loading="lazy"`, zero `width`/`height`, so the grid eagerly loads **1.9 MB** of catalog imagery. The 3-second auto-scroll carousel (`script.js:147-180`) is the worst failure: `scrollBy` + `behavior:'smooth'` every 3000 ms while he is one-handed and gets a call mid-sentence, with no pause control and no `prefers-reduced-motion` guard anywhere. **The dots lie** — hardcoded at `index.html:224-228`, never updated by any code, while `productos.html` and `servicios.html` run the same timer with **no dots at all**. Nav links sit at 36px, above the thumb zone, on a ~6000px page with a static header. The phone number is never printed as text on any page, so if WhatsApp is missing he has nothing to call. Measured sub-44px targets: card CTAs 330x30, chips 67x38, search 360x42, nav 64x36, close `✕` 16x26.

**Jordan — Confused First-Timer (primary).** "🏡 Hogar" is the most inviting word on the page and it is fiction — he taps it and gets "No se encontraron productos en esta categoría." with no explanation and no contact inside the empty state, then concludes the site has nothing for him. The site never states the decision rule: PRODUCT.md says entry is the field symptom, but the H1 is a keyword and "Soluciones Destacadas" shows no symptoms. He clicks "Más información" — the correct move — with no idea whether the ficha holds a price, a dose, or whether it applies to his crop. Then the composition arrives as one 9-element paragraph he cannot scan. And "Nuestros precios varian por cada productos y presentación" is ungrammatical and never says *why* there is no price, which is the actual reassurance.

**Riley — Deliberate Stress Tester.** Dead chips with no recovery. Search returns 0 for "NPK", "20 l", "flores", "soja", "Zamorano", and is accent-sensitive. Every Cultivos card returns the wrong ficha silently. No `<noscript>` anywhere, so with JS off the catalog shows the loading state forever — the correct `catch` at `script.js:28` is unreachable without JS. He cannot break the media: all 31 internal links return 200, every `alt` is present, and `img/placeholder.svg` exists for every `onerror`.

**Sam — Accessibility-Dependent.** Site-wide totals across all 4 pages: **1 `aria-*` attribute, 0 `role=`, 0 `<label>`, 0 `<nav>`, 0 `aria-current`, 0 `aria-live`, 0 `role="dialog"`, 0 `aria-modal`, 0 `skip` link, 0 `:focus` rules, 0 `outline` declarations, 0 `prefers-reduced-motion` blocks.** The single `aria-label` per page is the WhatsApp float. The header nav is a `<div class="header-right">` on all 4 pages, and `bioestimulantes.html` has no current-page indicator at all. The modal has no dialog semantics, no Escape (measured `CLOSES=false`), no focus trap, and `activeElement` is `BODY` after open, so focus never enters the dialog and can leave freely — the close button and CTA are 19th and 20th of 21 focusables, and the float is 21st *outside* the modal. `.modal-close` is a bare `✕` glyph with no accessible name at 16x26. The search input is placeholder-only. Filter chips have no `aria-pressed`; active state is a background-colour change only. A focus ring does render, but it is the Chrome UA default, not author-authored. Heading order is `1>3...` on two pages, and opening a modal injects an `<h2>` at `script.js:95` *after* 11 h3s, corrupting the outline at an unrelated document position.

**Doña Rosa — mid-size flower grower, Los Ríos, phone in hand in a greenhouse.** The audience in PRODUCT.md explicitly includes floricultors. She searches "flores" → 0 results. She searches "calcio" → 2 results, both requiring a modal click to reach the CaO 26.5% figure that *is* the reason to buy. **Nothing on the site is organised by crop**, despite the positioning being "la fórmula se recomienda según cultivo y etapa fenológica" — the only crop→product mapping in the entire site is one sentence inside a FAQ. She is the person most likely to be hurt by a wrong dose, and `productos.json:103` publishes real doses inside a prose blob with no indication they are a starting point needing engineering validation, and no application-safety content at all.

**Ing. Barnes — export-scale soy farmer, 200 ha, comparing suppliers on a laptop before ordering 200 L drums.** He needs NPK ratio and g/l to compare against his own program. Those numbers exist and are unsearchable and unlisted. He needs presentation — `presentacion` says "20 ltrs" but only 2 of 9 products mention 200 L, while PRODUCT.md records 20 L and 200 L as the sitewide offer. He needs a price per liter at volume → gets a generic WhatsApp sentence. He needs supplier credentials → the site says "Certificado" repeatedly with no certificate number, no standard, no registry, no issuer. He wants to see the plant or the team → no photos of Balzar, the team, or a field visit with people in it. He lands in WhatsApp with a message naming no product, no hectares, no crop stage.

## Minor Observations

- 🚩 **"Certificado" appears 7 times on `index.html` alone** — `<title>`, meta description, keywords, FAQPage question, FAQPage answer, the `<h1>`, and the visible FAQ — and the design hardens an unverified claim into apparent documentation. Worst inside the structured-data blocks, which are machine-readable assertion channels. This needs a product decision, not a CSS fix; PRODUCT.md is explicit that no certificate exists. Do not add a certificate number or a seal graphic.
- `body-text-viewport-edge` ×18 at 390px: 15px gutters leave long paragraphs bleeding to the viewport edge. `line-length` ×16 at 1280px: up to ~136 chars/line on productos.html, ~127 on servicios, ~100-110 on the guide, against an <80 aim.
- `logo.jpg` (91 KB) serves as favicon, apple-touch-icon, header `<img>` and OG image, with no `width`/`height`, so it reflows on load. A `favicon.ico` also exists but is shadowed by `<link rel="icon">` in every head.
- `styles.css:535-566` — ~30 lines of `.slider-btn` CSS that no HTML uses, and a `.producto-unidad` class that is never used.
- `script.js:87` falls back to `prod.detalleAdicional`, a field no product defines → dead branch; that string can never render.
- `script.js:169` — the carousel `setInterval` runs for the page lifetime on all pages, even where `siguienteTarjeta` early-returns above 768px. Guard with a `matchMedia` listener.
- Two near-identical pill rows on `productos.html`: 3 nav pills, then 3 category chips ~40px below, similar greens and shapes — they read as one 6-item control.
- `index.html:302` closes `</p>` mid-sentence, so "para ponerte en contacto con uno de nuestros asesores\"" renders as orphaned loose text with a stray quote and no period, in the highest-intent card. Its label also reads "CLÍCK AQUI" in all caps.
- The FAQPage JSON-LD marks up 3 of 5 questions that are not the visible ones (Q2, Q5 differ), which breaches Google's requirement that marked-up content be visible and risks the rich result being dropped.
- `servicios.html:127` wraps two cards in `min-height: 75vh`, leaving empty space on desktop.
- PotreroCorplus and FungiCorPlus carry identical card copy; "20 ltrs" is non-standard where the data elsewhere says 20 L and 200 L.
- Emoji icon system (13 glyphs) against one inline SVG; `'Segoe UI'` falls back to a different face on Android.
- `og:image` is the logo on index, productos and bioestimulantes; no `tel:` link sitewide; obsolete `meta keywords`.
- Verified clean: all 31 internal links and assets return 200, every `<img>` has an `alt`, exactly one `<h1>` per page, `lang="es"` on all four, both JSON-LD blocks parse, `productos.json` returns 200 and renders 9 cards with no console errors.

## Questions to Consider

- If "Certificado" cannot stay in the H1 as anything but a commercial adjective, what is the H1? Right now it is doing SEO work and nothing else — a keyword, not a promise. The honest version is longer and less punchy. Which do we optimize, and who signs off?
- The site has real g/l numbers and a technical buyer who is paid to compare them, and then hides them behind "Más información". **Why is the ficha a modal at all?** A per-product page or a printable one-pager would be a competitor-impossible asset and would finally give the catalog shareable URLs, which it currently has none of. What is the real objection — SEO, maintenance, or inertia?
- Diagnosis-first means the site should be asking questions, and instead it asks none and ends in a canned sentence. Would you accept a 3-field micro-form (cultivo / superficie / síntoma) on the two service pages before opening WhatsApp? It costs a form, but it converts the one thing the business actually sells: a qualified conversation.
- No testimonials, no clients, no results, no team photos, no certifications — all real. So what is the reassurance? The answer to "how do I know this won't burn my crop?" is currently nothing, while two genuinely reassuring lines sit invisibly in the data ("nula toxicidad en mamíferos y nula fitotoxicidad" on FungiCorPlus, "compatible con la gran mayoría de fitosanitarios" on CalciBorCorPlus). Is a trial size, a sample, or a published safety note something the business could stand behind? If not, we should at least stop implying we have something we don't.
- The code and the product record have now drifted apart three times (taxonomy, search haystack, certificate claim). Should the category chips and the composition index be **derived from the data** rather than hand-written, so this cannot recur?
- The catalog is 9 items. Is a search box + 5 chips + a modal + a carousel the right amount of machinery for 9 items — or would a single list with the ficha inline, sorted by phenological stage (which `productos.json` already encodes in `uso`), be faster and far more specific?
