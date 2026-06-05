import os
import json
import logging
import geopandas as gpd

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("isht.map_pisco_pfafstetter")

CUENCAS_PATH = "etl/data/raw/cuencas_pfafstetter.geojson"
SUBBASINS_PATH = "etl/data/raw/shapefile_extracted/shapefile/Subbasins_HyM_GR2M.shp"
OUT_PATH = "etl/data/processed/pisco_pfafstetter_mapping.json"

def create_mapping():
    log.info("Cargando cuencas Pfafstetter...")
    cuencas = gpd.read_file(CUENCAS_PATH)
    log.info(f"Cargadas {len(cuencas)} cuencas Pfafstetter.")
    
    # Ensure columns like CODIGO and NOMBRE are strings/valid
    cuencas['CODIGO'] = cuencas['CODIGO'].astype(str).str.strip()
    cuencas['NOMBRE'] = cuencas['NOMBRE'].astype(str).str.strip()
    # Keep only relevant columns
    cuencas_sub = cuencas[['CODIGO', 'NOMBRE', 'geometry']]
    
    log.info("Cargando subcuencas PISCO...")
    subbasins = gpd.read_file(SUBBASINS_PATH)
    log.info(f"Cargadas {len(subbasins)} subcuencas PISCO.")
    
    # Create representative points (guaranteed to be inside the polygons)
    subbasins_rep = subbasins.copy()
    subbasins_rep['geometry'] = subbasins_rep.representative_point()
    
    # Spatial join
    log.info("Realizando spatial join (within)...")
    joined = gpd.sjoin(subbasins_rep, cuencas_sub, how='left', predicate='within')
    
    # Check if there are any unmapped subbasins (NaN CODIGO)
    unmapped = joined[joined['CODIGO'].isna()]
    log.info(f"Subcuencas sin asociar en primer join: {len(unmapped)}")
    
    if len(unmapped) > 0:
        log.info("Asociando subcuencas restantes mediante sjoin_nearest...")
        # Get unmapped subbasins from original subbasins rep
        unmapped_gdf = subbasins_rep[subbasins_rep['COMID'].isin(unmapped['COMID'])]
        
        # Project both to a meter-based CRS for accurate distance (e.g., EPSG:32718 - UTM 18S)
        # to find the nearest cuenca
        unmapped_proj = unmapped_gdf.to_crs(epsg=32718)
        cuencas_proj = cuencas_sub.to_crs(epsg=32718)
        
        nearest_joined = gpd.sjoin_nearest(unmapped_proj, cuencas_proj, how='left', max_distance=100000) # up to 100km
        
        # Merge back
        for _, row in nearest_joined.iterrows():
            comid = row['COMID']
            idx = joined[joined['COMID'] == comid].index
            if len(idx) > 0:
                joined.loc[idx, 'CODIGO'] = str(row['CODIGO'])
                joined.loc[idx, 'NOMBRE'] = str(row['NOMBRE'])
                
    # Check again
    still_unmapped = joined[joined['CODIGO'].isna()]
    log.info(f"Subcuencas sin asociar definitivas: {len(still_unmapped)}")
    
    # Build final mapping dictionary
    mapping_dict = {}
    for _, row in joined.iterrows():
        comid = int(row['COMID'])
        mapping_dict[str(comid)] = {
            "pfafstetter_codigo": str(row['CODIGO']) if not pd_isna(row['CODIGO']) else "UNKNOWN",
            "pfafstetter_nombre": str(row['NOMBRE']) if not pd_isna(row['NOMBRE']) else "UNKNOWN",
            "subbasin_area_km2": float(row['Area']) if not pd_isna(row['Area']) else 0.0,
            "vertiente": str(row['Vertiente']) if not pd_isna(row['Vertiente']) else "UNKNOWN"
        }
        
    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
    with open(OUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(mapping_dict, f, indent=2, ensure_ascii=False)
        
    log.info(f"Mapeo guardado con exito en {OUT_PATH}. Total subcuencas mapeadas: {len(mapping_dict)}")

def pd_isna(val):
    import pandas as pd
    return pd.isna(val) or val == 'nan' or val is None

if __name__ == "__main__":
    create_mapping()
