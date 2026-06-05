import os
import geopandas as gpd

INPUT_PATH = "backend/data/cuencas.geojson"
OUTPUT_PATH = "backend/data/cuencas_simplified.geojson"

def simplify_geojson():
    print("=== INICIANDO OPTIMIZACIÓN Y SIMPLIFICACIÓN GEOSPACIAL (RED TEAM STAFF ENGINEER) ===")
    
    if not os.path.exists(INPUT_PATH):
        print(f"Error: No se encuentra el archivo {INPUT_PATH}")
        return
        
    initial_size_mb = os.path.getsize(INPUT_PATH) / (1024 * 1024)
    print(f"Tamaño original: {initial_size_mb:.2f} MB")
    
    print("Cargando GeoJSON con GeoPandas (esto puede tomar unos segundos)...")
    gdf = gpd.read_file(INPUT_PATH)
    print(f"Total de polígonos cargados: {len(gdf)}")
    
    # Tolerancia de simplificación en grados decimales (WGS84).
    # 0.002 grados son ~220 metros. Excelente para mantener visuales nítidos de cuencas en mapas web.
    tolerance = 0.002
    print(f"Aplicando algoritmo de simplificación con tolerancia: {tolerance} grados...")
    
    # Guardamos las propiedades antes de simplificar
    geom_simplified = gdf.geometry.simplify(tolerance=tolerance, preserve_topology=True)
    gdf_simplified = gdf.copy()
    gdf_simplified.geometry = geom_simplified
    
    print("Exportando GeoJSON simplificado...")
    # Guardamos temporalmente en el output path
    gdf_simplified.to_file(OUTPUT_PATH, driver="GeoJSON")
    
    final_size_mb = os.path.getsize(OUTPUT_PATH) / (1024 * 1024)
    reduction = (1 - (final_size_mb / initial_size_mb)) * 100
    print(f"\n¡ÉXITO EN LA SIMPLIFICACIÓN!")
    print(f"Tamaño simplificado: {final_size_mb:.2f} MB")
    print(f"Porcentaje de reducción de tamaño: {reduction:.2f}%")
    
    # Reemplazar el archivo original con la versión simplificada
    print("Reemplazando cuencas.geojson original con la versión optimizada...")
    if os.path.exists(INPUT_PATH):
        os.remove(INPUT_PATH)
    os.rename(OUTPUT_PATH, INPUT_PATH)
    print("¡Listo! Archivo cuencas.geojson optimizado con éxito.")

if __name__ == "__main__":
    simplify_geojson()
