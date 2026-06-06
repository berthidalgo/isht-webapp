"""ISHT API — sirve el índice, el modelo ML y la simulación de escenarios.
HIDATA Method: plano de control (lógica+modelo). Funciones pequeñas, observabilidad.

En Fase 0 el backend arranca sin datos ni modelo: /health responde OK y los
endpoints de datos devuelven 404/503 claros hasta que el ETL (F1) y el ML (F2)
depositen sus artefactos. Esto valida el deploy ANTES de tener datos encima.
"""
import json
import logging
import os
from pathlib import Path

import joblib
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("isht.api")

app = FastAPI(title="ISHT API", version="2.0")

# CORS: en F0 abrimos a todo para validar la conexión front-back.
# En prod, restringir a la URL de Vercel vía variable de entorno CORS_ORIGINS.
_origins_env = os.getenv("CORS_ORIGINS", "*")
_origins = ["*"] if _origins_env == "*" else [o.strip() for o in _origins_env.split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rutas a artefactos. El backend SIRVE lo que el ETL/ML produjeron.
DATA = Path(__file__).parent / "data"
MODEL_PATH = Path(__file__).parent.parent / "ml" / "modelo.pkl"
METRICS_PATH = Path(__file__).parent.parent / "ml" / "metrics.json"
FEATURES = ["oferta", "demanda", "poblacion", "precip_anual", "escorrentia_mm", "area_km2"]

MODEL = None


@app.on_event("startup")
def cargar_modelo():
    """Carga modelo.pkl una sola vez al iniciar (no por request)."""
    global MODEL
    if MODEL_PATH.exists():
        MODEL = joblib.load(MODEL_PATH)
        log.info("Modelo ML cargado desde %s", MODEL_PATH)
    else:
        log.warning("modelo.pkl ausente — /api/predecir devolverá 503 hasta entrenar (F2)")


@app.api_route("/health", methods=["GET", "HEAD"])
def health():
    """Liveness probe. UptimeRobot pega aquí para mantener caliente Render."""
    return {"status": "ok", "fase": "live", "modelo": MODEL is not None}


@app.get("/api/cuencas")
def cuencas():
    """GeoJSON de las 159 cuencas con su índice. Lo produce el ETL (F1)."""
    f = DATA / "cuencas.geojson"
    if not f.exists():
        raise HTTPException(404, "cuencas.geojson no encontrado — correr ETL (F1)")
    return json.loads(f.read_text(encoding="utf-8"))


@app.get("/api/indice")
def indice():
    """Tabla completa del índice por cuenca. Lo produce el ETL (F1)."""
    f = DATA / "indice_isht.json"
    if not f.exists():
        raise HTTPException(404, "indice_isht.json no encontrado — correr ETL (F1)")
    return json.loads(f.read_text(encoding="utf-8"))


@app.get("/api/metrics")
def metrics():
    """Métricas del modelo (MAE, R2, feature_importance). Lo produce el ML (F2)."""
    if METRICS_PATH.exists():
        return json.loads(METRICS_PATH.read_text(encoding="utf-8"))
    return {"detail": "sin métricas — entrenar modelo (F2)"}


class FeaturesCuenca(BaseModel):
    oferta: float
    demanda: float
    poblacion: float
    precip_anual: float
    escorrentia_mm: float
    area_km2: float


@app.post("/api/predecir")
def predecir(x: FeaturesCuenca):
    """Predice el índice de estrés de una cuenca con el modelo entrenado."""
    if MODEL is None:
        raise HTTPException(503, "Modelo no disponible — entrenar y desplegar modelo.pkl (F2)")
    fila = [[getattr(x, f) for f in FEATURES]]
    pred = float(MODEL.predict(fila)[0])
    return {"indice_predicho": round(pred, 1)}


class Simulacion(BaseModel):
    peso_cantidad: float = 0.5
    peso_calidad: float = 0.3
    peso_presion: float = 0.2
    el_nino: float = 1.0
    expansion_demanda: float = 0.0


@app.post("/api/simular")
def simular(s: Simulacion):
    """Recalcula el índice de las 159 cuencas bajo un escenario y devuelve ranking."""
    f = DATA / "indice_isht.json"
    if not f.exists():
        raise HTTPException(404, "indice_isht.json no encontrado — correr ETL (F1)")
    data = json.loads(f.read_text(encoding="utf-8"))
    from services.recalculo import recalcular_ranking
    return recalcular_ranking(data, s.dict())
