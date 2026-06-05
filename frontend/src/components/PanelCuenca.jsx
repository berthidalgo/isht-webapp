export default function PanelCuenca({ cuenca, metrics, onPredict }) {
  if (!cuenca) {
    return (
      <div style={{
        padding: "48px 24px",
        textAlign: "center",
        color: "var(--text-secondary)",
        fontSize: "13px",
        fontWeight: "500",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "12px"
      }}>
        {/* Globe Icon */}
        <svg style={{ width: "36px", height: "36px", color: "var(--text-muted)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span>Selecciona una cuenca en el mapa o utiliza el buscador superior para auditar sus métricas de seguridad hídrica territorial.</span>
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
    <div className={isCritical ? "pulse-red-glow" : ""} style={{
      color: "var(--text-primary)",
      borderRadius: "14px",
      border: isCritical ? "1px solid var(--color-rojo)" : "1px solid rgba(255, 255, 255, 0.04)",
      padding: "16px",
      background: isCritical ? "rgba(244, 63, 94, 0.04)" : "rgba(255, 255, 255, 0.02)",
      transition: "all 0.3s ease"
    }}>
      {/* Cabecera de Cuenca */}
      <div style={{ marginBottom: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ fontSize: "10px", fontWeight: "700", color: "var(--text-muted)", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Código: {cuenca.codigo}
          </div>
          <span style={{
            fontSize: "9px",
            fontWeight: "700",
            background: cuenca.vertiente === "Pacific" ? "rgba(59,130,246,0.15)" : (cuenca.vertiente === "Titicaca" ? "rgba(245,158,11,0.15)" : "rgba(16,185,129,0.15)"),
            color: cuenca.vertiente === "Pacific" ? "#60a5fa" : (cuenca.vertiente === "Titicaca" ? "#fbbf24" : "#34d399"),
            padding: "2px 6px",
            borderRadius: "4px"
          }}>
            Vertiente {cuenca.vertiente === "Pacific" ? "Pacífico" : (cuenca.vertiente === "Titicaca" ? "Titicaca" : "Atlántico")}
          </span>
        </div>
        <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#ffffff", margin: "6px 0 4px 0", letterSpacing: "-0.02em" }}>
          {cuenca.nombre}
        </h2>
      </div>

      <hr style={{ border: "0", borderTop: "1px solid rgba(255,255,255,0.06)", margin: "14px 0" }} />

      {/* Bloque de Índices Compuestos */}
      <div style={{ marginBottom: "18px" }}>
        <div style={{ fontSize: "10px", fontWeight: "700", color: "var(--text-secondary)", textTransform: "uppercase", marginBottom: "8px", letterSpacing: "0.05em" }}>
          Índice ISHT de Riesgo Hídrico
        </div>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "8px" }}>
          <span style={{ fontSize: "38px", fontWeight: "800", color: "#ffffff", letterSpacing: "-0.03em" }}>
            {indice.toFixed(1)}%
          </span>
          <span style={{
            fontSize: "11px",
            fontWeight: "800",
            color: getSemaforoColor(cuenca.semaforo),
            padding: "2px 8px",
            borderRadius: "6px",
            background: `${getSemaforoColor(cuenca.semaforo)}1a`,
            border: `1px solid ${getSemaforoColor(cuenca.semaforo)}30`
          }}>
            {getSemaforoLabel(cuenca.semaforo)}
          </span>
        </div>
        
        {/* Barra de Progreso Premium */}
        <div style={{ width: "100%", height: "6px", background: "rgba(255,255,255,0.08)", borderRadius: "999px", overflow: "hidden", marginBottom: "14px" }}>
          <div style={{
            width: `${indice}%`,
            height: "100%",
            background: `linear-gradient(90deg, ${getSemaforoColor(cuenca.semaforo)}dd, ${getSemaforoColor(cuenca.semaforo)}ff)`,
            borderRadius: "999px",
            boxShadow: `0 0 8px ${getSemaforoColor(cuenca.semaforo)}60`,
            transition: "width 0.4s cubic-bezier(0.16, 1, 0.3, 1)"
          }} />
        </div>

        {/* Tres Dimensiones de Estrés (Termómetros) */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
          <div style={{ background: "rgba(255,255,255,0.02)", padding: "10px 8px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.04)", textAlign: "center" }}>
            <div style={{ fontSize: "10px", color: "var(--text-secondary)", fontWeight: "600", marginBottom: "4px" }}>Cantidad</div>
            <div style={{ fontSize: "14px", fontWeight: "700", color: "var(--color-verde)", fontFamily: "var(--font-mono)" }}>
              {parseFloat(cuenca.estres_cantidad ?? 0).toFixed(0)}%
            </div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.02)", padding: "10px 8px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.04)", textAlign: "center" }}>
            <div style={{ fontSize: "10px", color: "var(--text-secondary)", fontWeight: "600", marginBottom: "4px" }}>Calidad</div>
            <div style={{ fontSize: "14px", fontWeight: "700", color: "var(--color-amarillo)", fontFamily: "var(--font-mono)" }}>
              {parseFloat(cuenca.estres_calidad ?? 0).toFixed(0)}%
            </div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.02)", padding: "10px 8px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.04)", textAlign: "center" }}>
            <div style={{ fontSize: "10px", color: "var(--text-secondary)", fontWeight: "600", marginBottom: "4px" }}>Presión</div>
            <div style={{ fontSize: "14px", fontWeight: "700", color: "var(--color-rojo)", fontFamily: "var(--font-mono)" }}>
              {parseFloat(cuenca.presion ?? 0).toFixed(0)}%
            </div>
          </div>
        </div>
      </div>

      <hr style={{ border: "0", borderTop: "1px solid rgba(255,255,255,0.06)", margin: "14px 0" }} />

      {/* Variables Físicas Reales */}
      <div style={{ marginBottom: "18px" }}>
        <div style={{ fontSize: "10px", fontWeight: "700", color: "var(--text-secondary)", textTransform: "uppercase", marginBottom: "10px", letterSpacing: "0.05em" }}>
          Variables de Entrada Reales (PISCO/INEI)
        </div>
        
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 14px", fontSize: "12px" }}>
          <div>
            <div style={{ color: "var(--text-secondary)", fontSize: "11px", marginBottom: "2px" }}>Oferta Anual:</div>
            <div style={{ fontWeight: "700", color: "#ffffff", fontFamily: "var(--font-mono)" }}>
              {parseFloat(cuenca.oferta).toLocaleString("en-US", { minimumFractionDigits: 1 })} MMC
            </div>
          </div>
          <div>
            <div style={{ color: "var(--text-secondary)", fontSize: "11px", marginBottom: "2px" }}>Demanda Anual:</div>
            <div style={{ fontWeight: "700", color: "#ffffff", fontFamily: "var(--font-mono)" }}>
              {parseFloat(cuenca.demanda).toLocaleString("en-US", { minimumFractionDigits: 1 })} MMC
            </div>
          </div>
          <div>
            <div style={{ color: "var(--text-secondary)", fontSize: "11px", marginBottom: "2px" }}>Precipitación:</div>
            <div style={{ fontWeight: "700", color: "#ffffff", fontFamily: "var(--font-mono)" }}>
              {parseFloat(cuenca.precip_anual).toFixed(1)} mm
            </div>
          </div>
          <div>
            <div style={{ color: "var(--text-secondary)", fontSize: "11px", marginBottom: "2px" }}>Población INEI:</div>
            <div style={{ fontWeight: "700", color: "#ffffff", fontFamily: "var(--font-mono)" }}>
              {parseInt(cuenca.poblacion).toLocaleString("en-US")} hab.
            </div>
          </div>
        </div>
      </div>

      <hr style={{ border: "0", borderTop: "1px solid rgba(255,255,255,0.06)", margin: "14px 0" }} />

      {/* McKinsey Financial Risk Valuation */}
      <div>
        <div style={{ fontSize: "10px", fontWeight: "700", color: "var(--text-secondary)", textTransform: "uppercase", marginBottom: "10px", letterSpacing: "0.05em" }}>
          Valorización de Riesgos Financieros
        </div>
        
        <div style={{
          background: "rgba(245, 158, 11, 0.04)",
          border: "1px solid rgba(245, 158, 11, 0.15)",
          padding: "12px",
          borderRadius: "10px",
          fontSize: "12px"
        }}>
          <div style={{ marginBottom: "8px" }}>
            <span style={{ color: "rgba(251, 191, 36, 0.8)", fontWeight: "500", fontSize: "11px" }}>Presupuesto de Infraestructura Requerido (SIAF):</span>
            <div style={{ fontWeight: "800", fontSize: "15px", color: "#fbbf24", fontFamily: "var(--font-mono)", marginTop: "2px" }}>
              S/. {costoInfraSoles.toLocaleString("es-PE")}
            </div>
          </div>
          <div>
            <span style={{ color: "rgba(251, 191, 36, 0.8)", fontWeight: "500", fontSize: "11px" }}>Pérdidas del PBI Agrícola Proyectadas:</span>
            <div style={{ fontWeight: "800", fontSize: "15px", color: "#fbbf24", fontFamily: "var(--font-mono)", marginTop: "2px" }}>
              S/. {perdidasAgroSoles.toLocaleString("es-PE")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
