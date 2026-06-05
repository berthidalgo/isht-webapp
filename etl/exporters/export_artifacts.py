"""Escribe los artefactos que consume el backend:
  cuencas.geojson · indice_isht.json · tabla_features.parquet · tabla_features.csv
Luego se copian a backend/data/.
"""
import os
import json
import logging
import pandas as pd
import geopandas as gpd

log = logging.getLogger("isht.etl.exporter")

from pathlib import Path

def exportar(gdf_cuencas: gpd.GeoDataFrame, df_indice: pd.DataFrame):
    """Saves final products to backend/data/ and ml/data/ with absolute formatting alignment."""
    log.info("Iniciando exportación de artefactos finales...")
    
    # 1. Asegurar directorios de salida usando rutas absolutas relativas a la raíz del proyecto
    root_dir = Path(__file__).resolve().parent.parent.parent
    backend_data_dir = str(root_dir / "backend" / "data")
    ml_data_dir = str(root_dir / "ml" / "data")
    os.makedirs(backend_data_dir, exist_ok=True)
    os.makedirs(ml_data_dir, exist_ok=True)
    
    # 2. Formatear y exportar indice_isht.json (diccionario con llave 'cuencas' para compatibilidad)
    cuencas_list = []
    for _, row in df_indice.iterrows():
        cuencas_list.append({
            "id": row["id"],
            "codigo": row["codigo"],
            "nombre": row["nombre"],
            "vertiente": row["vertiente"],
            "poblacion": int(row["poblacion"]),
            "oferta": float(row["oferta"]),
            "demanda": float(row["demanda"]),
            "demanda_pob": float(row["demanda_pob"]),
            "demanda_agr": float(row["demanda_agr"]),
            "demanda_ind": float(row["demanda_ind"]),
            "brecha": float(row["brecha"]),
            "estres_cantidad": float(row["estres_cantidad"]),
            "brecha_norm": float(row["brecha_norm"]),
            "estres_calidad": float(row["estres_calidad"]),
            "presion": float(row["presion"]),
            "indice": float(row["indice"]),
            "semaforo": row["semaforo"],
            "precip_anual": float(row["precip_anual"]),
            "area_km2": float(row["area_km2"]),
            "escorrentia_mm": float(row["escorrentia_mm"])
        })
        
    indice_dict = {"cuencas": cuencas_list}
    
    indice_path = os.path.join(backend_data_dir, "indice_isht.json")
    with open(indice_path, 'w', encoding='utf-8') as f:
        json.dump(indice_dict, f, indent=2, ensure_ascii=False)
    log.info(f"Guardado {indice_path} con {len(cuencas_list)} registros.")
    
    # 3. Cruzar propiedades con el GeoJSON
    gdf_merged = gdf_cuencas.copy()
    gdf_merged["CODIGO"] = gdf_merged["CODIGO"].astype(str).str.strip()
    
    # Convertir df_indice a dict para mapeo ultra-rápido y seguro sin perder geometrías
    indice_map = df_indice.set_index("codigo").to_dict(orient="index")
    
    # Inyectar propiedades
    for col in [
        "oferta", "demanda", "brecha", "indice", "semaforo", 
        "estres_cantidad", "estres_calidad", "presion", "poblacion",
        "precip_anual"
    ]:
        gdf_merged[f"ISHT_{col.upper()}"] = gdf_merged["CODIGO"].map(
            lambda x: indice_map[x][col] if x in indice_map else (0.0 if col != "semaforo" else "azul")
        )
        # También minúsculas por si acaso
        gdf_merged[col] = gdf_merged["CODIGO"].map(
            lambda x: indice_map[x][col] if x in indice_map else (0.0 if col != "semaforo" else "azul")
        )
        
    cuencas_geojson_path = os.path.join(backend_data_dir, "cuencas.geojson")
    gdf_merged.to_file(cuencas_geojson_path, driver="GeoJSON")
    log.info(f"Guardado {cuencas_geojson_path} con éxito.")
    
    # 4. Guardar tablas de features para ML
    features_cols = ["oferta", "demanda", "poblacion", "precip_anual", "escorrentia_mm", "area_km2", "indice"]
    df_features = df_indice[features_cols]
    
    csv_path = os.path.join(ml_data_dir, "tabla_features.csv")
    df_features.to_csv(csv_path, index=False, encoding='utf-8')
    log.info(f"Guardado {csv_path} para entrenamiento offline.")
    
    try:
        parquet_path = os.path.join(ml_data_dir, "tabla_features.parquet")
        df_features.to_parquet(parquet_path, index=False)
        log.info(f"Guardado {parquet_path} con éxito.")
    except Exception as e:
        log.warning(f"No se pudo guardar {parquet_path} (probablemente falte pyarrow/fastparquet): {e}. Se utilizará el CSV para el ML.")
    
    print("[+] [ETL-EXPORTER] Todos los artefactos exportados exitosamente.")

