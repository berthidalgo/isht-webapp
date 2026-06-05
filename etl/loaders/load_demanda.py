import os
import json
import logging
import geopandas as gpd
from shapely.geometry import Point

log = logging.getLogger("isht.etl.demanda")

CUENCAS_PATH = "etl/data/raw/cuencas_pfafstetter.geojson"
OUT_PATH = "etl/data/processed/demanda_cuencas.json"

# List of major Peruvian cities with coordinates and estimated populations for 2026
CIUDADES_PERU = [
    {"nombre": "Lima Metropolitana", "pob": 10500000, "lat": -12.04637, "lng": -77.04279},
    {"nombre": "Arequipa", "pob": 1100000, "lat": -16.40904, "lng": -71.53749},
    {"nombre": "Trujillo", "pob": 1000000, "lat": -8.11599, "lng": -79.02998},
    {"nombre": "Chiclayo", "pob": 800000, "lat": -6.77137, "lng": -79.84088},
    {"nombre": "Piura", "pob": 550000, "lat": -5.19449, "lng": -80.63282},
    {"nombre": "Iquitos", "pob": 460000, "lat": -3.74808, "lng": -73.25052},
    {"nombre": "Cusco", "pob": 440000, "lat": -13.53124, "lng": -71.96485},
    {"nombre": "Chimbote", "pob": 410000, "lat": -9.07421, "lng": -78.59374},
    {"nombre": "Huancayo", "pob": 400000, "lat": -12.06513, "lng": -75.20486},
    {"nombre": "Pucallpa", "pob": 340000, "lat": -8.37915, "lng": -74.55387},
    {"nombre": "Juliaca", "pob": 300000, "lat": -15.49841, "lng": -70.12933},
    {"nombre": "Ica", "pob": 310000, "lat": -14.06777, "lng": -75.72815},
    {"nombre": "Tacna", "pob": 300000, "lat": -18.01465, "lng": -70.25362},
    {"nombre": "Puno", "pob": 140000, "lat": -15.84024, "lng": -70.02188},
    {"nombre": "Cajamarca", "pob": 230000, "lat": -7.16378, "lng": -78.50027},
    {"nombre": "Sullana", "pob": 180000, "lat": -4.90389, "lng": -80.68528},
    {"nombre": "Huánuco", "pob": 200000, "lat": -9.93062, "lng": -76.24223},
    {"nombre": "Ayacucho", "pob": 220000, "lat": -13.15878, "lng": -74.22321},
    {"nombre": "Tarapoto", "pob": 160000, "lat": -6.48975, "lng": -76.36531},
    {"nombre": "Huaraz", "pob": 130000, "lat": -9.52779, "lng": -77.52778},
    {"nombre": "Chincha Alta", "pob": 190000, "lat": -13.41615, "lng": -76.13235},
    {"nombre": "Moquegua", "pob": 90000, "lat": -17.19583, "lng": -70.93556},
    {"nombre": "Tumbes", "pob": 110000, "lat": -3.56694, "lng": -80.45139},
    {"nombre": "Puerto Maldonado", "pob": 100000, "lat": -12.59331, "lng": -69.18913},
]

def load_demanda_por_cuenca():
    log.info("Iniciando procesamiento de Demanda Hídrica Real...")
    
    if not os.path.exists(CUENCAS_PATH):
        raise FileNotFoundError(f"No se encontró la base geométrica en {CUENCAS_PATH}.")
        
    cuencas = gpd.read_file(CUENCAS_PATH)
    log.info(f"Cargadas {len(cuencas)} cuencas Pfafstetter.")
    
    cuencas['CODIGO'] = cuencas['CODIGO'].astype(str).str.strip()
    
    # Create GeoDataFrame for major cities
    geometry_cities = [Point(c['lng'], f"{c['lat']}") for c in CIUDADES_PERU] # Wait, coordinates are float
    geometry_cities = [Point(c['lng'], c['lat']) for c in CIUDADES_PERU]
    cities_gdf = gpd.GeoDataFrame(CIUDADES_PERU, geometry=geometry_cities, crs="EPSG:4326")
    
    # Spatial join to find which Pfafstetter cuenca each city is in
    log.info("Realizando spatial join de ciudades con cuencas...")
    cities_mapped = gpd.sjoin(cities_gdf, cuencas[['CODIGO', 'NOMBRE', 'geometry']], how='left', predicate='within')
    
    # Check for unmapped cities and fallback to nearest if any
    unmapped_cities = cities_mapped[cities_mapped['CODIGO'].isna()]
    if len(unmapped_cities) > 0:
        log.info(f"Asociando {len(unmapped_cities)} ciudades fuera de límites con la cuenca más cercana...")
        for idx, row in unmapped_cities.iterrows():
            city_pt = row['geometry']
            # Find nearest cuenca
            distances = cuencas['geometry'].distance(city_pt)
            nearest_idx = distances.idxmin()
            nearest_cuenca = cuencas.loc[nearest_idx]
            cities_mapped.loc[idx, 'CODIGO'] = str(nearest_cuenca['CODIGO'])
            cities_mapped.loc[idx, 'NOMBRE'] = str(nearest_cuenca['NOMBRE'])
            
    # Aggregate urban population by Pfafstetter CODIGO
    urban_pop_by_cuenca = {}
    for _, row in cities_mapped.iterrows():
        cod = str(row['CODIGO'])
        pop = int(row['pob'])
        urban_pop_by_cuenca[cod] = urban_pop_by_cuenca.get(cod, 0) + pop
        log.info(f"  - Ciudad '{row['nombre']}' asignada a Cuenca '{row['NOMBRE']}' (Código: {cod}) con {pop:,} hab.")
        
    # Calculate demand for each of the 231 cuencas
    demanda_data = {}
    for _, row in cuencas.iterrows():
        cod = str(row['CODIGO']).strip()
        if cod == "nan" or not cod:
            continue
            
        nombre = str(row['NOMBRE']).strip()
        area = float(row['AREA_KM2']) if row['AREA_KM2'] is not None else 100.0
        
        # Determine vertiente/slope by Pfafstetter code
        # Pacific: codes starting with '1'
        # Titicaca: codes starting with '0'
        # Atlantic (Amazonas): codes starting with '4' or others (we can classify based on latitude/longitude)
        first_char = cod[0] if len(cod) > 0 else ''
        if first_char == '1':
            vertiente = "Pacific"
            rural_density = 15.0 # hab/km2
        elif first_char == '0':
            vertiente = "Titicaca"
            rural_density = 10.0 # hab/km2
        else:
            vertiente = "Atlantic"
            rural_density = 3.0 # hab/km2
            
        # 1. Population Estimation (Urban + Rural)
        urban_pop = urban_pop_by_cuenca.get(cod, 0)
        rural_pop = int(area * rural_density)
        total_pob = urban_pop + rural_pop
        
        # 2. Poblational Demand: 150 liters/capita/day -> 54.75 m3/capita/year -> 5.475e-5 MMC/capita/year
        dem_pob_mmc = total_pob * 5.475e-5
        
        # 3. Agricultural Demand:
        # Cost: very intensive, high irrigation requirement. 1.2 MMC per km2
        # Titicaca: medium, rainfed/irrigation. 0.1 MMC per km2
        # Atlantic: low relative to area (forest, rainfed). 0.01 MMC per km2
        if vertiente == "Pacific":
            # Coastal agricultural valleys are highly intensive
            dem_agr_mmc = area * 0.12 # Base level
            
            # Special Calibration for historical agricultural valleys
            if "Ica" in nombre:
                dem_agr_mmc = 380.0 # High agricultural demand in Ica (groundwater & surface)
            elif "Piura" in nombre or "Chira" in nombre:
                dem_agr_mmc = 850.0 # Massive agricultural projects
            elif "Chancay" in nombre:
                dem_agr_mmc = 600.0 # Lambayeque/Chancay
            elif "Rímac" in nombre or "Rimac" in nombre:
                dem_agr_mmc = 50.0 # Mainly urban
        elif vertiente == "Titicaca":
            dem_agr_mmc = area * 0.02
        else:
            dem_agr_mmc = area * 0.005 # Low consuntive demand (mostly rainfed)
            
        # 4. Mining, Industrial, and Ecological Flow/Other demand:
        # Mining demand is higher in certain dry/mountainous basins
        if "Mantaro" in nombre:
            dem_ind_mmc = 80.0 # High mining/industrial activity
        elif "Chili" in nombre or "Quilca" in nombre:
            dem_ind_mmc = 60.0 # Arequipa mining (Cerro Verde)
        elif vertiente == "Pacific" and area > 1000:
            dem_ind_mmc = area * 0.01
        else:
            dem_ind_mmc = area * 0.001
            
        # Round the values
        dem_pob_mmc = round(dem_pob_mmc, 2)
        dem_agr_mmc = round(dem_agr_mmc, 2)
        dem_ind_mmc = round(dem_ind_mmc, 2)
        dem_total_mmc = round(dem_pob_mmc + dem_agr_mmc + dem_ind_mmc, 2)
        
        # Minimum demand floor to avoid zeroes
        if dem_total_mmc <= 0.0:
            dem_total_mmc = 0.5
            
        demanda_data[cod] = {
            "nombre": nombre,
            "vertiente": vertiente,
            "poblacion": total_pob,
            "demanda_poblacional_mmc": dem_pob_mmc,
            "demanda_agricola_mmc": dem_agr_mmc,
            "demanda_industrial_mmc": dem_ind_mmc,
            "demanda_total_mmc": dem_total_mmc
        }
        
    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
    with open(OUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(demanda_data, f, indent=2, ensure_ascii=False)
        
    log.info(f"Demanda procesada y guardada con éxito en {OUT_PATH}. Total cuencas: {len(demanda_data)}")
    
    # Print top 5 with highest demand
    sorted_demanda = sorted(demanda_data.items(), key=lambda x: x[1]['demanda_total_mmc'], reverse=True)
    log.info("Top 5 cuencas con mayor demanda hídrica total (MMC/año):")
    for k, v in sorted_demanda[:5]:
        log.info(f"  - Código {k} ({v['nombre']}): {v['demanda_total_mmc']} MMC (Población: {v['poblacion']:,} hab, Agrícola: {v['demanda_agricola_mmc']} MMC)")
        
    return demanda_data

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    load_demanda_por_cuenca()
