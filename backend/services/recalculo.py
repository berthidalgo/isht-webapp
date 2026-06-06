"""Recálculo del índice ISHT bajo un escenario (POST /api/simular).

La fórmula debe ser IDÉNTICA a la del ETL (transforms/indice.py) para que el
índice base coincida con escenario neutro. Aquí va una implementación funcional
de referencia: un índice 0-100 compuesto por dimensiones ponderadas, ajustado
por El Niño (afecta oferta/presión) y por expansión de demanda.

En F3, ajusta los nombres de campo y la fórmula a lo que produzca tu ETL real.
Funciones <20 líneas (HIDATA).
"""
from typing import Any


def _indice_cuenca(c: dict, escenario: dict) -> float:
    """Índice 0-100 de una cuenca bajo el escenario dado. 100 = máximo estrés."""
    cantidad = float(c.get("estres_cantidad", c.get("brecha_norm", 50.0)))
    calidad = float(c.get("estres_calidad", 50.0))
    presion = float(c.get("presion", 50.0))

    # Escenario: El Niño agrava cantidad/presión; expansión de demanda sube presión.
    el_nino = float(escenario.get("el_nino", 1.0))
    expansion = float(escenario.get("expansion_demanda", 0.0))
    cantidad = min(100.0, cantidad * el_nino)
    presion = min(100.0, presion * (1.0 + expansion))

    w_cant = float(escenario.get("peso_cantidad", 0.5))
    w_cal = float(escenario.get("peso_calidad", 0.3))
    w_pres = float(escenario.get("peso_presion", 0.2))
    total = w_cant + w_cal + w_pres or 1.0

    idx_base = (cantidad * w_cant + calidad * w_cal + presion * w_pres) / total
    
    # Índices multidimensionales agregados de minería (I_CCM) e informalidad/riesgo de acuíferos (I_EAF)
    i_ccm = float(c.get("i_ccm", 0.0))
    i_eaf = float(c.get("i_eaf", 0.0))
    
    w_min = float(escenario.get("peso_mineria", 0.0))
    w_agro = float(escenario.get("peso_agroexportacion", 0.0))
    
    # Aplicación de la fórmula ISHT-v6.0 (Ampliación multidimensional del riesgo)
    idx_final = idx_base * (1.0 + w_min * (i_ccm / 100.0)) * (1.0 + w_agro * (i_eaf / 100.0))
    
    return round(min(100.0, max(0.0, idx_final)), 1)



def _semaforo(idx: float) -> str:
    """Traduce el índice de estrés a color de semáforo."""
    if idx >= 66:
        return "rojo"
    if idx >= 33:
        return "amarillo"
    return "azul"


def _filas(data: Any) -> list[dict]:
    """Normaliza la estructura del índice (lista directa o {'cuencas': [...]})."""
    if isinstance(data, dict) and "cuencas" in data:
        return data["cuencas"]
    if isinstance(data, list):
        return data
    return []


def recalcular_ranking(data: Any, escenario: dict) -> dict:
    """Recalcula el índice de todas las cuencas y devuelve el ranking por estrés."""
    filas = _filas(data)
    recalculadas = []
    for c in filas:
        idx = _indice_cuenca(c, escenario)
        recalculadas.append({
            "codigo": c.get("codigo", c.get("id")),
            "nombre": c.get("nombre", "s/n"),
            "indice": idx,
            "semaforo": _semaforo(idx),
        })
    recalculadas.sort(key=lambda r: r["indice"], reverse=True)
    return {
        "escenario": escenario,
        "n_cuencas": len(recalculadas),
        "ranking": recalculadas,
    }
