export default function PanelCuenca({ cuenca, metrics, onPredict }) {
  if (!cuenca) {
    return (
      <div className="glass-panel" style={{
        padding: "36px 20px",
        textAlign: "center",
        color: "var(--text-secondary)",
        fontSize: "12px",
        fontWeight: "600",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "12px",
        height: "100%",
        justifyContent: "center"
      }}>
        {/* Globe Icon */}
        <svg style={{ width: "32px", height: "36px", color: "var(--text-muted)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span style={{ lineHeight: "1.5" }}>Selecciona una cuenca en el mapa o utiliza el buscador superior para auditar sus métricas de seguridad hídrica territorial.</span>
      </div>
    );
  }

  const indice = cuenca.indice ?? 50;
  const demanda = cuenca.demanda ?? 100;
  
  // Costo de infraestructura estimado en Soles (Fórmula indicativa de negocio)
  const costoInfraSoles = Math.round((demanda * 0.15) * (indice / 100.0) * 1.5 * 1000000);
  const perdidasAgroSoles = Math.round((demanda * 0.08) * (indice / 100.0) * 0.8 * 1000000);

  const getSemaforoLabel = (semaforo) => {
    if (semaforo === "rojo") return "CRISIS CRÍTICA";
    if (semaforo === "amarillo") return "ESTRÉS MEDIO";
    return "ESTABLE / SEGURA";
  };

  const getSemaforoColor = (semaforo) => {
    if (semaforo === "rojo") return "var(--color-rojo)";
    if (semaforo === "amarillo") return "var(--color-amarillo)";
    return "var(--color-verde)";
  };

  const isCritical = cuenca.semaforo === "rojo";

  return (
    <div className={`glass-panel ${isCritical ? "pulse-red-glow" : ""}`} style={{
      color: "var(--text-primary)",
      padding: "18px",
      transition: "all 0.3s ease"
    }}>
      {/* Cabecera de Cuenca */}
      <div style={{ marginBottom: "12px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: "10px", fontWeight: "700", color: "var(--text-muted)", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Código: {cuenca.codigo}
          </div>
          <span style={{
            fontSize: "9px",
            fontWeight: "700",
            background: cuenca.vertiente === "Pacific" ? "rgba(59,130,246,0.08)" : (cuenca.vertiente === "Titicaca" ? "rgba(245,158,11,0.08)" : "rgba(16,185,129,0.08)"),
            color: cuenca.vertiente === "Pacific" ? "#2563eb" : (cuenca.vertiente === "Titicaca" ? "#d97706" : "#059669"),
            padding: "2px 6px",
            borderRadius: "4px",
            border: "1px solid currentColor"
          }}>
            Vertiente {cuenca.vertiente === "Pacific" ? "Pacífico" : (cuenca.vertiente === "Titicaca" ? "Titicaca" : "Atlántico")}
          </span>
        </div>
        <h2 style={{ fontSize: "18px", fontWeight: "800", color: "var(--text-primary)", margin: "6px 0 0 0", letterSpacing: "-0.02em" }}>
          {cuenca.nombre}
        </h2>
      </div>

      <hr style={{ border: "0", borderTop: "1px solid var(--border-color)", margin: "12px 0" }} />

      {/* Bloque de Índices Compuestos */}
      <div style={{ marginBottom: "14px" }}>
        <div style={{ fontSize: "9px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "6px", letterSpacing: "0.05em" }}>
          Índice ISHT de Riesgo Hídrico
        </div>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
          <span style={{ fontSize: "32px", fontWeight: "800", color: "var(--text-primary)", letterSpacing: "-0.03em" }}>
            {indice.toFixed(1)}%
          </span>
          <span style={{
            fontSize: "10px",
            fontWeight: "800",
            color: getSemaforoColor(cuenca.semaforo),
            padding: "3px 8px",
            borderRadius: "6px",
            background: `${getSemaforoColor(cuenca.semaforo)}0f`,
            border: `1px solid ${getSemaforoColor(cuenca.semaforo)}20`
          }}>
            {getSemaforoLabel(cuenca.semaforo)}
          </span>
        </div>
        
        {/* Barra de Progreso Premium */}
        <div style={{ width: "100%", height: "6px", background: "rgba(15,23,42,0.05)", borderRadius: "999px", overflow: "hidden", marginBottom: "12px" }}>
          <div style={{
            width: `${indice}%`,
            height: "100%",
            background: `linear-gradient(90deg, ${getSemaforoColor(cuenca.semaforo)}dd, ${getSemaforoColor(cuenca.semaforo)}ff)`,
            borderRadius: "999px",
            transition: "width 0.4s cubic-bezier(0.16, 1, 0.3, 1)"
          }} />
        </div>

        {/* Tres Dimensiones de Estrés (Termómetros) */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "6px" }}>
          <div style={{ background: "#f8fafc", padding: "8px 6px", borderRadius: "10px", border: "1px solid var(--border-color)", textAlign: "center" }}>
            <div style={{ fontSize: "9px", color: "var(--text-muted)", fontWeight: "700", marginBottom: "2px" }}>Cantidad</div>
            <div style={{ fontSize: "12px", fontWeight: "800", color: "var(--color-verde)", fontFamily: "var(--font-mono)" }}>
              {parseFloat(cuenca.estres_cantidad ?? cuenca.brecha_norm ?? 50.0).toFixed(0)}%
            </div>
          </div>
          <div style={{ background: "#f8fafc", padding: "8px 6px", borderRadius: "10px", border: "1px solid var(--border-color)", textAlign: "center" }}>
            <div style={{ fontSize: "9px", color: "var(--text-muted)", fontWeight: "700", marginBottom: "2px" }}>Calidad</div>
            <div style={{ fontSize: "12px", fontWeight: "800", color: "var(--color-amarillo)", fontFamily: "var(--font-mono)" }}>
              {parseFloat(cuenca.estres_calidad ?? 50.0).toFixed(0)}%
            </div>
          </div>
          <div style={{ background: "#f8fafc", padding: "8px 6px", borderRadius: "10px", border: "1px solid var(--border-color)", textAlign: "center" }}>
            <div style={{ fontSize: "9px", color: "var(--text-muted)", fontWeight: "700", marginBottom: "2px" }}>Presión</div>
            <div style={{ fontSize: "12px", fontWeight: "800", color: "var(--color-rojo)", fontFamily: "var(--font-mono)" }}>
              {parseFloat(cuenca.presion ?? 50.0).toFixed(0)}%
            </div>
          </div>
        </div>
      </div>

      <hr style={{ border: "0", borderTop: "1px solid var(--border-color)", margin: "12px 0" }} />

      {/* Variables Físicas Reales */}
      <div style={{ marginBottom: "14px" }}>
        <div style={{ fontSize: "9px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "8px", letterSpacing: "0.05em" }}>
          Variables Físicas Reales (ANA/INEI)
        </div>
        
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 12px", fontSize: "11px" }}>
          <div>
            <div style={{ color: "var(--text-muted)", fontSize: "10px", marginBottom: "1px" }}>Oferta Anual:</div>
            <div style={{ fontWeight: "700", color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>
              {parseFloat(cuenca.oferta).toLocaleString("en-US", { minimumFractionDigits: 1 })} MMC
            </div>
          </div>
          <div>
            <div style={{ color: "var(--text-muted)", fontSize: "10px", marginBottom: "1px" }}>Demanda Anual:</div>
            <div style={{ fontWeight: "700", color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>
              {parseFloat(cuenca.demanda).toLocaleString("en-US", { minimumFractionDigits: 1 })} MMC
            </div>
          </div>
          <div>
            <div style={{ color: "var(--text-muted)", fontSize: "10px", marginBottom: "1px" }}>Precipitación:</div>
            <div style={{ fontWeight: "700", color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>
              {parseFloat(cuenca.precip_anual).toFixed(1)} mm
            </div>
          </div>
          <div>
            <div style={{ color: "var(--text-muted)", fontSize: "10px", marginBottom: "1px" }}>Población INEI:</div>
            <div style={{ fontWeight: "700", color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>
              {parseInt(cuenca.poblacion).toLocaleString("en-US")} hab.
            </div>
          </div>
        </div>
      </div>

      <hr style={{ border: "0", borderTop: "1px solid var(--border-color)", margin: "12px 0" }} />

      {/* McKinsey Financial Risk Valuation */}
      <div>
        <div style={{ fontSize: "9px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "8px", letterSpacing: "0.05em" }}>
          McKinsey Valuation & Presupuestos S/
        </div>
        
        <div style={{
          background: "#fffbeb", /* elegant warm amber tint */
          border: "1px solid #fde68a",
          padding: "10px 12px",
          borderRadius: "10px",
          fontSize: "11px"
        }}>
          <div style={{ marginBottom: "6px" }}>
            <span style={{ color: "#78350f", fontWeight: "600", fontSize: "10px" }}>Presupuesto Infraestructura Requerido (SIAF):</span>
            <div style={{ fontWeight: "800", fontSize: "14px", color: "#b45309", fontFamily: "var(--font-mono)", marginTop: "1px" }}>
              S/. {costoInfraSoles.toLocaleString("es-PE")}
            </div>
          </div>
          <div>
            <span style={{ color: "#78350f", fontWeight: "600", fontSize: "10px" }}>Pérdidas del PBI Agrícola Estimadas:</span>
            <div style={{ fontWeight: "800", fontSize: "14px", color: "#b45309", fontFamily: "var(--font-mono)", marginTop: "1px" }}>
              S/. {perdidasAgroSoles.toLocaleString("es-PE")}
            </div>
          </div>
        </div>
      </div>

      {/* Predict button highlight shortcut */}
      <button 
        onClick={onPredict}
        className="btn-premium"
        style={{
          marginTop: "12px",
          width: "100%",
          fontSize: "11px",
          padding: "8px 12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px"
        }}
      >
        <span>🔮 Probar en Inferencia XGBoost</span>
      </button>
    </div>
  );
}
