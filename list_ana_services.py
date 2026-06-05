import requests

url = "https://geosnirh.ana.gob.pe/server/rest/services/Público?f=json"
print("Consultando:", url)
try:
    resp = requests.get(url, verify=False)
    data = resp.json()
    print("Services in Público folder:")
    for s in data.get("services", []):
        if "Unidades" in s["name"] or "Hidro" in s["name"] or "Cuencas" in s["name"]:
            print(s["name"], s["type"])
except Exception as e:
    print(e)
