import os
import logging
import argparse
import geopandas as gpd
import requests
from tenacity import retry, stop_after_attempt, wait_exponential

log = logging.getLogger("isht.etl.geoperu")
CACHE = "data/raw/cuencas_pfafstetter.geojson"

@retry(stop=stop_after_attempt(5), wait=wait_exponential(multiplier=2, max=60))
def _descargar_pagina(url: str, offset: int, limit: int) -> dict:
    """Descarga una página de características de la API ArcGIS REST de ANA."""
    log.info(f"Descargando cuencas (offset={offset}, limit={limit})...")
    params = {
        "where": "1=1",
        "outFields": "*",
        "outSR": "4326",
        "resultOffset": offset,
        "resultRecordCount": limit,
        "f": "geojson"
    }
    resp = requests.get(url, params=params, verify=False, timeout=120)
    resp.raise_for_status()
    return resp.json()

def load_cuencas_geoperu(url: str) -> gpd.GeoDataFrame:
    """Carga todas las cuencas; usa cache si existe (idempotencia)."""
    if os.path.exists(CACHE):
        log.info("Cache hit: %s (no se re-descarga)", CACHE)
        return gpd.read_file(CACHE)
        
    log.info("Descargando todas las cuencas desde ANA (Paginado)...")
    offset = 0
    limit = 50
    all_features = []
    
    while True:
        data = _descargar_pagina(url, offset, limit)
        features = data.get("features", [])
        if not features:
            break
        all_features.extend(features)
        log.info(f"Descargadas {len(features)} cuencas. Total acumulado: {len(all_features)}")
        if len(features) < limit:
            break
        offset += limit
        
    if not all_features:
        raise ValueError("No se descargaron cuencas de la API de ANA.")
        
    # Creamos un GeoDataFrame a partir de las características acumuladas
    gdf = gpd.GeoDataFrame.from_features(all_features, crs="EPSG:4326")
    
    os.makedirs(os.path.dirname(CACHE), exist_ok=True)
    gdf.to_file(CACHE, driver="GeoJSON")
    log.info("Cuencas cacheadas: %d features", len(gdf))
    return gdf

if __name__ == "__main__":
    import urllib3
    urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
    logging.basicConfig(level=logging.INFO)
    parser = argparse.ArgumentParser()
    # REST de ANA para unidades hidrográficas
    parser.add_argument("--url", default="https://geosnirh.ana.gob.pe/server/rest/services/ws_UnidadesHidro/MapServer/1/query")
    args = parser.parse_args()
    
    try:
        # Forzamos re-descarga si queremos actualizar la cache de 113 a 231
        if os.path.exists(CACHE):
            os.remove(CACHE)
            log.info("Removiendo cache vieja de 113 cuencas para reconstruir la completa...")
            
        gdf = load_cuencas_geoperu(args.url)
        print(f"\n[+] ÉXITO: {len(gdf)} unidades hidrográficas descargadas.")
        print(f"[+] Requisito GeoPerú/GEOIDEP (WFS/REST) CUMPLIDO: Cuencas Pfafstetter Obtenidas.")
    except Exception as e:
        log.error(f"Error descargando REST: {e}")
