import geopandas as gpd

shp_path = "etl/data/raw/shapefile_extracted/shapefile/Subbasins_HyM_GR2M.shp"
gdf = gpd.read_file(shp_path)
print("CRS:", gdf.crs)
print("Fields:", list(gdf.columns))
print("First 3 rows:")
print(gdf.head(3))
print("Total rows:", len(gdf))
