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
  rojo: "#ef4444",      // sleek red
  amarillo: "#f59e0b",  // sleek amber
  azul: "#3b82f6",      // sleek blue
};

export function recalcularLocal(cuencas, escenario) {
  const wCant = parseFloat(escenario.peso_cantidad ?? 0.5);
  const wCal = parseFloat(escenario.peso_calidad ?? 0.3);
  const wPres = parseFloat(escenario.peso_presion ?? 0.2);
  const elNino = parseFloat(escenario.el_nino ?? 1.0);
  const expansion = parseFloat(escenario.expansion_demanda ?? 0.0);
  
  const totalWeight = wCant + wCal + wPres || 1.0;
  
  return cuencas.map((c) => {
    let cant = parseFloat(c.estres_cantidad ?? c.brecha_norm ?? 50.0);
    let cal = parseFloat(c.estres_calidad ?? 50.0);
    let pres = parseFloat(c.presion ?? 50.0);
    
    cant = Math.min(100.0, cant * elNino);
    pres = Math.min(100.0, pres * (1.0 + expansion));
    
    const idx = (cant * wCant + cal * wCal + pres * wPres) / totalWeight;
    const finalIdx = Math.round(Math.min(100.0, Math.max(0.0, idx)) * 10) / 10;
    
    return {
      ...c,
      indice: finalIdx,
      semaforo: semaforo(finalIdx),
    };
  });
}
