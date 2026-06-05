// Recálculo client-side ligero del índice (para que los sliders respondan
// instantáneamente sin ida y vuelta al backend). La aritmética de la brecha
// es barata; la predicción del MODELO sí se pide al backend (POST /api/predecir).
//
// F4: implementar idéntico a backend/services/recalculo.py para coherencia.

export function semaforo(indice) {
  if (indice >= 66) return "rojo";
  if (indice >= 33) return "amarillo";
  return "azul";
}

export const COLOR = {
  rojo: "#dc2626",
  amarillo: "#f59e0b",
  azul: "#2563eb",
};

// Placeholder: en F4 recibe las cuencas y el escenario y devuelve el ranking.
export function recalcularLocal(_cuencas, _escenario) {
  return [];
}
