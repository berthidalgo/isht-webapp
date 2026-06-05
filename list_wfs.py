import logging
import requests
from owslib.wfs import WebFeatureService

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("isht.etl.geoperu")

wfs_url = "https://geosnirh.ana.gob.pe/server/services/Público/SERV_UnidadesHidrograficas/MapServer/WFSServer"
try:
    wfs = WebFeatureService(url=wfs_url, version="2.0.0")
    print(f"Capas disponibles en {wfs_url}:")
    for layer in list(wfs.contents):
        print(f" - {layer}")
except Exception as e:
    print("Error:", e)
    
rest_url = "https://geosnirh.ana.gob.pe/server/rest/services/Público/SERV_UnidadesHidrograficas/MapServer?f=json"
resp = requests.get(rest_url, verify=False)
if resp.status_code == 200:
    data = resp.json()
    print("REST Layers:")
    for layer in data.get("layers", []):
        print(layer)
