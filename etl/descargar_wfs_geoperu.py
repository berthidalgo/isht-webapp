import sys
import os
import argparse
import json
import requests

DEFAULT_REST_URL = "https://geosnirh.ana.gob.pe/server/rest/services/P%C3%BAblico/SERV_AguasContiLoticos/MapServer"

def main():
    parser = argparse.ArgumentParser(description="Descargar Cuencas desde ArcGIS REST API de ANA (Fallback WFS)")
    parser.add_argument("--url", default=DEFAULT_REST_URL, help="URL base del MapServer")
    parser.add_argument("--layer", default="37", help="ID de la capa (37 para RiosQuebradas en este servidor)")
    parser.add_argument("--out", default="data/raw/cuencas_pfafstetter.geojson", help="Ruta de salida")
    
    args = parser.parse_args()
    
    print(f"\n[*] [ISHT-ETL] Iniciando conexion a ArcGIS REST (Fallback documentado en Master Plan)...")
    print(f"[*] URL: {args.url}")
    
    # 1. Verificar el servicio
    try:
        resp = requests.get(f"{args.url}?f=json", timeout=15)
        resp.raise_for_status()
        service_info = resp.json()
        if "error" in service_info:
            print(f"[-] Error del servidor: {service_info['error']}")
            sys.exit(1)
            
        print(f"[+] Conexion exitosa. Servicio: {service_info.get('mapName', 'Desconocido')}")
        print("[*] Capas disponibles en este MapServer:")
        for layer in service_info.get("layers", []):
            print(f"    - ID: {layer['id']} | Nombre: {layer['name']}")
            
    except Exception as e:
        print(f"[-] Error al conectar al servicio REST: {e}")
        sys.exit(1)
        
    print(f"\n[*] Descargando capa ID {args.layer} en formato GeoJSON...")
    query_url = f"{args.url}/{args.layer}/query"
    params = {
        "where": "1=1",
        "outFields": "*",
        "outSR": "4326",
        "f": "geojson"
    }
    
    try:
        resp = requests.get(query_url, params=params, timeout=60)
        resp.raise_for_status()
        
        out_dir = os.path.dirname(args.out)
        if out_dir:
            os.makedirs(out_dir, exist_ok=True)
            
        with open(args.out, 'wb') as f:
            f.write(resp.content)
            
        print(f"[+] Descarga completada con exito. Archivo guardado en: {args.out}")
        
        print("[*] Verificando integridad del archivo GeoJSON...")
        with open(args.out, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        features = data.get('features', [])
        print(f"[+] [EXITO] Archivo validado. Contiene {len(features)} features (unidades hidrograficas).")
        if features:
            print(f"    Muestra de propiedades extraidas: {list(features[0].get('properties', {}).keys())[:5]}")
            
    except Exception as e:
        print(f"[-] Error durante la descarga: {e}")

if __name__ == "__main__":
    main()
