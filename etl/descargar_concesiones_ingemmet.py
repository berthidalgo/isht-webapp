"""Script para descargar todas las concesiones mineras activas en los departamentos de interés.
Utiliza una estrategia de ID-chunking altamente eficiente para descargar las 21,918 concesiones.
"""
import os
import requests
import json
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
log = logging.getLogger("descargar_concesiones")

URL_CATASTRO = "https://geocatmin.ingemmet.gob.pe/arcgis/rest/services/SERV_CATASTRO_MINERO_WGS84/MapServer/0/query"
OUTPUT_FILE = "data/raw/concesiones_ingemmet.geojson"

DEPARTAMENTOS = ['ICA', 'LA LIBERTAD', 'LAMBAYEQUE', 'PIURA', 'ANCASH', 'AREQUIPA', 'MOQUEGUA', 'TACNA']

def descargar_concesiones():
    log.info("Iniciando descarga de Concesiones Mineras activas usando ID-chunking...")
    
    # Asegurar que el directorio de salida exista
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    
    # Formatear el filtro de departamentos para SQL
    dep_list_str = ", ".join([f"'{d}'" for d in DEPARTAMENTOS])
    where_clause = (
        f"LEYENDA IN ('TITULADO', 'TRAMITE') AND "
        f"DEPA IN ({dep_list_str})"
    )
    
    # 1. Obtener todos los IDs de registros que coinciden
    log.info("Consultando todos los OBJECTIDs coincidentes...")
    params_ids = {
        "where": where_clause,
        "returnIdsOnly": "true",
        "f": "json"
    }
    
    try:
        resp_ids = requests.get(URL_CATASTRO, params=params_ids, timeout=30)
        resp_ids.raise_for_status()
        data_ids = resp_ids.json()
        object_ids = data_ids.get("objectIds", [])
        log.info(f"Se encontraron un total de {len(object_ids)} concesiones activas para descargar.")
        
        if not object_ids:
            log.warning("No se encontraron IDs para descargar.")
            return
            
    except Exception as e:
        log.error(f"Error consultando IDs coincidentes: {e}")
        return

    # 2. Dividir la lista de IDs en lotes de 1000
    chunk_size = 1000
    all_features = []
    
    for i in range(0, len(object_ids), chunk_size):
        chunk_ids = object_ids[i:i + chunk_size]
        ids_str = ",".join(map(str, chunk_ids))
        where_chunk = f"OBJECTID IN ({ids_str})"
        
        log.info(f"Descargando lote {i // chunk_size + 1} de {len(object_ids) // chunk_size + 1} ({len(chunk_ids)} features)...")
        
        params_chunk = {
            "where": where_chunk,
            "outFields": "OBJECTID,CODIGOU,CONCESION,TIT_CONCES,HECTAGIS,LEYENDA,DEPA,PROVI,DISTRI",
            "f": "geojson",
            "outSR": "4326"
        }
        
        try:
            resp_chunk = requests.get(URL_CATASTRO, params=params_chunk, timeout=60)
            resp_chunk.raise_for_status()
            data_chunk = resp_chunk.json()
            
            features = data_chunk.get("features", [])
            log.info(f"Lote recuperado. Concesiones descargadas: {len(features)}")
            all_features.extend(features)
            
        except Exception as e:
            log.error(f"Error descargando lote de IDs {i} a {i + chunk_size}: {e}")
            
    log.info(f"Descarga de concesiones completada. Total de características recuperadas: {len(all_features)}")
    
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
    descargar_concesiones()
