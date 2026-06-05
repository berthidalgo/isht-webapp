"""Orquestador del ETL Real de ISHT.
Carga los datos reales de oferta (PISCO) y demanda,
calcula el balance y el índice compuesto, y exporta los artefactos finales.
"""
import os
import json
import logging
import pandas as pd
import geopandas as gpd

from transforms.balance import calcular_balance
from transforms.indice import construir_indice
from exporters.export_artifacts import exportar

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
log = logging.getLogger("isht.etl.real")

OFERTA_PATH = "data/processed/oferta_pisco.json"
DEMANDA_PATH = "data/processed/demanda_cuencas.json"
CUENCAS_GEOJSON = "data/raw/cuencas_pfafstetter.geojson"

def main():
    log.info("Iniciando Orquestador ETL Real ISHT...")
    
    # Verificar que los archivos existan
    if not os.path.exists(CUENCAS_GEOJSON):
        log.error(f"Falta malla de cuencas en {CUENCAS_GEOJSON}. Por favor ejecuta load_geoperu_wfs.py primero.")
        return
    if not os.path.exists(OFERTA_PATH):
        log.error(f"Falta datos de oferta real en {OFERTA_PATH}. Ejecutando load_oferta.py...")
        # Intenta ejecutar load_oferta.py si no existe
        from loaders.load_oferta import process_pisco_oferta
        process_pisco_oferta()
    if not os.path.exists(DEMANDA_PATH):
        log.error(f"Falta datos de demanda real en {DEMANDA_PATH}. Ejecutando load_demanda.py...")
        # Intenta ejecutar load_demanda.py si no existe
        from loaders.load_demanda import load_demanda_por_cuenca
        load_demanda_por_cuenca()

    # 1. Cargar datos
    log.info(f"Cargando malla de cuencas desde {CUENCAS_GEOJSON}...")
    gdf_cuencas = gpd.read_file(CUENCAS_GEOJSON)
    log.info(f"Cargados {len(gdf_cuencas)} registros geográficos.")

    log.info(f"Cargando oferta real desde {OFERTA_PATH}...")
    with open(OFERTA_PATH, 'r', encoding='utf-8') as f:
        oferta_dict = json.load(f)
        
    log.info(f"Cargando demanda real desde {DEMANDA_PATH}...")
    with open(DEMANDA_PATH, 'r', encoding='utf-8') as f:
        demanda_dict = json.load(f)

    # 2. Calcular balance
    log.info("Calculando balance hídrico...")
    df_balance = calcular_balance(oferta_dict, demanda_dict)
    log.info(f"Balance calculado para {len(df_balance)} cuencas.")

    # 3. Construir índice
    log.info("Construyendo índice ISHT compuesto...")
    df_indice = construir_indice(df_balance)
    log.info(f"Índice construido.")

    # 4. Exportar
    log.info("Exportando artefactos finales...")
    exportar(gdf_cuencas, df_indice)
    log.info("ETL Real completado exitosamente.")

if __name__ == "__main__":
    main()
