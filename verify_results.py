import json

def verify():
    print("=== INICIANDO VERIFICACIÓN DE ARTEFACTOS DEL ETLY ML ===")
    
    # 1. Leer indice_isht.json
    with open("backend/data/indice_isht.json", "r", encoding="utf-8") as f:
        data = json.load(f)
        
    cuencas = data.get("cuencas", [])
    print(f"Total de cuencas en indice_isht.json: {len(cuencas)}")
    
    # 2. Buscar Ica y La Libertad
    ica_found = []
    lalibertad_found = []
    
    for c in cuencas:
        nombre = c["nombre"].lower()
        if "ica" in nombre:
            ica_found.append(c)
        if "libertad" in nombre or "moche" in nombre or "chicama" in nombre or "viru" in nombre or "virú" in nombre:
            lalibertad_found.append(c)
            
    print("\n--- CUENCAS RELACIONADAS CON ICA ---")
    for c in ica_found:
        print(f"ID: {c['id']}, Código: {c['codigo']}, Nombre: {c['nombre']}, Índice: {c['indice']}, Semáforo: {c['semaforo']}")
        print(f"  Oferta: {c['oferta']} MMC, Demanda: {c['demanda']} MMC, Estres Cantidad: {c['estres_cantidad']}, Estres Calidad: {c['estres_calidad']}, Presión: {c['presion']}")
        
    print("\n--- CUENCAS RELACIONADAS CON LA LIBERTAD / CHAMA / VIRU ---")
    for c in lalibertad_found:
        print(f"ID: {c['id']}, Código: {c['codigo']}, Nombre: {c['nombre']}, Índice: {c['indice']}, Semáforo: {c['semaforo']}")
        print(f"  Oferta: {c['oferta']} MMC, Demanda: {c['demanda']} MMC, Estres Cantidad: {c['estres_cantidad']}, Estres Calidad: {c['estres_calidad']}, Presión: {c['presion']}")

    # 3. Validar nulos o NaNs
    nulls_count = 0
    for c in cuencas:
        for k, v in c.items():
            if v is None:
                nulls_count += 1
                print(f"NULO DETECTADO en cuenca {c['nombre']} ({c['codigo']}): clave '{k}' es None.")
                
    print(f"\nTotal de valores nulos o None detectados: {nulls_count}")
    
    # 4. Leer métricas del modelo
    with open("ml/metrics.json", "r", encoding="utf-8") as f:
        metrics = json.load(f)
    print("\n--- MÉTRICAS DEL MODELO XGBOOST ---")
    print(f"MAE: {metrics['mae']:.4f}")
    print(f"R2: {metrics['r2']:.4f}")
    print(f"Features Importance:")
    for feat, imp in metrics["feature_importance"].items():
        print(f"  - {feat}: {imp:.4f}")

if __name__ == "__main__":
    verify()
