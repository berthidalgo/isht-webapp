"""Carga la data primigenia desde servicios WFS de GeoPerú/GEOIDEP.
CUMPLE bases GEOTÓN §9/§11 (admisibilidad). Cachea para idempotencia y anti-caída.

Este es el PRIMER paso del ETL y el requisito bloqueante del concurso:
sin al menos un dataset de GeoPerú, eliminación antes de evaluar.
"""
import os
import logging

import geopandas as gpd
from owslib.wfs import WebFeatureService
from tenacity import retry, stop_after_attempt, wait_exponential

log = logging.getLogger("isht.etl.geoperu")
CACHE = "data/raw/cuencas_pfafstetter.geojson"


@retry(stop=stop_after_attempt(5), wait=wait_exponential(multiplier=2, max=60))
def _descargar_wfs(url_wfs: str, typename: str) -> gpd.GeoDataFrame:
    """Descarga una capa WFS con backoff exponencial (HIDATA Principio 8)."""
    wfs = WebFeatureService(url=url_wfs, version="2.0.0")
    resp = wfs.getfeature(typename=typename, outputFormat="application/json")
    return gpd.read_file(resp)


def load_cuencas_geoperu(url_wfs: str, typename: str) -> gpd.GeoDataFrame:
    """Carga cuencas; usa cache si existe (idempotencia + inmunidad a caída)."""
    if os.path.exists(CACHE):
        log.info("Cache hit: %s (no se re-descarga)", CACHE)
        return gpd.read_file(CACHE)
    log.info("Descargando cuencas desde WFS GeoPerú/GEOIDEP...")
    gdf = _descargar_wfs(url_wfs, typename).to_crs(epsg=4326)
    os.makedirs("data/raw", exist_ok=True)
    gdf.to_file(CACHE, driver="GeoJSON")
    log.info("Cuencas cacheadas: %d features", len(gdf))
    return gdf
