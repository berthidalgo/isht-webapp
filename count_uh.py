import requests

url = "https://geosnirh.ana.gob.pe/server/rest/services/ws_UnidadesHidro/MapServer/1/query"
params = {
    "where": "1=1",
    "returnCountOnly": "true",
    "f": "json"
}
try:
    resp = requests.get(url, params=params, verify=False)
    data = resp.json()
    print("Feature count:", data.get("count"))
except Exception as e:
    print(e)
