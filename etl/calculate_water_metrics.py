import sqlite3
import pandas as pd
import json
import os

# 1. Definición de la Huella Hídrica por Cultivo (m3 por kg de peso neto)
HUELLA_HIDRICA = {
    'palta': 0.715,      # 715 litros/kg
    'uva': 0.581,        # 581 litros/kg
    'esparrago': 1.217,  # 1217 litros/kg
    'arandano': 0.500    # 500 litros/kg
}

# 2. Mapeo Geográfico-Hidrológico: Aduana -> Cuencas asociadas (Códigos en indice_isht.json)
ADUANA_CUENCA_MAP = {
    'PAITA': {
        'nombre_region': 'Piura',
        'cuencas': ['138', '1378'], # Chira, Piura
    },
    'SALAVERRY': {
        'nombre_region': 'La Libertad',
        'cuencas': ['137716', '13772', '137714'], # Moche, Chicama, Virú
    },
    'PISCO': {
        'nombre_region': 'Ica',
        'cuencas': ['1374', '13752'], # Ica, Pisco
    },
    'PIMENTEL': {
        'nombre_region': 'Lambayeque',
        'cuencas': ['13776', '137772', '137774'], # Chancay-Lambayeque, Motupe, Olmos
    }
}

# Cargar base de datos de exportaciones
db_path = "data/processed/aduanet_exports.db"
if not os.path.exists(db_path):
    print(f"Error: No se encontró la base de datos en {db_path}")
    exit(1)

conn = sqlite3.connect(db_path)

# Cargar índice de cuencas de ISHT
with open("backend/data/indice_isht.json", "r", encoding="utf-8") as f:
    isht_data = json.load(f)
cuencas_dict = {c["codigo"]: c for c in isht_data.get("cuencas", [])}

print("=== CALCULANDO INDICADORES DE INTELIGENCIA HÍDRICO-COMERCIAL (ISHT-SUNAT) ===")

# Obtener datos transaccionales por Aduana y Cultivo
crops = ['palta', 'uva', 'esparrago', 'arandano']
crop_data_list = []

for c in crops:
    table_name = f"exportaciones_{c}"
    query = f"""
        SELECT ADUA_DESC, SUM(FOB_DOLPOL) as fob_total, SUM(PESO_NETO) as peso_total_kg
        FROM {table_name}
        GROUP BY ADUA_DESC
    """
    df = pd.read_sql(query, conn)
    df['cultivo'] = c
    crop_data_list.append(df)

df_all_exports = pd.concat(crop_data_list, ignore_index=True)
conn.close()

# Procesar cada nodo Aduana-Región Hídrica
report_data = []

for aduana, info in ADUANA_CUENCA_MAP.items():
    print(f"\n----------------------------------------------------------------------")
    print(f"Aduana de Salida: {aduana} ({info['nombre_region']})")
    print(f"----------------------------------------------------------------------")
    
    # 1. Sumar la oferta hídrica y demanda agrícola total de las cuencas asociadas (en m3)
    # Oferta/Demanda en JSON está en MMC (Millones de Metros Cúbicos) -> Multiplicamos por 1,000,000 para metros cúbicos
    total_oferta_m3 = 0.0
    total_demanda_agr_m3 = 0.0
    cuencas_info_str = []
    
    for c_code in info['cuencas']:
        c_meta = cuencas_dict.get(c_code)
        if c_meta:
            oferta_m3 = c_meta['oferta'] * 1_000_000
            demanda_m3 = c_meta['demanda_agr'] * 1_000_000
            total_oferta_m3 += oferta_m3
            total_demanda_agr_m3 += demanda_m3
            cuencas_info_str.append(f"{c_meta['nombre']} (Semaforo: {c_meta['semaforo'].upper()})")
            
    print(f"Cuencas vinculadas: {', '.join(cuencas_info_str)}")
    print(f"Oferta Hídrica Total Cuencas: {total_oferta_m3/1_000_000:,.2f} MMC ({total_oferta_m3:,.0f} m³)")
    print(f"Demanda Agrícola Total Cuencas: {total_demanda_agr_m3/1_000_000:,.2f} MMC ({total_demanda_agr_m3:,.0f} m³)")
    
    # 2. Filtrar exportaciones de esta Aduana
    df_aduana = df_all_exports[df_all_exports['ADUA_DESC'] == aduana].copy()
    
    if df_aduana.empty:
        print("No se registraron envíos directos de los 4 cultivos analizados por esta Aduana.")
        continue
        
    print("\nDesglose de Exportaciones Acumuladas (2020-2025):")
    total_fob_aduana = 0.0
    total_peso_aduana_kg = 0.0
    total_agua_consumida_m3 = 0.0
    
    for _, row in df_aduana.iterrows():
        cult = row['cultivo']
        fob = row['fob_total']
        peso_kg = row['peso_total_kg']
        hh_coef = HUELLA_HIDRICA[cult]
        
        # Agua real consumida por la planta (Huella hídrica total azul/verde de la exportación)
        agua_m3 = peso_kg * hh_coef
        
        total_fob_aduana += fob
        total_peso_aduana_kg += peso_kg
        total_agua_consumida_m3 += agua_m3
        
        print(f"  - {cult.upper()}: FOB ${fob:,.2f} USD | Peso: {peso_kg/1000.0:,.2f} TM | Agua Consumida: {agua_m3:,.0f} m³")
        
    # Calcular Ratios Estratégicos
    # Ratio A: USD FOB por m3 de agua real consumida
    ratio_fob_por_m3_consumido = total_fob_aduana / total_agua_consumida_m3 if total_agua_consumida_m3 > 0 else 0.0
    
    # Ratio B: USD FOB por m3 de demanda agrícola total de las cuencas
    ratio_fob_por_m3_demanda_cuenca = total_fob_aduana / total_demanda_agr_m3 if total_demanda_agr_m3 > 0 else 0.0
    
    # Ratio C: USD FOB por m3 de oferta hídrica anual total de las cuencas
    ratio_fob_por_m3_oferta_cuenca = total_fob_aduana / total_oferta_m3 if total_oferta_m3 > 0 else 0.0
    
    print(f"\n--> RATIOS DE EFICIENCIA Y PRESIÓN HÍDRICA:")
    print(f"  [+] Retorno Económico Real (FOB USD por m³ de Agua Consumida por el Cultivo): ${ratio_fob_por_m3_consumido:,.4f} USD/m³")
    print(f"  [+] Presión sobre Demanda Agrícola (FOB USD por m³ de Demanda Agrícola Total): ${ratio_fob_por_m3_demanda_cuenca:,.4f} USD/m³")
    print(f"  [+] Productividad Bruta de la Cuenca (FOB USD por m³ de Oferta Hidrológica): ${ratio_fob_por_m3_oferta_cuenca:,.4f} USD/m³")
    
    report_data.append({
        'aduana': aduana,
        'region': info['nombre_region'],
        'fob_total': total_fob_aduana,
        'peso_tm': total_peso_aduana_kg / 1000.0,
        'agua_m3': total_agua_consumida_m3,
        'oferta_m3': total_oferta_m3,
        'demanda_agr_m3': total_demanda_agr_m3,
        'ratio_retorno_m3': ratio_fob_por_m3_consumido,
        'ratio_presion_demanda': ratio_fob_por_m3_demanda_cuenca
    })

print("\n" + "="*70)
print("RESUMEN DE PRODUCTIVIDAD ECONÓMICA DEL AGUA EN LAS ADUANAS REGIONALES")
print("="*70)
df_report = pd.DataFrame(report_data).sort_values(by='ratio_retorno_m3', ascending=False)
for idx, row in df_report.iterrows():
    print(f"Aduana {row['aduana']} ({row['region']}):")
    print(f"  - FOB Exportado Acumulado: ${row['fob_total']:,.2f} USD")
    print(f"  - Agua Real Consumida por Exportaciones: {row['agua_m3']:,.0f} m³ ({row['agua_m3']/1_000_000:,.2f} MMC)")
    print(f"  - Retorno Económico Directo: ${row['ratio_retorno_m3']:,.2f} USD generados por cada m³ de agua consumida.")
    print(f"  - Presión Macroeconómica: ${row['ratio_presion_demanda']:,.4f} USD/m³ de demanda agrícola global.")
    print("-" * 50)
