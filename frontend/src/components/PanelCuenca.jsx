export default function PanelCuenca({ cuenca, metrics, onPredict }) {
  if (!cuenca) {
    return (
      <div style={{ padding: "32px 16px", textAlign: "center", color: "#64748b", fontSize: "13px" }}>
        Selecciona una cuenca en el mapa o en el ranking para auditar sus métricas de seguridad hídrica.
      </div>
    );
  }

  // Estimación de valorización en soles (ej. costo de infraestructura o pérdida en agro)
  // Basado en el nivel de estrés y el área/demanda de la cuenca
  const indice = cuenca.indice ?? 50;
  const demanda = cuenca.demanda ?? 100;
  
  // Costo de infraestructura estimado en Soles (Fórmula indicativa de negocio)
  const costoInfraSoles = Math.round((demanda * 0.15) * (indice / 100.0) * 1.5 * 1000000);
  const perdidasAgroSoles = Math.round((demanda * 0.08) * (indice / 100.0) * 0.8 * 1000000);

  return (
    <div style={{ color: "#0f172a" }}>
      {/* Cabecera de Cuenca */}
      <div style={{ marginBottom: "16px" }}>
        <div style={{ fontSize: "11px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Código Pfafstetter: {cuenca.codigo}</div>
        <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#0f172a", margin: "4px 0 2px 0", letterSpacing: "-0.02em" }}>{cuenca.nombre}</h2>
        <span style={{
          display: "inline-block",
          fontSize: "11px",
          fontWeight: "600",
          background: cuenca.vertiente === "Pacific" ? "#eff6ff" : (cuenca.vertiente === "Titicaca" ? "#fffbeb" : "#f0fdf4"),
          color: cuenca.vertiente === "Pacific" ? "#2563eb" : (cuenca.vertiente === "Titicaca" ? "#d97706" : "#16a34a"),
          padding: "2px 8px",
          borderRadius: "4px",
          marginTop: "4px"
        }}>
          Vertiente del {cuenca.vertiente === "Pacific" ? "Pacífico" : (cuenca.vertiente === "Titicaca" ? "Titicaca" : "Atlántico")}
        </span>
      </div>

      <hr style={{ border: "0", borderTop: "1px solid #f1f5f9", margin: "16px 0" }} />

      {/* Bloque de Índices Compuestos */}
      <div style={{ marginBottom: "20px" }}>
        <div style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", marginBottom: "8px", letterSpacing: "0.05em" }}>Estado de Seguridad Hídrica (ISHT)</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "4px" }}>
          <span style={{ fontSize: "36px", fontWeight: "800", color: "#0f172a", letterSpacing: "-0.03em" }}>{indice.toFixed(1)}%</span>
          <span style={{ fontSize: "14px", fontWeight: "600", color: cuenca.semaforo === "rojo" ? "#ef4444" : (cuenca.semaforo === "amarillo" ? "#f59e0b" : "#3b82f6") }}>
            {cuenca.semaforo === "rojo" ? "ALTA CRISIS" : (cuenca.semaforo === "amarillo" ? "ESTRÉS MEDIO" : "ESTABLE / AZUL")}
          </span>
        </div>
        
        {/* Barra de Progreso */}
        <div style={{ width: "100%", height: "8px", background: "#e2e8f0", borderRadius: "999px", overflow: "hidden", marginBottom: "16px" }}>
          <div style={{
            width: `${indice}%`,
            height: "100%",
            background: cuenca.semaforo === "rojo" ? "#ef4444" : (cuenca.semaforo === "amarillo" ? "#f59e0b" : "#3b82f6"),
            borderRadius: "999px",
            transition: "width 0.3s ease"
          }} />
        </div>

        {/* Tres Dimensiones de Estrés */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", textAlign: "center" }}>
          <div style={{ background: "#f8fafc", padding: "8px", borderRadius: "8px", border: "1px solid #f1f5f9" }}>
            <div style={{ fontSize: "10px", color: "#64748b", fontWeight: "500", marginBottom: "4px" }}>Cantidad</div>
            <div style={{ fontSize: "13px", fontWeight: "700", color: "#334155" }}>{parseFloat(cuenca.estres_cantidad ?? 0).toFixed(0)}%</div>
          </div>
          <div style={{ background: "#f8fafc", padding: "8px", borderRadius: "8px", border: "1px solid #f1f5f9" }}>
            <div style={{ fontSize: "10px", color: "#64748b", fontWeight: "500", marginBottom: "4px" }}>Calidad</div>
            <div style={{ fontSize: "13px", fontWeight: "700", color: "#334155" }}>{parseFloat(cuenca.estres_calidad ?? 0).toFixed(0)}%</div>
          </div>
          <div style={{ background: "#f8fafc", padding: "8px", borderRadius: "8px", border: "1px solid #f1f5f9" }}>
            <div style={{ fontSize: "10px", color: "#64748b", fontWeight: "500", marginBottom: "4px" }}>Presión</div>
            <div style={{ fontSize: "13px", fontWeight: "700", color: "#334155" }}>{parseFloat(cuenca.presion ?? 0).toFixed(0)}%</div>
          </div>
        </div>
      </div>

      <hr style={{ border: "0", borderTop: "1px solid #f1f5f9", margin: "16px 0" }} />

      {/* Variables Físicas Reales */}
      <div style={{ marginBottom: "20px" }}>
        <div style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", marginBottom: "10px", letterSpacing: "0.05em" }}>Balances Físicos Colectados</div>
        
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 16px", fontSize: "12px" }}>
          <div>
            <div style={{ color: "#64748b", marginBottom: "2px" }}>Oferta Anual:</div>
            <div style={{ fontWeight: "600", color: "#0f172a" }}>{parseFloat(cuenca.oferta).toLocaleString("en-US", { minimumFractionDigits: 1 })} MMC</div>
          </div>
          <div>
            <div style={{ color: "#64748b", marginBottom: "2px" }}>Demanda Anual:</div>
            <div style={{ fontWeight: "600", color: "#0f172a" }}>{parseFloat(cuenca.demanda).toLocaleString("en-US", { minimumFractionDigits: 1 })} MMC</div>
          </div>
          <div>
            <div style={{ color: "#64748b", marginBottom: "2px" }}>Precipitación:</div>
            <div style={{ fontWeight: "600", color: "#0f172a" }}>{parseFloat(cuenca.precip_anual).toFixed(1)} mm/año</div>
          </div>
          <div>
            <div style={{ color: "#64748b", marginBottom: "2px" }}>Población INEI:</div>
            <div style={{ fontWeight: "600", color: "#0f172a" }}>{parseInt(cuenca.poblacion).toLocaleString("en-US")} hab.</div>
          </div>
        </div>
      </div>

      <hr style={{ border: "0", borderTop: "1px solid #f1f5f9", margin: "16px 0" }} />

      {/* Valorización en Soles (Decisión de Negocio / SIAF / ANA) */}
      <div style={{ marginBottom: "20px" }}>
        <div style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", marginBottom: "10px", letterSpacing: "0.05em" }}>Valorización Económica del Riesgo</div>
        
        <div style={{ background: "#fffbeb", border: "1px solid #fef3c7", padding: "12px", borderRadius: "8px", fontSize: "12px" }}>
          <div style={{ marginBottom: "8px" }}>
            <span style={{ color: "#78350f" }}>Costo de Infraestructura (SIAF):</span>
            <div style={{ fontWeight: "700", fontSize: "14px", color: "#b45309" }}>
              S/. {costoInfraSoles.toLocaleString("es-PE")}
            </div>
          </div>
          <div>
            <span style={{ color: "#78350f" }}>Pérdidas Agrícolas Potenciales (PBI Agro):</span>
            <div style={{ fontWeight: "700", fontSize: "14px", color: "#b45309" }}>
              S/. {perdidasAgroSoles.toLocaleString("es-PE")}
            </div>
          </div>
        </div>
      </div>

      <hr style={{ border: "0", borderTop: "1px solid #f1f5f9", margin: "16px 0" }} />

      {/* Feature Importance del Modelo XGBoost (Interpretabilidad) */}
      {metrics && metrics.feature_importance && (
        <div style={{ marginBottom: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <div style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Importancia del Modelo (XGBoost)</div>
            <button
              onClick={onPredict}
              style={{
                background: "#0f172a",
                color: "#ffffff",
                border: "none",
                fontSize: "10px",
                fontWeight: "600",
                padding: "4px 8px",
                borderRadius: "4px",
                cursor: "pointer",
                transition: "background 0.1s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#334155"}
              onMouseLeave={(e) => e.currentTarget.style.background = "#0f172a"}
            >
              Predecir ML
            </button>
          </div>
          
          <div style={{ fontSize: "11px", display: "grid", gap: "6px" }}>
            {Object.entries(metrics.feature_importance)
              .sort((a, b) => b[1] - a[1])
              .map(([feat, imp]) => (
                <div key={feat}>
                  <div style={{ display: "flex", justifyContent: "space-between", color: "#475569", marginBottom: "2px" }}>
                    <span style={{ fontFamily: "monospace" }}>{feat}</span>
                    <span style={{ fontWeight: "600" }}>{(imp * 100).toFixed(1)}%</span>
                  </div>
                  <div style={{ width: "100%", height: "4px", background: "#f1f5f9", borderRadius: "999px" }}>
                    <div style={{ width: `${imp * 100}%`, height: "100%", background: "#475569", borderRadius: "999px" }} />
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
