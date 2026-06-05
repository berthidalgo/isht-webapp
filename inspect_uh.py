import requests

url = "https://geosnirh.ana.gob.pe/server/rest/services/ws_UnidadesHidro/MapServer/1/query"
params = {
    "where": "1=1",
    "outFields": "*",
    "resultRecordCount": 1,
    "f": "json"
}
try:
    resp = requests.get(url, params=params, verify=False)
    data = resp.json()
    print("Fields:")
    for f in data.get("fields", []):
        print(f" - {f['name']}")
    print("Sample feature properties:")
    if data.get("features"):
        print(data["features"][0].get("attributes"))
except Exception as e:
    print(e)
