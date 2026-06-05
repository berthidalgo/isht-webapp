"""Orquestador del ETL ISHT (F1). Corre UNA VEZ, offline. No se despliega.

Flujo:
  1. load_geoperu_wfs  → cuencas Pfafstetter (data primigenia, admisibilidad)
  2. load_oferta       → PISCO_HyM_GR2M NetCDF → oferta por cuenca
  3. load_demanda      → INEI + ANA derechos + proxy agro
  4. transforms.balance→ oferta - demanda, brecha, semáforo
  5. transforms.indice → índice 0-100 compuesto
  6. exporters         → cuencas.geojson + indice_isht.json + tabla_features.parquet
Luego: copiar los artefactos a backend/data/.
"""
import logging

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("isht.etl")


def main():
    log.info("ETL ISHT — pendiente de implementar en F1 (ver prompt Fase 1 del Master Plan §7)")


if __name__ == "__main__":
    main()
