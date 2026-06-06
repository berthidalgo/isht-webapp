"""Script para descargar todos los Pasivos Ambientales Mineros (PAM) de INGEMMET.
Descarga los 6,122 puntos mediante consultas en lotes por OBJECTID para evitar límites de paginación.
"""
import os
import requests
import json
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
log = logging.getLogger("descargar_pam")

URL_PAM = "https://geocatmin.ingemmet.gob.pe/arcgis/rest/services/SERV_PASIVO_AMBIENTAL/MapServer/0/query"
OUTPUT_FILE = "data/raw/pam_ingemmet.geojson"

def descargar_pam():
    log.info("Iniciando descarga de Pasivos Ambientales Mineros (PAM)...")
    
    # Asegurar que el directorio de salida exista
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    
    all_features = []
    chunk_size = 1000  # maxRecordCount del servidor es 1000
    start_id = 1
    empty_runs = 0
    max_empty_runs = 5
    
    while True:
        end_id = start_id + chunk_size
        where_clause = f"OBJECTID >= {start_id} AND OBJECTID < {end_id}"
        log.info(f"Descargando lote: {where_clause}...")
        
        params = {
            "where": where_clause,
            "outFields": "*",
            "f": "geojson",
            "outSR": "4326"
        }
        
        try:
            resp = requests.get(URL_PAM, params=params, timeout=40)
            resp.raise_for_status()
            data = resp.json()
            
            features = data.get("features", [])
            log.info(f"Lote recuperado exitosamente. Características encontradas: {len(features)}")
            
            if not features:
                empty_runs += 1
                if empty_runs >= max_empty_runs:
                    log.info("Llegamos al final de los registros disponibles.")
                    break
            else:
                empty_runs = 0
                all_features.extend(features)
                
            # Si recuperamos menos de 1000 y ya estamos en un rango alto, puede ser el lote final
            if len(features) < chunk_size and start_id > 6000:
                log.info("Lote final alcanzado. Terminando descarga.")
                break
                
        except Exception as e:
            log.error(f"Error descargando lote {where_clause}: {e}")
            break
            
        start_id = end_id
        
    log.info(f"Descarga finalizada. Total de características recuperadas: {len(all_features)}")
    
    # Crear estructura GeoJSON estándar
    geojson_data = {
        "type": "FeatureCollection",
        "crs": {
            "type": "name",
            "properties": {
                "name": "urn:ogc:def:crs:OGC:1.3:CRS84"
            }
        },
        "features": all_features
    }
    
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(geojson_data, f, indent=2, ensure_ascii=False)
        
    log.info(f"Archivo GeoJSON guardado exitosamente en {OUTPUT_FILE}")

if __name__ == "__main__":
    descargar_pam()
