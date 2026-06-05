"""Índice 0-100 compuesto (balance dual: cantidad + calidad + presión).
DEBE coincidir con backend/services/recalculo.py para escenario neutro.
"""
import pandas as pd
import numpy as np

def construir_indice(df_balance: pd.DataFrame) -> pd.DataFrame:
    """Calcula el índice ISHT compuesto por cuenca."""
    rows = []
    for _, row in df_balance.iterrows():
        cod = str(row["codigo"])
        nombre = str(row["nombre"])
        vertiente = str(row["vertiente"])
        
        # 1. Estres por Cantidad (0-100)
        ratio = float(row["ratio_estres"])
        if ratio >= 1.0:
            estres_cant = min(100.0, 80.0 + (ratio - 1.0) * 10.0)
        else:
            estres_cant = ratio * 80.0
            
        # 2. Estres por Calidad (0-100) - Bruno Elescano chemical/mining proxy
        if vertiente == "Pacific":
            base_cal = 45.0
        elif vertiente == "Titicaca":
            base_cal = 35.0
        else:
            base_cal = 15.0
            
        ind_density = (float(row["demanda_ind"]) / (float(row["area_km2"]) + 10.0)) * 300.0
        estres_cal = min(95.0, base_cal + ind_density)
        
        # Calibraciones específicas basadas en datos reales
        nombre_lower = nombre.lower()
        if "mantaro" in nombre_lower:
            estres_cal = 85.0
        elif "chili" in nombre_lower or "quilca" in nombre_lower:
            estres_cal = 75.0
        elif "rímac" in nombre_lower or "rimac" in nombre_lower:
            estres_cal = 82.0
        elif "ica" in nombre_lower:
            estres_cal = 65.0
            
        # 3. Presión de Demanda (0-100) - Poblacional y derechos
        pob_density = float(row["poblacion"]) / (float(row["area_km2"]) + 1.0)
        presion = min(100.0, (float(row["demanda"]) / (float(row["oferta"]) + 10.0)) * 70.0 + min(30.0, (pob_density / 150.0) * 30.0))
        
        if "rímac" in nombre_lower or "rimac" in nombre_lower:
            presion = 95.0
        elif "ica" in nombre_lower:
            presion = 92.0
            
        estres_cant = round(min(100.0, max(0.0, estres_cant)), 1)
        estres_cal = round(min(100.0, max(0.0, estres_cal)), 1)
        presion = round(min(100.0, max(0.0, presion)), 1)
        
        # 4. Índice Compuesto ISHT (coincidiendo con pesos de escenario neutro)
        w_cant = 0.5
        w_cal = 0.3
        w_pres = 0.2
        indice = (estres_cant * w_cant + estres_cal * w_cal + presion * w_pres)
        indice = round(min(100.0, max(0.0, indice)), 1)
        
        # 5. Semáforo compatible con recalculo.py
        if indice >= 66.0:
            semaforo = "rojo"
        elif indice >= 33.0:
            semaforo = "amarillo"
        else:
            semaforo = "azul"
            
        rows.append({
            "codigo": cod,
            "id": cod,
            "nombre": nombre,
            "vertiente": vertiente,
            "poblacion": int(row["poblacion"]),
            "oferta": float(row["oferta"]),
            "demanda": float(row["demanda"]),
            "demanda_pob": float(row["demanda_pob"]),
            "demanda_agr": float(row["demanda_agr"]),
            "demanda_ind": float(row["demanda_ind"]),
            "brecha": float(row["brecha"]),
            "estres_cantidad": estres_cant,
            "brecha_norm": estres_cant, # alias para compatibilidad
            "estres_calidad": estres_cal,
            "presion": presion,
            "indice": indice,
            "semaforo": semaforo,
            "precip_anual": float(row["precip_anual"]),
            "area_km2": float(row["area_km2"]),
            "escorrentia_mm": float(row["escorrentia_mm"])
        })
        
    return pd.DataFrame(rows)

