---
target: public/index.html
total_score: 21
max_score: 40
na_heuristics: 
p0_count: 2
p1_count: 3
target_identity: "file:C:\\Users\\nicol\\Desktop\\Tienda CGS Del Ecuador\\public\\index.html"
target_fingerprint: "sha256:ab026f2a48e9247b6e0883d0ab44e931d31fc62f74ba0c192a2cedfd2757f1fc"
target_path: "C:\\Users\\nicol\\Desktop\\Tienda CGS Del Ecuador\\public\\index.html"
timestamp: 2026-09-26T01-12-10Z
slug: public-index-html
---
⚠️ DEGRADED: single-context (no sub-agent capacity — harness subagent depth limit 1, this session is already a sub-agent; Assessment A and B ran inline and sequentially)

Target: `public/index.html` (whole-site scope: index, productos, servicios, bioestimulantes).
Browser: desktop browser tool not connected; no user-visible overlay exists. Findings below are from headless Chrome (same-origin DOM/geometry probe) plus the CLI detector.

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 1 | `.nav-link-header.active` has no CSS rule — no page shows a current-page state; catalog "loading" is a `.spinner` div with no stylesheet rule; filter/search results are silent (no count, no `aria-live`); carousel dots never update in JS. |
| 2 | Match System / Real World | 3 | Vocabulary is real agronomy (N-P-K, g/l, pH, "aborto floral", "fertirriego", CIC, EUN); undermined by "20 ltrs" truncation and "CLÍCK AQUI" caps link. |
| 3 | User Control and Freedom | 2 | Modal has no Esc, no focus trap, no scroll lock; on a phone the close `✕` (16×26px) is clipped off-screen; filters one-tap resettable; WhatsApp opens in `_blank`. |
| 4 | Consistency and Standards | 2 | Three parallel style locations (styles.css + inline `<style>` in all 4 pages); h1→h3 skip on productos/servicios; emoji icons (13) alongside one inline SVG; header strapline differs on index. |
| 5 | Error Prevention | 2 | 2 of 5 catalog filters ("Hogar", "Potreros") resolve to 0 results; search is unlabeled (placeholder only); all 9 card buttons share the label "Más información". |
| 6 | Recognition Rather Than Recall | 3 | Catalog is browsable and real data is one tap away, but pack size ("20 ltrs") is hidden in the modal; the guide page is unreachable from productos/servicios. |
| 7 | Flexibility and Efficiency | 2 | Search exists, but no visible phone number or `tel:` link anywhere; WhatsApp number is duplicated in script.js and all 4 HTML files; no keyboard affordances. |
| 8 | Aesthetic and Minimalist Design | 2 | Refused default: icon+heading+text cards repeated as `.valor-card`, `.producto-card`, `.beneficio-card`; 3 banned 4px/3px border accents on 8px-radius cards; zero authored motion. |
| 9 | Error Recovery | 2 | JSON fetch failure gives a useful message routing to WhatsApp, but the empty state offers no clear-filters/recovery; the wrong-product modal fails silently. |
| 10 | Help and Documentation | 2 | Real FAQ content on two pages, but never contextual (no help at dose/modal decision point), all answers always expanded, services page has no FAQ. |
| **Total** | | **21/40** | **Acceptable — significant improvements needed before users are happy** |

Applicable max: 40 (all ten heuristics scored; none n/a).

## Design Specificity Verdict

The copy is authored by an agronomist; the layout is stock. The site's data layer is genuinely specific (real g/l breakdowns, NPK ratios, densities, pH, stage doses, the "CorPlus" family, "Zamorano" language). The page skeleton is not: green `#2e7d32` on `#f4f8f5`, a 135° green gradient hero, a centered H1, an icon card row, a card grid, an FAQ list, a dark 3-column footer — swappable with any agrochemical vendor. The one differentiator (Zamorano engineers / diagnosis-before-dose) lives in 0.85rem grey body copy and a 4px card border, not in the composition.

**Deterministic scan:** 35 findings, all `warning`, exit 0.
- `side-tab` × 18 (4px side accent on rounded cards) — collapses to `styles.css:172` (`.valor-card`) + `styles.css:437` (`.faq-item`)
- `border-accent-on-rounded` × 7 — collapses to `styles.css:397` (`.beneficio-card` border-top)
- `low-contrast` × 8 — `#ffffff` on `#25d366` (2.0:1) and its `:hover` `#1eb855` (2.6:1), independently confirming the measured primary-CTA failure
- `skipped-heading` × 2 — productos.html, servicios.html (h1→h3)

No false positives. The detector did not catch the behavioral P0s (wrong-product modal, off-screen CTA, dead filters) — those need runtime reproduction, which the same-origin probe supplied.

## Overall Impression

Calm, legible, honest — and quietly broken at the exact moment a technical buyer is supposed to decide. The catalog modal shows the wrong product's ficha técnica and pre-fills WhatsApp with the wrong product name, and on a phone the modal's WhatsApp button is off-screen with no scroll. Fix those two and this is a competent site; as-is it can lose a technical buyer and poison a lead.

## What's Working

1. The data is real and the interface respects it. `productos.json` carries real g/l breakdowns, NPK ratios, densities and stage doses; the UI never simplifies them away — the fastest trust transfer available on a site with no testimonials.
2. One conversion channel, executed consistently. Same WhatsApp number on all four pages, 58×58 float with proper `aria-label` and inline SVG (the one correct icon on the site), modal CTA pre-fills a product-named message.
3. A genuinely expert guide. The FAQ writes about EUN, CIC, fitotoxicidad por estrés osmótico and biosolubilización at a level that respects the reader.

## Priority Issues

1. **[P0] Catalog modal serves the wrong product's data and poisons the WhatsApp message.** Live reproduction: filter `Cultivos`, card 1 "Bioscorplus" → modal shows "Visita Técnica Zamorana"; card 2 → "Análisis de Suelo"; card 3 → "Bioscorplus". Cause: `script.js:63` passes the filtered-array index, `script.js:77` reads `productosGlobales[index]`. 7 of 9 entries wrong on the main category; silent. Fix: key by product `id`. Command: `/impeccable harden`.
2. **[P0] On a phone the modal's WhatsApp CTA is off-screen and unscrollable.** CalciBorCorPlus @390×844: content 909px vs viewport 844px, `align-items:center` splits overflow 32px top/bottom, CTA rect `top:811 bottom:856` (not fully in viewport), overlay `overflow-y:visible`. The 16×26px `✕` is itself clipped off-screen. Fix: overlay `align-items:flex-start; overflow-y:auto` + content `max-height`. Command: `/impeccable adapt`.
3. **[P1] Every service CTA opens WhatsApp with the same generic message.** `abrirWhatsappGeneral()` hardcodes one message; "Agendar Visita" and "Solicitar Análisis" (and the guide banner) all send "asesoría técnica para mi cultivo", violating the product's own contextualization principle. Command: `/impeccable clarify`.
4. **[P1] The catalog loop has no state, no semantics, no reachable targets.** 2 of 5 filters return 0 ("Hogar","Potreros"; data has only Cultivos+Servicios; "Potreros" is cruel because PotreroCorplus exists); `.spinner`/`.loading` unstyled (invisible loading state); no result count or `aria-live`; modal has no `role="dialog"`/`aria-modal`/Esc/focus-trap/scroll-lock; 18 of 20 interactive elements @390 under 44px (chips 38px, search 42px, "Más información" 30px, `✕` 16×26). Command: `/impeccable adapt`.
5. **[P1] The primary action fails WCAG AA at 2.0:1 on all four pages.** `#ffffff` on `#25d366` = 1.98:1 (needs 4.5:1), confirmed by detector incl. `:hover` `#1eb855` 2.6:1; hits the modal CTA, both servicios CTAs, the guide banner, homepage service cards; the float glyph also misses 1.4.11's 3:1. Fix: darken the fill or darken the label. Command: `/impeccable colorize`.

## Persona Red Flags

- **Casey (Distracted Mobile):** nav links sit at the top (36px, above thumb zone); 30px card buttons; catalog needs a 1,934 KB eager image load on mobile data; auto-advancing carousel; the one action that matters (modal WhatsApp) is off-screen.
- **Riley (Stress Tester):** the catalog "works" and silently returns the wrong product for every Cultivos card — the exact "feature that appears to work but produces wrong results" failure; empty-state after a dead filter offers no recovery; filter+search state is lost on refresh.
- **Sam (Accessibility):** 0 `<nav>`, 0 `<main>` on 3 of 4 pages, 0 `aria-current`, 0 `aria-live`, no dialog semantics, no Esc, 4 `aria-label`s sitewide (all the same float); focus is never suppressed (UA ring shows) but there are zero `:focus` rules; all 9 card buttons share the label "Más información".

## Minor Observations

- `bioestimulantes.html` has zero inbound links from productos/servicios (guide reachable only from the homepage hero + one FAQ link).
- Dead CSS: `.slider-btn`, `.producto-unidad` never used in markup.
- Homepage FAQ answer 2: link reads "CLÍCK AQUI", a stray `"` and text fall outside the `</p>`.
- 109ch reading measure on the guide (`.articulo-bio` 800px); craft floor is 65–75ch.
- H1s are keyword strings on all pages; the guide's H1 duplicates its FAQ Q1.
- `servicios.html` wraps two cards in `min-height:75vh` (empty space on desktop).
- `og:image` is the logo on index/productos/bioestimulantes; no `tel:` link; phone number never visible as text.
- PotreroCorplus and FungiCorPlus share identical card copy; "20 ltrs" non-standard (data says 20 L and 200 L).
- Emoji icon system (13 glyphs) vs one inline SVG; `'Segoe UI'` falls back to a different face on Android.
- No `loading="lazy"`; index first view ~673 KB; favicon is a 95.6 KB JPEG; obsolete `meta keywords`.

## Questions to Consider

- Should the guide become a first-class nav destination, or stay an SEO-only surface?
- If the modal can't be trusted on a phone, should product details become a dedicated route instead of an overlay?
- Is "Zamorano" meant to be the brand's spine, or one proof point among several? Right now it's copy, not structure.
