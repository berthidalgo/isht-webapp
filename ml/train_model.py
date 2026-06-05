"""Entrena el modelo de estrés hídrico ISHT (XGBoost). Offline, una vez.
Persiste modelo.pkl + metrics.json. HIDATA: separación de responsabilidades.

Requiere que el ETL (F1) haya producido data/processed/tabla_features.parquet.
"""
import json
import logging

import joblib
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
from xgboost import XGBRegressor

log = logging.getLogger("isht.ml")
FEATURES = ["oferta", "demanda", "poblacion", "precip_anual", "escorrentia_mm", "area_km2"]
TARGET = "indice"  # 0-100, calculado por el ETL como ground truth inicial


def entrenar(tabla_csv: str = "data/tabla_features.csv"):
    """Entrena XGBoost, reporta métricas y persiste el modelo. Funciones <20 líneas."""
    df = pd.read_csv(tabla_csv).dropna(subset=[TARGET])
    X, y = df[FEATURES].fillna(df[FEATURES].median()), df[TARGET]
    X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.25, random_state=42)

    model = XGBRegressor(
        n_estimators=300, max_depth=4, learning_rate=0.05,
        subsample=0.9, random_state=42,
    )
    model.fit(X_tr, y_tr)

    pred = model.predict(X_te)
    metrics = {
        "mae": float(mean_absolute_error(y_te, pred)),
        "r2": float(r2_score(y_te, pred)),
        "n_train": len(X_tr), "n_test": len(X_te),
        "feature_importance": dict(zip(FEATURES, model.feature_importances_.tolist())),
    }

    joblib.dump(model, "modelo.pkl")
    with open("metrics.json", "w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=2)
    log.info("Modelo entrenado. MAE=%.2f R2=%.3f", metrics["mae"], metrics["r2"])
    return metrics


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    entrenar()
