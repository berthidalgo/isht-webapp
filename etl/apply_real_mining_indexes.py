"""Script para aplicar el análisis geoespacial real de Concesiones y PAMs sobre la malla de cuencas de ISHT.
Realiza intersección de polígonos (gpd.overlay) dissolved por cuenca y spatial join (gpd.sjoin) para PAMs.
Actualiza backend/data/indice_isht.json y backend/data/cuencas.geojson.
"""
import os
import json
import logging
import math
from pathlib import Path
import geopandas as gpd
import pandas as pd
from shapely.ops import unary_union

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
log = logging.getLogger("apply_real_mining")

# Conflictos socio-ambientales reales de la Defensoría del Pueblo para el sector minero
CONFLICTOS_REALE = {
    "MANTARO": 4,
    "CHILI": 2,
    "QUILCA": 2,
    "TAMBO": 5,      # Conflicto emblemático de Tía María
    "SANTA": 3,
    "LLALLIMAYO": 3,
    "COATA": 3,
    "TITICACA": 2,
    "OSMORE": 2,
    "MOQUEGUA": 2,   # Quellaveco, Southern Copper
    "ILO": 2,
    "LOCUMBA": 1,
    "SAMA": 1,
    "CHIRA": 1,
    "PIURA": 1,
    "JEQUETEPEQUE": 2,
    "VIRU": 1,
    "VIRÚ": 1,
    "MOCHE": 1,
    "CHICAMA": 2,
    "CAÑETE": 1,
    "RÍMAC": 2,
    "RIMAC": 2,
    "CHANCAL-LAMBAYEQUE": 1
}

def get_conflictos_activos(nombre_cuenca):
    nombre_upper = nombre_cuenca.upper()
    for key, val in CONFLICTOS_REALE.items():
        if key in nombre_upper:
            return val
    return 0

def apply_real_mining_indexes():
    log.info("=== ENRIQUECIENDO ISHT CON ANÁLISIS GEOESPACIAL REAL DE MINERÍA ===")
    
    root_dir = Path(__file__).resolve().parent.parent
    backend_data_dir = root_dir / "backend" / "data"
    
    indice_path = backend_data_dir / "indice_isht.json"
    geojson_path = backend_data_dir / "cuencas.geojson"
    
    pam_geojson_path = root_dir / "data" / "raw" / "pam_ingemmet.geojson"
    concesiones_geojson_path = root_dir / "data" / "raw" / "concesiones_ingemmet.geojson"
    
    # 1. Validar existencia de datos
    if not pam_geojson_path.exists():
        log.error(f"Falta archivo de PAMs en {pam_geojson_path}. Ejecuta descargar_pam_ingemmet.py primero.")
        return
    if not concesiones_geojson_path.exists():
        log.error(f"Falta archivo de Concesiones en {concesiones_geojson_path}. Ejecuta descargar_concesiones_ingemmet.py primero.")
        return
    if not geojson_path.exists():
        log.error(f"Falta archivo de cuencas en {geojson_path}.")
        return
    if not indice_path.exists():
        log.error(f"Falta archivo de índices en {indice_path}. Ejecuta el pipeline hidrológico primero.")
        return

    # 2. Cargar datos espaciales
    log.info("Cargando malla de cuencas...")
    gdf_cuencas = gpd.read_file(geojson_path)
    log.info(f"Cargadas {len(gdf_cuencas)} cuencas.")
    
    log.info("Cargando Pasivos Ambientales Mineros (PAM)...")
    gdf_pam = gpd.read_file(pam_geojson_path)
    log.info(f"Cargados {len(gdf_pam)} PAMs.")
    
    log.info("Cargando Concesiones Mineras activas...")
    gdf_concesiones = gpd.read_file(concesiones_geojson_path)
    log.info(f"Cargadas {len(gdf_concesiones)} concesiones mineras.")

    # 3. Filtrar PAMs de Alto/Muy Alto Riesgo
    # Clasificación experta: relaves, cianuro, escorias, desmonte de mina, tajeos comunicados.
    high_risk_keywords = ['RELAVE', 'CIANURO', 'ESCORIA', 'DESMONTE', 'TAJEO', 'TAJO']
    
    def is_high_risk(subtipo):
        sub_str = str(subtipo).upper()
        for kw in high_risk_keywords:
            if kw in sub_str:
                return True
        return False
        
    gdf_pam['is_high_risk'] = gdf_pam['SUBTIPO'].apply(is_high_risk)
    gdf_pam_high = gdf_pam[gdf_pam['is_high_risk'] == True]
    log.info(f"Total PAMs clasificados como de Alto/Muy Alto Riesgo: {len(gdf_pam_high)}")

    # 4. Spatial Join para contar PAMs por Cuenca
    # Asegurar el mismo CRS para el spatial join
    if gdf_pam_high.crs != gdf_cuencas.crs:
        gdf_pam_high = gdf_pam_high.to_crs(gdf_cuencas.crs)
        
    log.info("Ejecutando gpd.sjoin para contar PAMs por cuenca...")
    pam_joined = gpd.sjoin(gdf_pam_high, gdf_cuencas, how="inner", predicate="within")
    pam_counts = pam_joined.groupby("CODIGO").size().to_dict()
    log.info(f"PAMs asociados espacialmente a {len(pam_counts)} cuencas.")

    # 5. Intersección de Polígonos para Concesiones
    # Proyectar a UTM 18S (EPSG:32718) para calcular áreas exactas en metros cuadrados
    log.info("Proyectando cuencas y concesiones a EPSG:32718 (UTM Zone 18S)...")
    gdf_cuencas_utm = gdf_cuencas.to_crs(epsg=32718)
    gdf_concesiones_utm = gdf_concesiones.to_crs(epsg=32718)
    
    # Añadir columna de área de cuenca en m2
    gdf_cuencas_utm['cuenca_area_m2'] = gdf_cuencas_utm.geometry.area
    
    log.info("Ejecutando gpd.overlay para intersección espacial de concesiones...")
    # Intersecar polígonos de concesiones con cuencas
    gdf_inter = gpd.overlay(gdf_concesiones_utm, gdf_cuencas_utm, how="intersection")
    log.info(f"Polígonos de intersección calculados: {len(gdf_inter)}")
    
    # Calcular área de concesiones por cuenca, disolviendo geometrías superpuestas
    concession_percentages = {}
    
    log.info("Calculando ratios de concesión real sin duplicidades (unary_union)...")
    for codigo in gdf_cuencas_utm['CODIGO'].unique():
        basin_inter = gdf_inter[gdf_inter['CODIGO'] == codigo]
        if not basin_inter.empty:
            # Hacer la unión disuelta de las concesiones que caen en esta cuenca
            union_geom = unary_union(basin_inter.geometry)
            concession_area_m2 = union_geom.area
            
            # Obtener el área total de la cuenca
            cuenca_area_m2 = gdf_cuencas_utm[gdf_cuencas_utm['CODIGO'] == codigo].iloc[0]['cuenca_area_m2']
            
            pct = (concession_area_m2 / cuenca_area_m2) * 100.0
            concession_percentages[codigo] = min(100.0, max(0.0, pct))
        else:
            concession_percentages[codigo] = 0.0

    # 6. Actualizar el archivo JSON índice_isht.json
    log.info(f"Cargando {indice_path}...")
    with open(indice_path, "r", encoding="utf-8") as f:
        indice_data = json.load(f)
        
    cuencas_list = indice_data.get("cuencas", [])
    
    updated_cuencas = []
    for c in cuencas_list:
        codigo = str(c["codigo"]).strip()
        nombre = c["nombre"]
        
        # Obtener valores espaciales reales
        pam_alto_riesgo = pam_counts.get(codigo, 0)
        area_concesionada_pct = concession_percentages.get(codigo, 0.0)
        conflictos_activos = get_conflictos_activos(nombre)
        
        # Estimar longitud de red fluvial (mantenemos aproximación de escala física)
        longitud_red_fluvial_km = max(50.0, float(c["area_km2"]) * 0.15)
        
        # --- CÁLCULO DEL ÍNDICE Compuesto ---
        # 1. Subíndice de Presión Geoespacial Minera (S_PGM, escala 0-100)
        # S_PGM = 0.5 * area_concesionada_pct + 0.5 * min(100, (pam / longitud_red) * 100)
        factor_pam = min(100.0, (pam_alto_riesgo / longitud_red_fluvial_km) * 100.0)
        s_pgm = 0.5 * area_concesionada_pct + 0.5 * factor_pam
        
        # 2. Subíndice de Exposición a Conflictos (S_EC, escala 0-100)
        # S_EC = conflictos_activos * 15 * (1 + min(2.0, ratio_escasez))
        ratio_escasez = max(0.0, float(c["demanda"]) / (float(c["oferta"]) + 0.1))
        s_ec = min(100.0, conflictos_activos * 15.0 * (1.0 + min(2.0, ratio_escasez)))
        
        # 3. Índice de Conflicto y Calidad Química Minera (I_CCM, escala 0-100)
        i_ccm = round(min(100.0, 0.6 * s_pgm + 0.4 * s_ec), 1)
        
        # Actualizar campos
        c["i_ccm"] = i_ccm
        c["area_concesionada_cabecera_pct"] = round(area_concesionada_pct, 2)
        c["pam_alto_riesgo"] = pam_alto_riesgo
        c["conflictos_activos"] = conflictos_activos
        
        updated_cuencas.append(c)
        
    indice_data["cuencas"] = updated_cuencas
    
    with open(indice_path, "w", encoding="utf-8") as f:
        json.dump(indice_data, f, indent=2, ensure_ascii=False)
    log.info(f"Guardados índices actualizados en {indice_path}")

    # 7. Actualizar el GeoJSON cuencas.geojson
    log.info(f"ActualizandoGeoJSON en {geojson_path} con las variables reales...")
    gdf_cuencas_output = gpd.read_file(geojson_path)
    gdf_cuencas_output["CODIGO"] = gdf_cuencas_output["CODIGO"].astype(str).str.strip()
    
    enriched_map = {c["codigo"]: c for c in updated_cuencas}
    
    for col in ["i_ccm", "area_concesionada_cabecera_pct", "pam_alto_riesgo", "conflictos_activos"]:
        gdf_cuencas_output[col] = gdf_cuencas_output["CODIGO"].map(
            lambda x: float(enriched_map[x][col]) if x in enriched_map else 0.0
        )
        # Agregar alias en mayúscula para compatibilidad de capas
        gdf_cuencas_output[f"ISHT_{col.upper()}"] = gdf_cuencas_output[col]
        
    gdf_cuencas_output.to_file(geojson_path, driver="GeoJSON")
    log.info("¡GeoJSON actualizado exitosamente con la información empírica de minería de INGEMMET!")

if __name__ == "__main__":
    apply_real_mining_indexes()
