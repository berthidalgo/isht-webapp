# ISHT — MASTER-PLAN DE EJECUCIÓN TÉCNICA v2 (Full Stack + ML)
### Índice de Seguridad Hídrica Territorial · GEOTÓN Perú 2026 · HIDATA Method v1.4

**Última actualización:** 5 de junio de 2026
**Owners:** Joan Hidalgo (CEO / Dev Senior / Data Engineer & Scientist Senior) + Staff Engineer 100x
**Cliente:** Estado peruano (PCM — GEOTÓN), categoría Territorio Sostenible
**Repo objetivo:** `berthcodex/isht-webapp`
**Estado actual:** Fase 0 — Blueprint & Esqueleto (arranca HOY)
**Documento estratégico hermano:** `ISHT_PLAN_MAESTRO_GEOTON2026.md`

> **Documento único de ejecución.** Contiene todo lo necesario para desarrollar y desplegar: alineación HIDATA, arquitectura full-stack, **estructura del repo y arranque paso a paso (§3-BIS)**, ingesta de datos, estrategia de ML escalonado, fases con DoD, prompts, código base de backend, anti-ban, riesgos y checklist de entrega.
>
> **Claves v2:** (1) **ML real escalonado por riesgo** (§5); (2) arquitectura **full stack** (FastAPI + React) porque los modelos entrenados no corren en el navegador (§3); (3) **la data primigenia entra por GeoPerú/GEOIDEP vía WFS** — requisito de admisibilidad de las bases (§4).

---

## ★ NOTA DE ALINEACIÓN HIDATA METHOD + DECISIÓN DE ALCANCE (leer primero)

Honramos el ADN HIDATA (10 principios) adaptándolo a un proyecto de tipo **web app analítica con ML batch + servida en tiempo real**. Tres verdades de Staff Engineer en modo paranoid, dichas de frente:

**Verdad 1 — El ML se escalona o nos hunde.** Veníamos listando SARIMAX, Prophet, XGBoost, LSTM, GWR, RF espacial, DBSCAN. Eso es arsenal de tesis y hoy es el deadline. El Principio 5 (red team) y el 1 (negocio sobre código) obligan a un ML **escalonado por riesgo**: un NÚCLEO que entra sí o sí y demuestra capacidad predictiva real, y un ANILLO opcional para el pitch. Entrenar 8 modelos hoy = no entregar. El núcleo está elegido para máximo valor demostrable / mínimo riesgo de tiempo (ver §5).

**Verdad 2 — Con ML real, sí necesitamos backend.** Un modelo entrenado (XGBoost/SARIMAX) no se re-ejecuta en JS. La arquitectura correcta es: backend Python que entrena offline, persiste el modelo, y sirve predicciones vía API; frontend que las consume y hace la interactividad ligera. Tu instinto fue correcto.

**Verdad 3 — GeoPerú es obligatorio, no opcional.** Las bases (§9 y admisibilidad §11) exigen al menos un conjunto de datos de GEO Perú. Si no se cumple, **eliminación antes de evaluar**. La data primigenia (cuencas, límites) entra por GeoPerú/GEOIDEP vía WFS. Esto es ahora un componente de primera clase del ETL, no una nota al pie.

| Principio HIDATA | Aplica | Cómo en el ISHT v2 |
|---|---|---|
| 1. Código commodity, negocio es el producto | ✅ Full | El valor es el índice + integración + ML aplicado a la decisión |
| 2. Zero-Install, Cloud-Native | ✅ Full | GitHub + Render (back) + Vercel (front). Nada local |
| 3. Fases con DoD medible | ✅ Full | 6 fases, cada una con DoD cuantificable (§6) |
| 4. Chat-Driven Development | ✅ Full | Prompts pre-escritos por fase (§7) |
| 5. Red Team paranoico | ✅ Full | ML escalonado + mapa de riesgos (§12) |
| 6. Stack gratuito por defecto | ✅ Full | Free tier en todo |
| 7. Documentación viva única | ✅ Full | Este archivo |
| 8. Anti-Ban (Zero-IP-Ban) | ⚠️ Adaptado | Aplica a la ingesta batch de WFS .gob.pe: backoff + Retry-After + **cache local obligatorio** (§11) |
| 9. Autonomía 24/7 (72h) | ⚠️ Adaptado | El backend es request-response, no proceso 24/7. Cold-start de Render free documentado como riesgo, mitigado con UptimeRobot (§12) |
| 10. Mantenibilidad Perpetua | ✅ Full | Capas separadas, ETL idempotente, modelo versionado, álgebra documentada |

---

## 1. VISIÓN Y POSICIONAMIENTO

Web app full-stack que integra la oferta hídrica oficial (PISCO_HyM_GR2M de SENAMHI) con la demanda multisectorial por cuenca, calcula la **brecha** de seguridad hídrica, **proyecta su trayectoria con ML**, la valoriza y prioriza la inversión por retorno. A diferencia de los visores estáticos del Estado, el ISHT es **interactivo y predictivo**: el decisor mueve un supuesto, ve el índice recalcularse y ve la proyección del modelo. Diferenciador honesto: no reinventamos la ciencia hídrica del Estado; le añadimos la capa de decisión y la inteligencia predictiva que no tiene.

**Entregable GEOTÓN:** la web app desplegada ES el anexo visual (categoría "tablero"/"prototipo"). Mientras el 95% sube un PDF con mapa estático, nosotros subimos una herramienta viva con ML.

---

## 2. FASES DEL PROYECTO

```
F0 (Blueprint + esqueleto desplegado, front+back)  ── HOY  ~45 min
F1 (ETL: GeoPerú/GEOIDEP + PISCO + demanda → brecha) ─ HOY  núcleo de datos
F2 (ML: modelo de brecha entrenado y persistido)    ── HOY  inteligencia
F3 (Backend API: índice + predicción + simulación)  ── HOY  servir el cerebro
F4 (Frontend interactivo: mapa + sliders + proyección) HOY  el anexo visual
F5 (Pulido + deploy público + entregable Facilita)  ── HOY  cierre y registro
```

**Filosofía de tiempo:** cada fase entrega algo desplegado. Ruta mínima ganadora si el reloj aprieta: F0→F1→F4 (índice + mapa interactivo, ML como "en desarrollo"). F2-F3 añaden la predicción que nos separa del resto. F5 cierra.

---

## 3. ARQUITECTURA OBJETIVO (FULL STACK)

### 3.1 Diagrama lógico

```
┌──────────────────────────────────────────────────────────────────────┐
│  CAPA 0 — DATA PRIMIGENIA OBLIGATORIA: GEO PERÚ / GEOIDEP (WFS)        │
│  • Cuencas/UH Pfafstetter, límites, infraestructura  → vía WFS GetFeature │
│    visor.geoperu.gob.pe + catálogo GEOIDEP  ──► CUMPLE BASES §9/§11    │
└───────────────────────────┬──────────────────────────────────────────┘
                            │  +  fuentes complementarias abiertas
                            ▼
┌──────────────────────────────────────────────────────────────────────┐
│  FUENTES COMPLEMENTARIAS (permitidas por bases §9)                     │
│  • PISCO_HyM_GR2M (NetCDF) → oferta superficial validada               │
│  • ANA derechos / SUNAT / INEI → demanda multisectorial                │
│  • OEFA afectación de cuencas → calidad/conflicto (sin acusar)         │
└───────────────────────────┬──────────────────────────────────────────┘
                            │  ETL idempotente + cache (Python, offline)
                            ▼
┌──────────────────────────────────────────────────────────────────────┐
│  CAPA DE DATOS PROCESADA (artefactos versionados)                      │
│  cuencas.geojson · indice_isht.json · tabla_features.parquet           │
└───────────────────────────┬──────────────────────────────────────────┘
                            │  alimenta
                            ▼
┌──────────────────────────────────────────────────────────────────────┐
│  CAPA ML (entrenamiento OFFLINE, una vez)                              │
│  • Modelo de brecha/estrés: XGBoost (núcleo) → modelo.pkl              │
│  • Proyección temporal cuencas bandera: SARIMAX/Prophet → series.json  │
│  • Métricas de validación (KGE/MAE/R²) → metrics.json                  │
└───────────────────────────┬──────────────────────────────────────────┘
                            │  el backend carga modelo.pkl al iniciar
                            ▼
┌────────────────────────────┐         ┌────────────────────────────────┐
│  BACKEND (FastAPI / Render) │◄───────►│  FRONTEND (React+Vite / Vercel)│
│  GET /health                │  JSON   │  Mapa Leaflet + semáforo       │
│  GET /api/cuencas           │         │  Sliders de escenario          │
│  GET /api/indice            │         │  Panel drill-down por cuenca   │
│  POST /api/simular  ◄── pesos/escenario │  Gráfico de proyección (Recharts)│
│  POST /api/predecir ◄── features        │  Ranking por retorno           │
│  carga modelo.pkl en startup│         │  = ANEXO VISUAL GEOTÓN         │
└────────────────────────────┘         └────────────────────────────────┘
```

### 3.2 Por qué full stack ahora (y por qué es la decisión correcta)

- **El ML vive en el backend.** `modelo.pkl` (XGBoost entrenado) se carga una vez al iniciar el servicio y sirve predicciones en milisegundos vía `/api/predecir`. Esto no se puede hacer en el navegador.
- **El frontend hace lo ligero.** El recálculo de la brecha por sliders (aritmética) puede seguir siendo client-side para que sea instantáneo; la predicción del modelo (lo pesado/entrenado) se pide al backend. Lo mejor de los dos mundos.
- **Separación plano control / plano datos (Anexo II HIDATA).** El backend es el plano de control (lógica, modelo); el frontend es el plano de datos (lo que ve el usuario). Limpio y mantenible.

### 3.3 Stack concreto (zero-install)

| Capa | Herramienta | Por qué |
|---|---|---|
| Código | GitHub `isht-webapp` | Source of truth, editor web, monorepo (back+front) |
| ETL + ML | Python 3.11 (Colab para entrenar, o tu entorno) | geopandas, xarray, owslib, scikit-learn, xgboost, statsmodels/prophet |
| Modelo persistido | `modelo.pkl` (joblib) en el repo o Supabase Storage | El backend lo carga al iniciar |
| Backend | FastAPI en Render free | API REST + Swagger; sirve índice y predicciones |
| Frontend | React + Vite + Leaflet + Recharts en Vercel | Mapa + gráficos interactivos |
| Datos procesados | GeoJSON/JSON estáticos servidos por el backend o en /public | 159 cuencas = pocos MB |
| Monitoreo | UptimeRobot sobre /health | Mantiene caliente Render + alerta de caída |
| Cache de ingesta | `data/raw/` en el repo (gitignored los pesados) | Inmunidad a caídas de .gob.pe |

> **Tu perfil juega a favor:** dev senior (FastAPI + React), data engineer (ETL owslib/geopandas/xarray), data scientist (XGBoost/SARIMAX + métricas). Este stack es exactamente tu terreno. El documento es andamiaje para ir en tiempo récord, no tutorial.

---

## 3-BIS. ESTRUCTURA DEL REPO Y ARRANQUE PASO A PASO

> Esta sección responde con precisión total: **qué carpeta y qué archivo va exactamente dónde, y en qué orden los creo en GitHub.** Es la guía operativa del primer día.

### 3-BIS.1 — El árbol completo del monorepo (qué va dónde)

```
isht-webapp/                          ← REPO RAÍZ (esto creas en GitHub)
│
├── README.md                         ← qué es el proyecto + links a las 2 URLs (Render/Vercel)
├── MASTER-PLAN.md                    ← el plan de ejecución v2 (pegas el que ya tienes)
├── .gitignore                        ← ignora data pesada, node_modules, .pkl grandes, etc.
│
├── backend/                          ← 🐍 TODO LO PYTHON QUE SE SIRVE EN VIVO (Render)
│   ├── main.py                       ← FastAPI: /health /api/cuencas /api/indice /api/simular /api/predecir
│   ├── requirements.txt              ← fastapi, uvicorn, pydantic, joblib, xgboost, pandas
│   ├── render.yaml                   ← config de deploy en Render (build + start command)
│   ├── services/
│   │   ├── __init__.py
│   │   └── recalculo.py              ← lógica de /api/simular (recalcular ranking por escenario)
│   └── data/                         ← artefactos que el backend SIRVE (copiados del ETL)
│       ├── cuencas.geojson           ← geometría + índice por cuenca (lo produce el ETL)
│       └── indice_isht.json          ← tabla completa del índice (lo produce el ETL)
│
├── frontend/                         ← ⚛️ TODO REACT (Vercel)
│   ├── package.json                  ← react, vite, leaflet, react-leaflet, recharts
│   ├── vite.config.js                ← config de Vite
│   ├── index.html                    ← punto de entrada HTML
│   ├── .env.example                  ← muestra VITE_API_URL (la URL del backend en Render)
│   ├── public/
│   │   └── data/                     ← (opcional) copia de cuencas.geojson si el front lee directo
│   └── src/
│       ├── main.jsx                  ← arranca React
│       ├── App.jsx                   ← layout: mapa + panel + controles + ranking
│       ├── api.js                    ← funciones fetch al backend (usa VITE_API_URL)
│       ├── lib/
│       │   └── indice.js             ← recálculo client-side ligero (sliders instantáneos)
│       └── components/
│           ├── MapaCuencas.jsx       ← mapa Leaflet, pinta 159 cuencas por semáforo
│           ├── PanelCuenca.jsx       ← panel lateral drill-down (balance, brecha, valorización)
│           ├── ControlesEscenario.jsx← los 3 sliders (peso, El Niño, expansión demanda)
│           └── RankingTabla.jsx      ← tabla top-15 cuencas por retorno
│
├── etl/                              ← 🔧 PYTHON QUE CORRE UNA VEZ (offline, NO se despliega)
│   ├── build_index.py                ← orquestador del ETL
│   ├── requirements.txt              ← geopandas, xarray, owslib, pandas, tenacity, netcdf4
│   ├── validate.py                   ← DoD F1: valida 159 cuencas, rangos, nulos
│   ├── loaders/
│   │   ├── __init__.py
│   │   ├── load_geoperu_wfs.py       ← descarga cuencas vía WFS GeoPerú (¡admisibilidad!)
│   │   ├── load_oferta.py            ← lee PISCO NetCDF → oferta por cuenca
│   │   └── load_demanda.py           ← lee CSV demanda (INEI + ANA + proxy agro)
│   ├── transforms/
│   │   ├── __init__.py
│   │   ├── balance.py                ← oferta - demanda, brecha, semáforo
│   │   └── indice.py                 ← índice 0-100 compuesto
│   ├── exporters/
│   │   ├── __init__.py
│   │   └── export_artifacts.py       ← escribe cuencas.geojson + indice_isht.json + parquet
│   └── data/
│       ├── raw/                      ← cache de descargas (gitignored: pesados)
│       └── processed/
│           └── tabla_features.parquet← features para el ML
│
└── ml/                               ← 🤖 PYTHON DE MACHINE LEARNING (offline, NO se despliega)
    ├── train_model.py                ← entrena XGBoost → modelo.pkl + metrics.json
    ├── requirements.txt              ← scikit-learn, xgboost, pandas, joblib, prophet (opcional)
    ├── evals_calibracion.json        ← test de sanidad (Ica roja, La Libertad sana)
    ├── modelo.pkl                    ← modelo entrenado (lo carga el backend)
    └── metrics.json                  ← MAE, R2, feature_importance
```

---

### 3-BIS.2 — La regla mental: back vs front vs offline

Tres tipos de código, tres destinos distintos. Esta es la clave que faltaba:

| Carpeta | ¿Qué es? | ¿Dónde vive? | ¿Cuándo corre? |
|---------|----------|--------------|----------------|
| **`etl/`** | Prepara los datos (descarga, limpia, calcula índice) | Tu máquina o Colab | UNA VEZ, antes de todo. Produce archivos. **No se despliega.** |
| **`ml/`** | Entrena el modelo | Tu máquina o Colab | UNA VEZ, después del ETL. Produce `modelo.pkl`. **No se despliega.** |
| **`backend/`** | Sirve los datos y el modelo vía API | **Render** (nube) | EN VIVO, responde a cada request del frontend |
| **`frontend/`** | Lo que ve el usuario (mapa, sliders) | **Vercel** (nube) | EN VIVO, en el navegador del jurado |

**El flujo de los artefactos (lo que más confunde):**
```
etl/build_index.py  ─produce→  cuencas.geojson, indice_isht.json, tabla_features.parquet
                                      │                    │
                    (copias a)        │                    │ (lo usa)
                    backend/data/  ◄──┘                    ▼
                                              ml/train_model.py ─produce→ modelo.pkl, metrics.json
                                                                              │
                                                              (copias a) backend/ lo carga al iniciar
```

> **Por qué `etl/` y `ml/` NO se despliegan:** son procesos de preparación que corres una vez. El backend solo necesita sus *resultados* (los `.geojson`, `.json`, `.pkl`), no el código que los generó. Por eso esos archivos-resultado se copian a `backend/data/` y `backend/` (o `ml/`). Esto es separación plano de control / plano de datos del Anexo II HIDATA.

---

### 3-BIS.3 — Orden exacto de arranque (primeros 45 minutos)

### Paso 1 — Crear el repo en GitHub (5 min)
1. GitHub.com → New repository → nombre `isht-webapp` → Private (o Public) → Add README → Create.
2. Listo. Ya tienes `isht-webapp/` con un `README.md`.

### Paso 2 — Crear la estructura de carpetas vacía (10 min)
En GitHub web, **"Add file → Create new file"**. Para crear una carpeta, escribes `backend/main.py` en el nombre y GitHub crea la carpeta `backend/` automáticamente. Crea en este orden los archivos "ancla" (uno por carpeta) para que existan las carpetas:
- `backend/main.py`
- `backend/requirements.txt`
- `frontend/package.json`
- `etl/build_index.py`
- `ml/train_model.py`
- `.gitignore`

> Truco: en el editor web de GitHub, escribir `carpeta/subcarpeta/archivo.py` crea toda la jerarquía de una vez. No necesitas crear carpetas manualmente.

### Paso 3 — Desplegar el ESQUELETO VACÍO primero (30 min) ← clave red team
**Antes de meter datos, valida que el pipeline de deploy funciona.** Esto te ahorra descubrir un bug de configuración a las 11pm con todo el código encima.

**3a. Backend en Render:**
1. Pega el código de `backend/main.py` (el del Master Plan §8) — por ahora `/health` basta.
2. Pega `backend/requirements.txt` y `backend/render.yaml`.
3. Render.com → New → Web Service → conecta tu repo `isht-webapp` → Root Directory: `backend` → Build: `pip install -r requirements.txt` → Start: `uvicorn main:app --host 0.0.0.0 --port $PORT`.
4. Deploy. Cuando termine, abre `https://tu-app.onrender.com/health` → debe responder `{"status":"ok"}`.

**3b. Frontend en Vercel:**
1. Pega `frontend/package.json`, `vite.config.js`, `index.html`, `src/main.jsx`, `src/App.jsx`.
2. Vercel.com → New Project → importa `isht-webapp` → Root Directory: `frontend` → Framework: Vite.
3. En Environment Variables, añade `VITE_API_URL` = la URL de tu backend en Render.
4. Deploy. Abre la URL de Vercel → debe mostrar el mapa de Perú + "backend OK".

**✅ DoD Fase 0 cumplido:** dos URLs públicas, el front habla con el back. Recién aquí empiezas con datos (Fase 1).

---

### 3-BIS.4 — .gitignore (pégalo tal cual)

```gitignore
# Python
__pycache__/
*.pyc
.venv/
venv/

# Datos pesados (NO subir al repo; se regeneran con el ETL)
etl/data/raw/
*.nc
*.tif
*.zip

# Modelos grandes (si supera 50MB, usar Supabase Storage; si no, se puede versionar)
# ml/modelo.pkl   ← descomenta si el .pkl es grande

# Node
node_modules/
frontend/dist/
.env
.env.local

# Sistema
.DS_Store
```

> **Decisión sobre `modelo.pkl` y los `.geojson`:** son livianos (159 cuencas = pocos MB), así que **SÍ los versionas en el repo** — eso permite que Render los lea directo sin infraestructura extra. Solo los datos crudos pesados (NetCDF de PISCO, rasters) van gitignored y se regeneran con el ETL.

---

### 3-BIS.5 — Secuencia de fases (qué carpeta tocas en cada una)

```
Fase 0  →  backend/main.py (solo /health) + frontend/ esqueleto  →  2 URLs vivas
Fase 1  →  etl/  (todo)                                          →  cuencas.geojson, indice_isht.json
              ↓ copiar artefactos a backend/data/
Fase 2  →  ml/train_model.py                                     →  modelo.pkl, metrics.json
              ↓ queda en ml/ (backend lo carga de ahí)
Fase 3  →  backend/main.py (completar todos los endpoints) + services/recalculo.py
Fase 4  →  frontend/src/  (componentes del tablero)              →  el anexo visual
Fase 5  →  pulido + UptimeRobot + registrar en Facilita
```

---

## 4. INGESTA DE DATA PRIMIGENIA — GEO PERÚ / GEOIDEP (cumplimiento de bases)

Esto es **requisito de admisibilidad** (bases §11): sin al menos un dataset de GEO Perú, eliminación. Lo resolvemos de forma central y demostrable.

### 4.1 Qué tomamos de GeoPerú/GEOIDEP
- **Cuencas / Unidades Hidrográficas Pfafstetter** (la malla base de las 159 UH) — vía WFS.
- **Límites administrativos** (departamentos/distritos para cruce poblacional) — vía WFS de INEI catalogado.
- Opcional: capa de **conflictos** o **infraestructura** del visor para enriquecer.

### 4.2 Cómo se consume (WFS GetFeature → GeoJSON)
El visor GeoPerú y los geoservicios catalogados en GEOIDEP exponen WFS. La descarga vectorial completa (geometría + atributos) se obtiene con `owslib` o por URL directa. Patrón:

```python
# etl/loaders/load_geoperu_wfs.py
"""Carga la data primigenia desde servicios WFS de GeoPerú/GEOIDEP.
CUMPLE bases GEOTÓN §9/§11. Cachea para idempotencia y anti-caída."""
import os, logging, geopandas as gpd
from owslib.wfs import WebFeatureService
from tenacity import retry, stop_after_attempt, wait_exponential

log = logging.getLogger("isht.etl.geoperu")
CACHE = "data/raw/cuencas_pfafstetter.geojson"

@retry(stop=stop_after_attempt(5), wait=wait_exponential(multiplier=2, max=60))
def _descargar_wfs(url_wfs: str, typename: str) -> gpd.GeoDataFrame:
    """Descarga una capa WFS con backoff exponencial (HIDATA Principio 8)."""
    wfs = WebFeatureService(url=url_wfs, version="2.0.0")
    resp = wfs.getfeature(typename=typename, outputFormat="application/json")
    return gpd.read_file(resp)

def load_cuencas_geoperu(url_wfs: str, typename: str) -> gpd.GeoDataFrame:
    """Carga cuencas; usa cache si existe (idempotencia + inmunidad a caída)."""
    if os.path.exists(CACHE):
        log.info("Cache hit: %s (no se re-descarga)", CACHE)
        return gpd.read_file(CACHE)
    log.info("Descargando cuencas desde WFS GeoPerú/GEOIDEP...")
    gdf = _descargar_wfs(url_wfs, typename).to_crs(epsg=4326)
    os.makedirs("data/raw", exist_ok=True)
    gdf.to_file(CACHE, driver="GeoJSON")
    log.info("Cuencas cacheadas: %d features", len(gdf))
    return gdf
```

> **Plan B documentado (red team):** si el WFS no responde, las bases permiten descarga directa. Fallback: botón "Descargar Datos" del visor, o `GetFeature` por URL con `outputFormat=SHAPE-ZIP`, o el ArcGIS REST de ANA (`?f=geojson`). El cache hace que solo dependamos de la fuente UNA vez. La nota de cumplimiento en el entregable cita explícitamente: "data primigenia: capa de cuencas Pfafstetter obtenida vía WFS desde GeoPerú/GEOIDEP".

---

## 5. ESTRATEGIA DE MACHINE LEARNING — ESCALONADA POR RIESGO

Esta es la respuesta honesta a "¿todos los modelos?". **No todos hoy.** Escalonamos por valor demostrable / riesgo de tiempo. Cada modelo tiene un veredicto explícito de Staff Engineer.

### 5.1 NÚCLEO (entra sí o sí — alto valor, bajo riesgo de tiempo)

| Modelo | Para qué | Por qué es núcleo | Riesgo |
|---|---|---|---|
| **XGBoost (regresor)** | Predecir el índice de estrés / brecha de una cuenca a partir de features (oferta, demanda, NDVI, población, precipitación, n° pozos, derechos) | Maneja datos tabulares heterogéneos sin series temporales largas; entrena en segundos; da **feature importance** (qué impulsa el estrés) — narrativa potente para el jurado. No necesita series limpias de 15 años | Bajo. Si una cuenca no tiene una feature, imputación documentada |
| **Clasificación de semáforo (XGBoost classifier o umbral)** | Asignar rojo/amarillo/azul con probabilidad | Convierte el índice en decisión con confianza | Bajo |

**Por qué XGBoost y no LSTM como núcleo:** XGBoost brilla con datos tabulares por cuenca (lo que tenemos) y no exige series temporales largas y limpias (lo que NO tenemos garantizado para 159 cuencas). LSTM exige secuencias largas; sobre datos faltantes, alucina. **Para el caso ISHT, XGBoost es el modelo correcto, no el más vistoso.** Honestidad de consultora: el modelo correcto > el modelo de moda.

### 5.2 ANILLO 1 (si el núcleo cierra con tiempo — proyección temporal en cuencas bandera)

| Modelo | Para qué | Condición de entrada |
|---|---|---|
| **SARIMAX o Prophet** | Proyectar la trayectoria de la brecha a 5/10 años SOLO en cuencas bandera con serie suficiente (Ica, La Libertad, Rímac) | Solo si la serie de caudal/demanda existe con <20% gaps. Si no, se reporta como escenarios, no como serie. **No se fuerza** |
| **Prophet** preferido sobre SARIMAX para el pitch | Maneja estacionalidad y changepoints (El Niño) con menos tuning; gráfico de incertidumbre muy visual | Mismo dato; Prophet es más rápido de poner a punto hoy |

### 5.3 ANILLO 2 (backlog / post-concurso — NO hoy)

| Modelo | Por qué se posterga conscientemente |
|---|---|
| **LSTM / GRU híbrido SARIMAX-LSTM** | Requiere series largas limpias y tuning; alto riesgo de tiempo hoy. Es el "techo" para una v2 post-concurso, mencionable en el pitch como roadmap |
| **GWR (Geographically Weighted Regression)** | Valioso para downscaling espacial, pero exige densidad de puntos (n>500) y es delicado. Backlog |
| **Spatial DBSCAN / K-Means** | Clustering de cuencas por comportamiento. Nice-to-have, no core para la decisión |
| **RF espacial / ESF** | Alternativa a XGBoost para agregación de polígonos; redundante con el núcleo hoy |

### 5.4 Honestidad metodológica (clave para no caer en el Q&A)
- El modelo se valida con métricas reales (MAE, R², o KGE si aplica) reportadas en `metrics.json` y visibles en el tablero.
- Los **evals de calibración** (§9) son el test de sanidad: el modelo DEBE marcar Ica como crítica y La Libertad como sana. Si no, hay bug, no se publica.
- Donde no hay datos, se dice "estimación por proxy" — nunca falsa precisión. Esto es lo que un jurado técnico premia.
- **Feature importance de XGBoost** es la joya narrativa: "el modelo identifica que la expansión de pozos y el NDVI agrícola son los mayores predictores de estrés en la costa" — eso es inteligencia, no un mapa de colores.

### 5.5 Código del núcleo ML (`ml/train_model.py`)

```python
"""Entrena el modelo de estrés hídrico ISHT (XGBoost). Offline, una vez.
Persiste modelo.pkl + metrics.json. HIDATA: separación de responsabilidades."""
import json, logging, joblib
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
from xgboost import XGBRegressor

log = logging.getLogger("isht.ml")
FEATURES = ["oferta", "demanda", "ndvi", "poblacion", "precip_anual", "n_pozos", "derechos_otorgados"]
TARGET = "indice"   # 0-100, calculado por el ETL como ground truth inicial

def entrenar(tabla_parquet: str = "data/processed/tabla_features.parquet"):
    df = pd.read_parquet(tabla_parquet).dropna(subset=[TARGET])
    X, y = df[FEATURES].fillna(df[FEATURES].median()), df[TARGET]
    X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.25, random_state=42)

    model = XGBRegressor(n_estimators=300, max_depth=4, learning_rate=0.05,
                         subsample=0.9, random_state=42)
    model.fit(X_tr, y_tr)

    pred = model.predict(X_te)
    metrics = {"mae": float(mean_absolute_error(y_te, pred)),
               "r2": float(r2_score(y_te, pred)),
               "n_train": len(X_tr), "n_test": len(X_te),
               "feature_importance": dict(zip(FEATURES, model.feature_importances_.tolist()))}

    joblib.dump(model, "ml/modelo.pkl")
    with open("ml/metrics.json", "w") as f:
        json.dump(metrics, f, indent=2)
    log.info("Modelo entrenado. MAE=%.2f R2=%.3f", metrics["mae"], metrics["r2"])
    return metrics

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    entrenar()
```

> **Decisión Staff Engineer archivada:** el `TARGET` inicial del modelo es el índice calculado por el ETL (basado en balance dual). Esto puede sonar circular, pero NO lo es: el XGBoost aprende a **predecir el estrés a partir de drivers observables** (NDVI, pozos, población), de modo que para una cuenca con datos faltantes o un escenario futuro, el modelo estima el índice sin necesitar el balance completo. Es un **modelo sustituto (surrogate) y de imputación** que además entrega feature importance. Para el pitch: "el modelo aprende qué variables territoriales predicen el estrés hídrico, permitiendo estimar cuencas con datos incompletos y simular escenarios futuros".

---

## 6. DEFINITION OF DONE POR FASE

```yaml
fase_0_done_when:
  repo: "berthcodex/isht-webapp con estructura monorepo (backend/ frontend/ etl/ ml/)"
  backend_health: "GET /health responde 200 en URL pública de Render"
  frontend_vivo: "URL pública de Vercel muestra mapa de Perú + título ISHT"
  conexion: "el frontend llama a /health del backend y muestra 'backend OK'"

fase_1_done_when:
  geoperu_cumplido: "cuencas Pfafstetter descargadas vía WFS de GeoPerú/GEOIDEP y cacheadas"
  oferta: "oferta por cuenca desde PISCO_HyM_GR2M (NetCDF) agregada"
  demanda: "demanda por cuenca (INEI + ANA derechos + proxy agro)"
  artefactos: "cuencas.geojson + indice_isht.json + tabla_features.parquet (159 filas)"
  etl_idempotente: "2 corridas → mismo hash"

fase_2_done_when:
  modelo: "ml/modelo.pkl entrenado (XGBoost)"
  metricas: "ml/metrics.json con MAE, R2, feature_importance"
  sanidad: "modelo marca Ica crítica y La Libertad sana (evals §9)"

fase_3_done_when:
  api_cuencas: "GET /api/cuencas → geojson con índice"
  api_indice: "GET /api/indice → tabla completa"
  api_simular: "POST /api/simular (pesos/escenario) → ranking recalculado"
  api_predecir: "POST /api/predecir (features) → índice predicho por el modelo"
  swagger: "/docs operativo"

fase_4_done_when:
  mapa_semaforo: "159 cuencas pintadas por color en Leaflet"
  drilldown: "clic en cuenca → panel con balance, brecha, valorización, feature importance"
  sliders: "mover slider recalcula y re-pinta en <500ms"
  proyeccion: "gráfico Recharts de trayectoria (cuencas bandera) consumiendo el backend"
  ranking: "tabla top-15 por retorno, ordenable"

fase_5_done_when:
  deploy_publico: "front Vercel + back Render públicos, estables, <3s carga"
  uptimerobot: "monitor sobre /health activo (mantiene caliente Render)"
  anexo_visual: "captura/GIF + URL del tablero para campo 10 de Facilita"
  diez_campos: "los 10 campos de las bases redactados (con nota de cumplimiento GeoPerú)"
  registrado: "propuesta subida a facilita.gob.pe/t/52313 dentro de plazo"
```

---

## 7. PROMPTS DE ARRANQUE PRE-ESCRITOS (Chat-Driven Development)

### Prompt Fase 0 — Esqueleto full-stack
```
Soy Joan, CEO de HIDATA, dev senior. Proyecto ISHT: web app de seguridad hídrica para la
GEOTÓN Perú. Monorepo isht-webapp con backend/ (FastAPI) y frontend/ (React+Vite+Leaflet).
Genérame: (1) estructura de carpetas del monorepo; (2) backend/main.py con FastAPI, CORS
habilitado para el dominio de Vercel, y endpoints GET /health (devuelve {"status":"ok",
"fase":"0"}) y GET /api/cuencas (placeholder que lee frontend/public/data/cuencas.geojson);
(3) backend/requirements.txt (fastapi, uvicorn, geopandas, pandas, joblib, xgboost, statsmodels);
(4) frontend con App.jsx que renderice mapa Leaflet de Perú (lat -9.19, lng -75, zoom 5) y haga
fetch a /health del backend mostrando 'backend OK'; (5) render.yaml para deploy del backend en
Render; (6) instrucciones exactas para desplegar backend en Render y frontend en Vercel desde
GitHub web, con la variable VITE_API_URL apuntando al backend. Zero-install, listo para pegar.
```

### Prompt Fase 1 — ETL con GeoPerú
```
Data engineer senior. ETL en etl/ que: (1) descargue cuencas Pfafstetter vía WFS de
GeoPerú/GEOIDEP con owslib y las cachee en data/raw/ (idempotente, con backoff exponencial
tenacity); (2) lea PISCO_HyM_GR2M.nc con xarray y agregue caudal+escorrentía promedio por
cuenca; (3) cargue demanda desde CSV (población INEI + derechos ANA + proxy NDVI agro);
(4) calcule balance, brecha y semáforo (rojo<-0.2, azul>0.1); (5) construya el índice 0-100
compuesto; (6) exporte cuencas.geojson, indice_isht.json y tabla_features.parquet;
(7) validate.py que verifique 159 cuencas, rangos 0-100 y sin nulos en campos clave.
Estructura loaders/ transforms/ exporters/. Funciones <20 líneas. Logs por paso.
La nota de cumplimiento debe registrar que las cuencas vienen de GeoPerú vía WFS.
```

### Prompt Fase 2 — ML
```
Data scientist senior. Entrena un XGBoost regresor (ml/train_model.py) que prediga el índice
de estrés hídrico 0-100 por cuenca a partir de features [oferta, demanda, ndvi, poblacion,
precip_anual, n_pozos, derechos_otorgados] desde tabla_features.parquet. Split 75/25, reporta
MAE, R2 y feature_importance en metrics.json, persiste modelo.pkl con joblib. Añade un test de
sanidad (evals_calibracion.json) que verifique que Ica sale crítica y La Libertad sana.
Si quieres, añade un anillo opcional: Prophet para proyectar la brecha de Ica a 5 años si su
serie tiene <20% gaps; si no, genera escenarios pesimista/base/optimista. Documenta la decisión.
```

### Prompt Fase 3 — Backend API que sirve el modelo
```
Backend FastAPI. Carga ml/modelo.pkl al iniciar (startup event). Endpoints:
GET /api/cuencas (geojson con índice), GET /api/indice (tabla),
POST /api/simular {pesos, escenario} → recalcula índice y devuelve ranking,
POST /api/predecir {features de una cuenca} → índice predicho por el modelo,
GET /api/metrics → metrics.json del modelo. Swagger en /docs. CORS para Vercel.
Maneja el caso modelo ausente con error claro. Funciones <20 líneas, servicios en services/.
```

### Prompt Fase 4 — Frontend interactivo
```
React+Leaflet+Recharts consumiendo el backend (VITE_API_URL). Tablero que: (1) pinte 159
cuencas por semáforo; (2) clic en cuenca → panel con balance, brecha, valorización en soles y
las feature importance del modelo; (3) 3 sliders (peso cantidad/calidad, escenario El Niño,
expansión demanda) que llamen a POST /api/simular y re-pinten en <500ms; (4) gráfico Recharts
de proyección de brecha (cuenca bandera) desde el backend; (5) tabla top-15 por retorno,
ordenable. Diseño sobrio y profesional (es para el Estado). Responsive. Listo para pegar.
```

---

## 8. CÓDIGO BASE — BACKEND QUE SIRVE EL MODELO (`backend/main.py`)

```python
"""ISHT API — sirve el índice, el modelo ML y la simulación de escenarios.
HIDATA Method: plano de control (lógica+modelo). Funciones pequeñas, observabilidad."""
import json, logging, joblib
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("isht.api")

app = FastAPI(title="ISHT API", version="2.0")
app.add_middleware(
    CORSMiddleware, allow_origins=["*"],  # en prod: restringir al dominio Vercel
    allow_methods=["*"], allow_headers=["*"],
)

DATA = Path("frontend/public/data")
MODEL = None
FEATURES = ["oferta", "demanda", "ndvi", "poblacion", "precip_anual", "n_pozos", "derechos_otorgados"]

@app.on_event("startup")
def cargar_modelo():
    """Carga modelo.pkl una sola vez al iniciar (no por request)."""
    global MODEL
    ruta = Path("ml/modelo.pkl")
    if ruta.exists():
        MODEL = joblib.load(ruta)
        log.info("Modelo ML cargado")
    else:
        log.warning("modelo.pkl ausente — /api/predecir devolverá 503")

@app.get("/health")
def health():
    return {"status": "ok", "fase": "live", "modelo": MODEL is not None}

@app.get("/api/cuencas")
def cuencas():
    f = DATA / "cuencas.geojson"
    if not f.exists():
        raise HTTPException(404, "cuencas.geojson no encontrado — correr ETL")
    return json.loads(f.read_text())

@app.get("/api/indice")
def indice():
    f = DATA / "indice_isht.json"
    if not f.exists():
        raise HTTPException(404, "indice_isht.json no encontrado — correr ETL")
    return json.loads(f.read_text())

@app.get("/api/metrics")
def metrics():
    f = Path("ml/metrics.json")
    return json.loads(f.read_text()) if f.exists() else {"detail": "sin métricas"}

class FeaturesCuenca(BaseModel):
    oferta: float; demanda: float; ndvi: float; poblacion: float
    precip_anual: float; n_pozos: float; derechos_otorgados: float

@app.post("/api/predecir")
def predecir(x: FeaturesCuenca):
    """Predice el índice de estrés de una cuenca con el modelo entrenado."""
    if MODEL is None:
        raise HTTPException(503, "Modelo no disponible")
    fila = [[getattr(x, f) for f in FEATURES]]
    pred = float(MODEL.predict(fila)[0])
    return {"indice_predicho": round(pred, 1)}

class Simulacion(BaseModel):
    peso_cantidad: float = 0.5; peso_calidad: float = 0.3; peso_presion: float = 0.2
    el_nino: float = 1.0; expansion_demanda: float = 0.0

@app.post("/api/simular")
def simular(s: Simulacion):
    """Recalcula el índice de las 159 cuencas bajo un escenario y devuelve ranking."""
    data = json.loads((DATA / "indice_isht.json").read_text())
    # (lógica de recálculo idéntica al ETL; se importa de services/recalculo.py)
    from services.recalculo import recalcular_ranking
    return recalcular_ranking(data, s.dict())
```

---

## 9. EVALS Y DATOS DE NEGOCIO (calibración del índice y del modelo)

5 preguntas que tú (experto) respondes para calibrar y para el test de sanidad:

1. **¿Qué cuenca SABES que está en crisis?** (Ica) → índice rojo y modelo lo predice. Si no, bug.
2. **¿Qué cuenca tiene superávit demostrado?** (La Libertad post-qochas) → azul/verde.
3. **¿Peso calidad vs cantidad** para el caso peruano? → calibra pesos.
4. **¿Umbral de brecha "crítico"** según ANA? → calibra UMBRAL_ROJO.
5. **¿Las 3 cifras más atacables** que necesitan fuente SIAF/ANA antes del pitch?

Archivo: `ml/evals_calibracion.json` con pares cuenca→semáforo esperado. Test de sanidad obligatorio antes de publicar (DoD F2).

---

## 10. RESILIENT INTEGRATION PATTERNS (Anti-Ban) — ADAPTADO

La integración con .gob.pe ocurre en el ETL batch (no en runtime). Matriz aplicada:

| Regla | Aplica | Implementación |
|---|---|---|
| Exponential Backoff | ✅ | `tenacity` en la descarga WFS de GeoPerú y en PISCO (§4) |
| Respetar Retry-After | ✅ | Si WFS/WMS responde 429/503 con header, esperar lo indicado |
| Circuit Breaker ligero | ⚠️ | 3 fallos → fuente alternativa (SHAPE-ZIP / ArcGIS REST) y log |
| **Cache local (clave)** | ✅✅ | Todo lo descargado se cachea en `data/raw/`. No re-descarga. Idempotencia + inmunidad a caída el día del pitch |
| Refresco de tokens | ❌ N/A | Servicios públicos sin token efímero |
| Heartbeat 5 min | ❌ N/A | No hay proceso 24/7 |
| UptimeRobot sobre /health | ✅ | Mantiene caliente Render free + alerta de caída del backend |

> **La verdadera defensa: cache + idempotencia.** Bajados los datos a `data/raw/`, el proyecto funciona offline. Si GeoPerú se cae durante el pitch, no nos afecta.

---

## 11. MAPA DE RIESGOS RED TEAM (full stack + ML)

| Riesgo | Prob | Impacto | Mitigación |
|:---|:---|:---|:---|
| **No alcanza el tiempo (hoy es deadline)** | Alta | Crítico | Ruta mínima F0→F1→F4. ML como "núcleo o nada". Si aprieta, índice sin ML + nota "modelo en validación" |
| **No se cumple el requisito GeoPerú → eliminación** | Media | **Crítico** | §4: cuencas vía WFS de GeoPerú es lo PRIMERO del ETL. Nota de cumplimiento explícita en el entregable |
| **Cold-start de Render free en demo en vivo** | Alta | Medio | UptimeRobot pinga /health cada 5 min para mantener caliente. Ping manual 10 min antes del pitch. Frontend cachea última respuesta |
| **Modelo XGBoost con pocos datos / overfitting** | Media | Alto | max_depth bajo, regularización, validación 75/25, métricas reportadas. Si R² malo, se reporta honesto y se usa el índice por balance |
| **Serie temporal insuficiente para SARIMAX/Prophet** | Alta | Medio | Anillo opcional: si no hay serie, escenarios en vez de proyección. No se fuerza |
| **NetCDF PISCO pesado/lento** | Media | Medio | Agregar por cuenca una vez en el ETL; el backend nunca toca el NetCDF |
| **CORS / VITE_API_URL mal configurado** | Media | Medio | Deploy temprano en F0 valida la conexión front-back antes de tener datos |
| **Modelo marca cuenca obviamente mal** | Media | Alto | Evals de sanidad (§9): Ica roja, La Libertad sana, antes de publicar |
| **Datos sensibles / IP de terceros en entregable** | Baja | Crítico | Bases §17: solo fuentes públicas. Sin acusaciones nominales (capa OEFA). Sin datos personales |
| **Sobre-ingeniería consume el tiempo** | Media | Alto | ML escalonado, principios adaptados. Lo completo > lo sofisticado incompleto |

---

## 12. LECCIONES APRENDIDAS (registro vivo del proyecto)

### Lección #ISHT-1 — 2026-06-05 — ML escalonado por riesgo de tiempo
- **Problema:** La tentación de meter 8 modelos (SARIMAX, LSTM, GWR...) en un deadline de horas.
- **Causa raíz:** Confundir "sofisticación visible" con "valor demostrable". LSTM exige series largas limpias que no tenemos garantizadas.
- **Solución:** Núcleo XGBoost (tabular, robusto, feature importance) + anillo opcional Prophet. LSTM/GWR a backlog post-concurso.
- **Impacto en ADN:** HIDATA gana un principio de selección de modelos: *el modelo correcto para los datos disponibles, no el de moda*. Escalonar ML por riesgo de tiempo en proyectos con deadline.

### Lección #ISHT-2 — 2026-06-05 — GeoPerú como requisito de admisibilidad
- **Problema:** El diagrama inicial listaba fuentes por entidad sin hacer central que GeoPerú es obligatorio por bases.
- **Causa raíz:** Tratar un requisito de admisibilidad como una fuente más.
- **Solución:** La descarga WFS de cuencas desde GeoPerú es el primer paso del ETL y se documenta como nota de cumplimiento.
- **Impacto en ADN:** Al auditar un concurso/licitación, los requisitos de admisibilidad se marcan como bloqueantes de fase, no como features.

---

## 13. CHECKLIST DE AUDITORÍA Y ENTREGA (13 puntos + cierre GEOTÓN)

**Auditoría HIDATA:**
- [x] 1. MASTER-PLAN con todas las secciones → este documento
- [ ] 2. Fase actual y DoD definidas → F0, §6
- [ ] 3. Triggers de transición verificables → DoD por fase
- [x] 4. Stack zero-install y gratuito → §3.3
- [ ] 5. Dataset de evals (calibración) → §9
- [x] 6. Decisiones arquitectónicas documentadas → notas en §3, §5, §8
- [x] 7. Backlog de visión → LSTM/GWR/DBSCAN (§5.3), 3 motores del plan estratégico
- [x] 8. Prompts de cada fase pre-escritos → §7
- [ ] 9. Código separación responsabilidades, funciones <20 líneas, tests → estructura dada
- [ ] 10. Red Team review de la fase actual → §11
- [⚠️] 11. Anti-Ban + Heartbeat → §10 (adaptado: cache+idempotencia+UptimeRobot)
- [⚠️] 12. Test de autonomía 72h → N/A justificado (request-response, no 24/7)
- [x] 13. Mantenibilidad perpetua → capas, ETL idempotente, modelo versionado

**Cierre GEOTÓN (lo que cuenta hoy):**
- [ ] Backend (Render) + Frontend (Vercel) públicos y estables
- [ ] **Cumplimiento GeoPerú demostrable** (cuencas vía WFS) — admisibilidad
- [ ] Modelo valida contra evals (Ica roja, La Libertad sana)
- [ ] Captura/GIF + URL del tablero para campo 10 (anexo visual)
- [ ] 10 campos de las bases redactados, con nota de cumplimiento GeoPerú
- [ ] **Propuesta registrada en facilita.gob.pe/t/52313 dentro de plazo**

---

## RUTA CRÍTICA DE HOY (de una mirada)

```
1. [45 min] F0: monorepo + FastAPI /health en Render + React+mapa en Vercel + conexión
2. [90 min] F1: ETL — cuencas WFS GeoPerú (admisibilidad!) + PISCO + demanda → índice 159 cuencas
3. [60 min] F2: XGBoost entrena → modelo.pkl + metrics + sanidad (Ica roja)
4. [45 min] F3: backend sirve /api/cuencas /indice /simular /predecir + Swagger
5. [90 min] F4: mapa semáforo + panel + sliders + proyección + ranking (el anexo visual)
6. [40 min] F5: pulido, UptimeRobot, captura/GIF, 10 campos, REGISTRAR en Facilita
   ──────────────────────────────────────────────────────────────────────────────
   Ruta mínima si el reloj quema: 1→2→4 (índice + mapa interactivo, ML "en validación").
   Núcleo ganador completo: + 3 (XGBoost) + proyección. Es lo que nos separa del PDF estático.
```

**Regla de oro:** GeoPerú primero (o no hay concurso), luego algo completo y honesto desplegado. El índice sobre 159 cuencas + XGBoost con feature importance + mapa interactivo ya supera al 95% del campo. LSTM/GWR son el techo del roadmap, no el piso de hoy.

---

*HIDATA Consulting — Joan Hidalgo (CEO) + Staff Engineer 100x. ISHT Master Plan de Ejecución v2 (Full Stack + ML). HIDATA Method v1.4 aplicado y adaptado. GEOTÓN Perú 2026. Modo paranoid red team. Vamos por el número uno de Latinoamérica.*
