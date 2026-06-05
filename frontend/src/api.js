// Capa de acceso al backend ISHT (Render).
// La URL viene de la variable de entorno VITE_API_URL (ver .env.example).
const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function getJSON(path, opts) {
  const res = await fetch(`${API}${path}`, opts);
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} en ${path}${detail ? `: ${detail}` : ""}`);
  }
  return res.json();
}

// F0: probar la conexión con el backend.
export const getHealth = () => getJSON("/health");

// F1+: datos del índice.
export const getCuencas = () => getJSON("/api/cuencas");
export const getIndice = () => getJSON("/api/indice");

// F2+: métricas del modelo.
export const getMetrics = () => getJSON("/api/metrics");

// F3+: simulación de escenario.
export const simular = (escenario) =>
  getJSON("/api/simular", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(escenario),
  });

// F3+: predicción puntual con el modelo.
export const predecir = (features) =>
  getJSON("/api/predecir", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(features),
  });

export { API };
