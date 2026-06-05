import os
import requests
import subprocess
import logging

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("isht.download_shapefile")

URL_SHAPEFILE_RAR = "https://ndownloader.figshare.com/files/27479351"
RAR_PATH = "etl/data/raw/shapefile.rar"
EXTRACT_DIR = "etl/data/raw/shapefile_extracted"

def download_shapefile():
    if os.path.exists(RAR_PATH):
        log.info(f"El rar del shapefile ya existe en {RAR_PATH}")
        return
    log.info(f"Descargando shapefile.rar desde Figshare: {URL_SHAPEFILE_RAR}")
    os.makedirs(os.path.dirname(RAR_PATH), exist_ok=True)
    resp = requests.get(URL_SHAPEFILE_RAR, stream=True, timeout=120)
    resp.raise_for_status()
    with open(RAR_PATH, "wb") as f:
        for chunk in resp.iter_content(chunk_size=8192):
            if chunk:
                f.write(chunk)
    log.info("Descarga de shapefile.rar completada.")

def extract_shapefile():
    if os.path.exists(EXTRACT_DIR) and os.listdir(EXTRACT_DIR):
        log.info(f"Directorio de extraccion del shapefile ya existe: {EXTRACT_DIR}")
        return
    log.info(f"Extrayendo {RAR_PATH} usando WinRAR UnRAR.exe...")
    os.makedirs(EXTRACT_DIR, exist_ok=True)
    
    # Executing: C:\Program Files\WinRAR\UnRAR.exe x etl/data/raw/shapefile.rar etl/data/raw/shapefile_extracted/
    unrar_path = r"C:\Program Files\WinRAR\UnRAR.exe"
    try:
        res = subprocess.run([unrar_path, "x", "-y", RAR_PATH, EXTRACT_DIR], 
                             capture_output=True, text=True, check=True)
        log.info("Extraccion completada con exito.")
        log.info(f"Archivos extraidos: {os.listdir(EXTRACT_DIR)}")
    except Exception as e:
        log.error(f"Error al extraer con UnRAR.exe: {e}")
        raise e

if __name__ == "__main__":
    download_shapefile()
    extract_shapefile()
