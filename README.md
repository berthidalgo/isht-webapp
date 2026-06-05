# ISHT — Índice de Seguridad Hídrica Territorial del Perú

Web app full-stack que integra la **oferta hídrica oficial** (PISCO_HyM_GR2M de SENAMHI)
con la **demanda multisectorial** por cuenca, calcula la **brecha** de seguridad hídrica,
la **proyecta con ML**, la **valoriza** y **prioriza la inversión** por retorno.

> A diferencia de los visores estáticos del Estado, el ISHT es **interactivo y predictivo**:
> el decisor mueve un supuesto, ve el índice recalcularse y ve la proyección del modelo.

**GEOTÓN Perú 2026 · Categoría Territorio Sostenible · HiDATA**

---

## URLs públicas

| Servicio | Plataforma | URL |
|----------|-----------|-----|
| Frontend (anexo visual) | Vercel | _pendiente de deploy_ |
| Backend (API + Swagger) | Render | _pendiente de deploy → `/docs`_ |

> Cuando despliegues, reemplaza los "pendiente" por las URLs reales.

---

## Arquitectura (4 carpetas, 4 destinos)

| Carpeta | Qué es | Dónde vive | Cuándo corre |
|---------|--------|-----------|--------------|
| `etl/` | Prepara los datos (descarga, limpia, calcula índice) | Tu máquina / Colab | UNA VEZ. No se despliega. |
| `ml/` | Entrena el modelo XGBoost | Tu máquina / Colab | UNA VEZ, tras el ETL. No se despliega. |
| `backend/` | Sirve datos y modelo vía API | **Render** | EN VIVO, por request |
| `frontend/` | Mapa + sliders (lo que ve el jurado) | **Vercel** | EN VIVO, en el navegador |

El `etl/` produce `cuencas.geojson` + `indice_isht.json` → se copian a `backend/data/`.
El `ml/` produce `modelo.pkl` → el backend lo carga al iniciar.

---

## Cumplimiento de bases (admisibilidad)

La **data primigenia** (capa de cuencas Pfafstetter) se obtiene vía **WFS desde
GeoPerú / GEOIDEP** — requisito de admisibilidad de la GEOTÓN. Ver `etl/loaders/load_geoperu_wfs.py`.

---

## Cómo levantar en local (dev)

**Backend:**
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
# → http://localhost:8000/health  y  http://localhost:8000/docs
```

**Frontend:**
```bash
cd frontend
npm install
cp .env.example .env   # y edita VITE_API_URL
npm run dev
# → http://localhost:5173
```

---

## Estado del proyecto

- [x] **F0** — Esqueleto desplegado (este commit)
- [ ] F1 — ETL: GeoPerú + PISCO + demanda → brecha
- [ ] F2 — ML: XGBoost entrenado y persistido
- [ ] F3 — Backend API completa (índice + predicción + simulación)
- [ ] F4 — Frontend interactivo (mapa + sliders + proyección)
- [ ] F5 — Pulido + deploy público + registro en Facilita

---

*HiDATA — Joan Hidalgo. GEOTÓN Perú 2026.*
