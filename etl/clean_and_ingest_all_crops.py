import pandas as pd
import glob
import os
import zipfile
import sqlite3

base_dir = "data_aduanet"
db_dir = "data/processed"
if not os.path.exists(db_dir):
    os.makedirs(db_dir)
db_path = os.path.join(db_dir, "aduanet_exports.db")

print("=== PIPELINE MAESTRO DE AGROEXPORTACIONES SANEADAS (SUNAT-STEALTH) ===")

# Lista de cultivos soportados y sus carpetas (incluimos arándano de forma preventiva)
crops = {
    "palta": ["palta"],
    "uva": ["uva"],
    "esparrago": ["esparrago", "esparargo", "esparargo_temp"],
    "arandano": ["arandano", "arandanos"]
}

# 1. Buscar qué carpetas reales existen en data_aduanet/ que coincidan con nuestros cultivos
active_crops = {}
for crop_key, folder_names in crops.items():
    found_folder = None
    for name in folder_names:
        test_path = os.path.join(base_dir, name)
        if os.path.isdir(test_path):
            found_folder = test_path
            break
    if found_folder:
        active_crops[crop_key] = found_folder

print(f"Cultivos activos identificados en el directorio: {list(active_crops.keys())}")

# 2. Mapeo de columnas oficiales de SUNAT
column_mapping = {
    'Partida Aduanera': 'CNAN',
    'Descripcion de la Partida Aduanera': 'DESCRIP',
    'Aduana': 'ADUA_DESC',
    'DUA / DAM': 'NDCL',
    'Fecha': 'FECHA',
    'Exportador': 'EXPORTADOR',
    'Importador': 'IMPORTADOR',
    'Kg Bruto': 'PESO_BRUTO',
    'Kg Neto': 'PESO_NETO',
    'U$ FOB Tot': 'FOB_DOLPOL',
    'Pais de Destino': 'PAIS_DESC',
    'Descripcion Comercial': 'DESC_COM'
}

additional_mapping = {
    'Via': 'VIA_TRANSP',
    'Agente de Aduana': 'CAGE_DESC',
    'Naviera': 'CEMPT_DESC',
}

full_mapping = {**column_mapping, **additional_mapping}

# 3. Procesar cada cultivo
for crop_name, crop_path in active_crops.items():
    print(f"\n======================================================================")
    print(f"PROCESANDO CULTIVO: {crop_name.upper()}")
    print(f"======================================================================")
    
    # Directorio de extracción específico
    extracted_crop_dir = os.path.join(base_dir, "extracted", crop_name)
    if not os.path.exists(extracted_crop_dir):
        os.makedirs(extracted_crop_dir)
        
    # Buscar todos los ZIPs de este cultivo
    zip_files = glob.glob(os.path.join(crop_path, "*.zip"))
    print(f"Archivos ZIP encontrados para {crop_name}: {len(zip_files)}")
    
    # Descomprimir todos los ZIPs
    for z_file in zip_files:
        print(f"  - Descomprimiendo: {os.path.basename(z_file)}")
        try:
            with zipfile.ZipFile(z_file, 'r') as z:
                z.extractall(extracted_crop_dir)
        except Exception as e:
            print(f"    Error al descomprimir {os.path.basename(z_file)}: {e}")
            
    # Buscar todos los archivos TSV descomprimidos (.xls de Veritrade)
    tsv_files = glob.glob(os.path.join(extracted_crop_dir, "*.xls"))
    print(f"Archivos de datos extraidos (.xls/TSV): {len(tsv_files)}")
    
    if not tsv_files:
        print(f"Advertencia: No se encontraron archivos de datos para {crop_name}. Saltando...")
        continue
        
    # Cargar y concatenar todos los TSV en memoria
    df_list = []
    for path in tsv_files:
        print(f"  - Cargando y saneando: {os.path.basename(path)}")
        try:
            df_chunk = pd.read_csv(path, sep='\t', encoding='latin-1', low_memory=False)
            print(f"    Filas cargadas: {len(df_chunk):,}")
            df_list.append(df_chunk)
        except Exception as e:
            print(f"    Error al cargar {os.path.basename(path)}: {e}")
            
    if not df_list:
        print(f"Error: No se pudieron unificar datos para {crop_name}.")
        continue
        
    df_unified = pd.concat(df_list, ignore_index=True)
    print(f"\n  Dimensiones unificadas de {crop_name.upper()}: {len(df_unified):,} filas, {df_unified.shape[1]} columnas")
    
    # Seleccionar y renombrar columnas al estándar oficial de SUNAT
    available_cols = {k: v for k, v in full_mapping.items() if k in df_unified.columns}
    df_sunat = df_unified[list(available_cols.keys())].rename(columns=available_cols).copy()
    
    # Limpieza de datos
    df_sunat["FECHA_DT"] = pd.to_datetime(df_sunat["FECHA"], errors='coerce')
    df_sunat["FECHA"] = df_sunat["FECHA_DT"].dt.strftime('%Y%m%d').astype(float).fillna(0).astype(int)
    
    df_sunat["FOB_DOLPOL"] = pd.to_numeric(df_sunat["FOB_DOLPOL"], errors='coerce').fillna(0.0)
    df_sunat["PESO_NETO"] = pd.to_numeric(df_sunat["PESO_NETO"], errors='coerce').fillna(0.0)
    df_sunat["PESO_BRUTO"] = pd.to_numeric(df_sunat["PESO_BRUTO"], errors='coerce').fillna(0.0)
    
    # Pasar textos a mayúsculas
    for txt_col in ["ADUA_DESC", "EXPORTADOR", "IMPORTADOR", "PAIS_DESC", "DESC_COM"]:
        if txt_col in df_sunat.columns:
            df_sunat[txt_col] = df_sunat[txt_col].astype(str).str.upper()
            
    df_sunat = df_sunat.drop(columns=["FECHA_DT"])
    
    # Guardar en SQLite
    table_name = f"exportaciones_{crop_name}"
    print(f"  Saneamiento completado. Guardando en SQLite {db_path} (Tabla: '{table_name}')...")
    try:
        conn = sqlite3.connect(db_path)
        df_sunat.to_sql(table_name, conn, if_exists="replace", index=False)
        conn.commit()
        conn.close()
        print(f"  ¡Exito rotundo! Datos de {crop_name} inyectados correctamente.")
    except Exception as e:
        print(f"  Error al inyectar en SQLite: {e}")
        
    # Estadísticas para el reporte
    total_fob = df_sunat["FOB_DOLPOL"].sum()
    total_peso = df_sunat["PESO_NETO"].sum()
    df_sunat["ANIO"] = df_sunat["FECHA"].apply(lambda x: str(x)[:4])
    
    annual_stats = df_sunat.groupby("ANIO").agg(
        FOB_USD=('FOB_DOLPOL', 'sum'),
        Peso_TM=('PESO_NETO', lambda x: x.sum() / 1000.0),
        Embarques=('FOB_DOLPOL', 'count')
    ).sort_index()
    
    print(f"\n  --- Reporte General de {crop_name.upper()} ---")
    print(f"  Rango cubierto: {df_sunat['ANIO'].min()} a {df_sunat['ANIO'].max()}")
    print(f"  FOB Acumulado: ${total_fob:,.2f} USD")
    print(f"  Peso Neto Acumulado: {total_peso:,.2f} kg ({total_peso/1000.0:,.2f} TM)")
    
    print("\n  --- Desempenio Anual Unificado ---")
    for ano, row in annual_stats.iterrows():
        print(f"    - Anio {ano}: ${row['FOB_USD']:,.2f} USD | {row['Peso_TM']:,.2f} TM ({int(row['Embarques']):,} envios)")
        
    print("\n  --- Top 3 Agroexportadores ---")
    top_exporters = df_sunat.groupby("EXPORTADOR")["FOB_DOLPOL"].sum().sort_values(ascending=False).head(3)
    for i, (exp, val) in enumerate(top_exporters.items()):
        print(f"    {i+1}. {exp}: ${val:,.2f} USD")

print("\n======================================================================")
print("PIPELINE MAESTRO COMPLETADO DE MANERA EXITOSA. TODAS LAS TABLAS SANADAS.")
print("======================================================================")
