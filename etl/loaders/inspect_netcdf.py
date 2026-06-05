import xarray as xr

nc_path = "etl/data/raw/netcdf_extracted/netcdf/PISCO_HyM_GR2M_v1.1.nc"
ds = xr.open_dataset(nc_path, decode_times=False)
print("Dataset:")
print(ds)
print("\nDimensions:")
print(ds.dims)
print("\nVariables:")
print(list(ds.variables.keys()))
print("\nCoordinates:")
print(ds.coords)

# Print a small slice of some variables
print("\nSample values for 'ru' (first 2 time steps, first 5 comids):")
if 'ru' in ds.variables:
    print(ds['ru'].isel(time=slice(0, 2), comid=slice(0, 5)).values)
    
if 'pr' in ds.variables:
    print("\nSample values for 'pr' (first 2 time steps, first 5 comids):")
    print(ds['pr'].isel(time=slice(0, 2), comid=slice(0, 5)).values)

if 'time' in ds.variables:
    print("\nTime variable (first 10 values):")
    print(ds['time'].isel(time=slice(0, 10)).values)
