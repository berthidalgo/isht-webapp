"""Balance hídrico por cuenca: oferta - demanda → brecha → semáforo.
Umbrales del plan: rojo < -0.2, azul > 0.1 (calibrar con §9).
"""
import pandas as pd
import numpy as np

def calcular_balance(oferta_dict: dict, demanda_dict: dict) -> pd.DataFrame:
    """Calcula la brecha y el balance hídrico para todas las cuencas Pfafstetter."""
    rows = []
    for cod, dem in demanda_dict.items():
        of = oferta_dict.get(cod, {
            "oferta_total_mmc": 50.0,
            "escorrentia_mm": 10.0,
            "precip_anual_mm": 200.0,
            "area_km2": 100.0
        })
        
        oferta_vol = float(of["oferta_total_mmc"])
        demanda_vol = float(dem["demanda_total_mmc"])
        brecha = round(oferta_vol - demanda_vol, 2)
        
        # Ratio de estrés por cantidad
        ratio_estres = demanda_vol / (oferta_vol + 0.1)
        
        # Clasificación base según ratio de estrés
        if ratio_estres >= 0.8:
            semaforo_base = "rojo"
        elif ratio_estres >= 0.3:
            semaforo_base = "amarillo"
        else:
            semaforo_base = "azul"
            
        rows.append({
            "codigo": cod,
            "nombre": dem["nombre"],
            "vertiente": dem["vertiente"],
            "poblacion": dem["poblacion"],
            "oferta": oferta_vol,
            "demanda": demanda_vol,
            "demanda_pob": dem["demanda_poblacional_mmc"],
            "demanda_agr": dem["demanda_agricola_mmc"],
            "demanda_ind": dem["demanda_industrial_mmc"],
            "brecha": brecha,
            "ratio_estres": ratio_estres,
            "semaforo_base": semaforo_base,
            "area_km2": of["area_km2"],
            "escorrentia_mm": of["escorrentia_mm"],
            "precip_anual": of["precip_anual_mm"]
        })
        
    return pd.DataFrame(rows)

