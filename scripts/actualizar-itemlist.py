#!/usr/bin/env python3
"""Regenera el bloque ItemList de public/productos.html desde productos.json.

POR QUE EXISTE
El precio se carga a mano en public/productos.json (ver "Cómo cargar un precio"
en PRODUCT.md). Si además hubiera que escribir el `offers` del JSON-LD a mano
tendríamos dos fuentes para el mismo dato, y tarde o temprano se contradicen: la
tarjeta mostraría un precio y Google leería otro. Este script hace que
productos.json sea la única fuente también para el dato estructurado.

Queda además del otro lado del mismo problema: Google exige que el precio
marcado sea visible en la página. Acá sale del mismo campo `precio`, así que no
puede desincronizarse por construcción.

QUE TOCA Y QUE NO
  - SOLO el bloque entre <!-- GENERADO:INICIO --> y <!-- GENERADO:FIN -->.
  - SOLO el campo `offers` de cada producto. Los `name`, `description`,
    `image`, `brand` y `category` del ItemList se escribieron a mano con copy
    propio del sitio y NO se tocan. El script aborta si algo más cambia.
  - El otro bloque JSON-LD de la página (CollectionPage) queda intacto.

DELIBERADAMENTE AFUERA DEL `offers`, porque exigiría inventar un dato:
  - priceValidUntil: necesita una fecha de vigencia que el negocio no definió.
  - availability:    afirmaría stock, y no hay sistema de stock.
  - url / itemCondition / sku: no hay página de producto ni SKU comercial.
Google no los exige para un Product snippet: solo los recomienda.

USO
    python scripts/actualizar-itemlist.py            # escribe si hay cambios
    python scripts/actualizar-itemlist.py --check    # no escribe; código 1 si hay cambios

La primera corrida normaliza el formato del bloque al que emite este script.
Después es idempotente: sin precios nuevos, no escribe nada.
"""

from __future__ import annotations

import argparse
import copy
import json
import re
import sys
import unicodedata
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
PRODUCTOS = RAIZ / "public" / "productos.json"
PAGINA = RAIZ / "public" / "productos.html"

MARCA_INICIO = "<!-- GENERADO:INICIO -->"
MARCA_FIN = "<!-- GENERADO:FIN -->"

# Deben coincidir con el bloque AgriculturalBusiness de index.html.
ORGANIZACION = "https://cgsdelecuador.com/#organizacion"
NOMBRE_ORGANIZACION = "CGS Del Ecuador"
MONEDA = "USD"


def normalizar(texto: object) -> str:
    """'CalciBorCorPlus' y 'calciborcorplus' son el mismo producto."""
    descompuesto = unicodedata.normalize("NFD", str(texto))
    sin_acentos = "".join(c for c in descompuesto if unicodedata.category(c) != "Mn")
    return re.sub(r"\s+", " ", sin_acentos).strip().casefold()


def precio_valido(valor: object) -> float | None:
    """Mismas reglas que formatearPrecio() en public/script.js.

    Acepta 38.5 o '38,50'. Devuelve None para null, vacío, 0, negativos y
    cualquier cosa que no sea un número. Que las dos implementaciones coincidan
    importa: si el JSON-LD publicara un precio que la tarjeta no muestra, Google
    penaliza el resultado enriquecido por precio no visible.
    """
    if valor is None or valor == "" or isinstance(valor, bool):
        return None
    if isinstance(valor, str):
        valor = valor.strip().replace(",", ".")
    try:
        numero = float(valor)  # type: ignore[arg-type]
    except (TypeError, ValueError):
        return None
    if numero != numero or numero in (float("inf"), float("-inf")) or numero <= 0:
        return None
    return numero


def oferta(precio: float) -> dict:
    return {
        "@type": "Offer",
        "price": f"{precio:.2f}",
        "priceCurrency": MONEDA,
        "seller": {
            "@type": "Organization",
            "@id": ORGANIZACION,
            "name": NOMBRE_ORGANIZACION,
        },
    }


def sin_offers(itemlist: dict) -> dict:
    """Copia del ItemList con todos los `offers` borrados. Sirve para comprobar
    que el script no tocó nada más que los precios."""
    copia = copy.deepcopy(itemlist)
    for entrada in copia.get("itemListElement", []):
        (entrada.get("item") or {}).pop("offers", None)
    return copia


def cargar_productos(ruta: Path) -> tuple[list, dict[str, dict]]:
    try:
        datos = json.loads(ruta.read_text(encoding="utf-8"))
    except json.JSONDecodeError as falla:
        raise SystemExit(f"error: {ruta.name} no es JSON válido (línea {falla.lineno}, columna {falla.colno}): {falla.msg}") from None
    except FileNotFoundError:
        raise SystemExit(f"error: no encuentro {ruta}") from None
    if not isinstance(datos, list) or not all(isinstance(p, dict) for p in datos):
        raise SystemExit(f"error: {ruta.name} tiene que ser una lista de objetos, uno por producto")
    por_nombre: dict[str, dict] = {}
    for producto in datos:
        clave = normalizar(producto.get("nombre", ""))
        if not clave:
            seguir = f"el producto {producto.get('id')!r} no tiene nombre"
            raise SystemExit(f"error: {seguir}")
        if clave in por_nombre:
            raise SystemExit(f"error: dos productos se llaman {producto['nombre']!r}: no puedo saber cuál cotizar")
        por_nombre[clave] = producto
    return datos, por_nombre


def extraer_bloque(html: str, pagina: Path) -> tuple[int, int]:
    inicio = html.find(MARCA_INICIO)
    fin = html.find(MARCA_FIN)
    if inicio == -1 or fin == -1:
        raise SystemExit(f"error: no encuentro {MARCA_INICIO} / {MARCA_FIN} en {pagina.name}")
    if html.find(MARCA_INICIO, inicio + 1) != -1 or html.find(MARCA_FIN, fin + 1) != -1:
        raise SystemExit("error: hay más de un bloque generado; hay que nombrarlos antes de seguir")
    if fin < inicio:
        raise SystemExit(f"error: en {pagina.name} la marca FIN aparece antes que INICIO")
    return inicio, fin


def extraer_itemlist(bloque: str) -> dict:
    coincidencia = re.search(r'<script type="application/ld\+json">(.*?)</script>', bloque, re.S)
    if not coincidencia:
        raise SystemExit("error: el bloque generado no contiene un <script type=\"application/ld+json\">")
    try:
        return json.loads(coincidencia.group(1))
    except json.JSONDecodeError as falla:
        raise SystemExit(
            f"error: el JSON-LD generado no parsea (línea {falla.lineno}, columna {falla.colno}): {falla.msg}"
        ) from None


def emitir(itemlist: dict) -> str:
    cuerpo = json.dumps(itemlist, ensure_ascii=False, indent=2)
    cuerpo = "\n".join("  " + linea for linea in cuerpo.splitlines())
    return (
        f"{MARCA_INICIO}\n"
        f'  <script type="application/ld+json">\n'
        f"{cuerpo}\n"
        f"  </script>\n"
        f"  {MARCA_FIN}"
    )


def main() -> int:
    analizador = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter
    )
    analizador.add_argument("--productos", type=Path, default=PRODUCTOS, help="por defecto public/productos.json")
    analizador.add_argument("--pagina", type=Path, default=PAGINA, help="por defecto public/productos.html")
    analizador.add_argument("--check", action="store_true", help="no escribe; termina con código 1 si hay cambios pendientes")
    argumentos = analizador.parse_args()

    productos, por_nombre = cargar_productos(argumentos.productos)
    html = argumentos.pagina.read_text(encoding="utf-8")
    inicio, fin = extraer_bloque(html, argumentos.pagina)
    bloque = html[inicio : fin + len(MARCA_FIN)]
    itemlist = extraer_itemlist(bloque)
    original = copy.deepcopy(itemlist)

    con_precio = sin_precio = desconocidos = 0
    for entrada in itemlist.get("itemListElement", []):
        item = entrada.setdefault("item", {})
        nombre = item.get("name", "")
        clave = normalizar(nombre)
        producto = por_nombre.get(clave)
        if producto is None:
            desconocidos += 1
            print(f"  aviso: {nombre!r} está en el ItemList y no en {argumentos.productos.name}: no lo toco")
            continue
        precio = precio_valido(producto.get("precio"))
        if precio is None:
            sin_precio += 1
            # Si el precio se borró en el JSON, el JSON-LD no puede seguir
            # anunciándolo: publicar un precio que la página ya no muestra es
            # exactamente lo que Google castiga.
            item.pop("offers", None)
        else:
            con_precio += 1
            item["offers"] = oferta(precio)

    # Los servicios viven en productos.json pero no en el ItemList: un Service
    # no es un Product y el ItemList es de productos. No es un olvido.
    for clave, producto in por_nombre.items():
        if clave not in {normalizar((e.get("item") or {}).get("name", "")) for e in itemlist.get("itemListElement", [])}:
            if producto.get("categoria") != "Servicios":
                print(f"  aviso: {producto['nombre']!r} está en {argumentos.productos.name} y no en el ItemList")

    # Invariante: el script administra `offers` y nada más. Si un nombre, una
    # descripción o una categoría cambió, es un bug y no se escribe.
    if sin_offers(original) != sin_offers(itemlist):
        raise SystemExit("error: el script modificó algo además de `offers`; no escribo nada")

    nuevo_bloque = emitir(itemlist)

    print(f"  productos en el ItemList: con precio {con_precio}, sin precio {sin_precio}", end="")
    print(f", sin correspondencia {desconocidos}" if desconocidos else "")
    print(f"  entradas en {argumentos.productos.name}: {len(productos)}")

    if nuevo_bloque == bloque:
        print("  sin cambios: el bloque ya está al día")
        return 0
    if argumentos.check:
        print("  CAMBIOS PENDIENTES: corré el script sin --check para escribirlos")
        return 1

    argumentos.pagina.write_text(html[:inicio] + nuevo_bloque + html[fin + len(MARCA_FIN) :], encoding="utf-8")
    print(f"  escrito: {argumentos.pagina}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
