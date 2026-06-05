import os
import sys
import json
from fastapi.testclient import TestClient

# Añadir el directorio backend al PATH de python para poder importar main
sys.path.insert(0, os.path.abspath("backend"))

from main import app

def test_all():
    print("=== INICIANDO PRUEBA DE COMPATIBILIDAD DE ENDPOINTS API (FASTAPI) ===")
    
    # Usar el TestClient con un bloque with para asegurar que se ejecuten los eventos de startup y shutdown
    with TestClient(app) as client:
        # 1. Test /health
        print("\n[1] Probando GET /health...")
        resp = client.get("/health")
        print(f"Status: {resp.status_code}")
        print(f"Response: {resp.json()}")
        assert resp.status_code == 200
        assert resp.json()["status"] == "ok"
        assert resp.json()["modelo"] is True, "El modelo ML debería estar cargado."
        
        # 2. Test /api/cuencas
        print("\n[2] Probando GET /api/cuencas...")
        resp = client.get("/api/cuencas")
        print(f"Status: {resp.status_code}")
        geojson = resp.json()
        print(f"Tipo: {geojson.get('type')}")
        print(f"Total features: {len(geojson.get('features', []))}")
        assert resp.status_code == 200
        assert geojson.get("type") == "FeatureCollection"
        assert len(geojson.get("features", [])) == 231
        
        # 3. Test /api/indice
        print("\n[3] Probando GET /api/indice...")
        resp = client.get("/api/indice")
        print(f"Status: {resp.status_code}")
        indice_data = resp.json()
        print(f"Total cuencas: {len(indice_data.get('cuencas', []))}")
        assert resp.status_code == 200
        assert len(indice_data.get("cuencas", [])) == 231
        
        # 4. Test /api/metrics
        print("\n[4] Probando GET /api/metrics...")
        resp = client.get("/api/metrics")
        print(f"Status: {resp.status_code}")
        metrics = resp.json()
        print(f"MAE: {metrics.get('mae')}, R2: {metrics.get('r2')}")
        assert resp.status_code == 200
        assert "mae" in metrics
        
        # 5. Test /api/predecir
        print("\n[5] Probando POST /api/predecir...")
        payload = {
            "oferta": 734.22,
            "demanda": 475.99,
            "poblacion": 800000,
            "precip_anual": 200.0,
            "escorrentia_mm": 120.5,
            "area_km2": 4500.0
        }
        resp = client.post("/api/predecir", json=payload)
        print(f"Status: {resp.status_code}")
        print(f"Predicción: {resp.json()}")
        assert resp.status_code == 200
        assert "indice_predicho" in resp.json()
        
        # 6. Test /api/simular
        print("\n[6] Probando POST /api/simular...")
        sim_payload = {
            "peso_cantidad": 0.4,
            "peso_calidad": 0.4,
            "peso_presion": 0.2,
            "el_nino": 1.2,
            "expansion_demanda": 0.1
        }
        resp = client.post("/api/simular", json=sim_payload)
        print(f"Status: {resp.status_code}")
        sim_res = resp.json()
        print(f"Total cuencas en simulación: {sim_res.get('n_cuencas')}")
        print(f"Top 3 cuencas más críticas en simulación:")
        for i, item in enumerate(sim_res.get("ranking", [])[:3]):
            print(f"  {i+1}. {item['nombre']} ({item['codigo']}): {item['indice']} - {item['semaforo']}")
        assert resp.status_code == 200
        assert sim_res.get("n_cuencas") == 231
        
        print("\n=== ¡TODAS LAS PRUEBAS DEL BACKEND SE COMPLETARON PERFECTAMENTE! ===")

if __name__ == "__main__":
    test_all()
