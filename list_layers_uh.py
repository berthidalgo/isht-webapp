import requests

url = "https://geosnirh.ana.gob.pe/server/rest/services/ws_UnidadesHidro/MapServer?f=json"
print("Consultando:", url)
try:
    resp = requests.get(url, verify=False)
    data = resp.json()
    print("Layers in ws_UnidadesHidro:")
    for layer in data.get("layers", []):
        print(f"ID: {layer['id']} | Name: {layer['name']}")
except Exception as e:
    print(e)
