import { useState } from "react";

export default function ControlesEscenario({ escenario, onChange }) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSliderChange = (key, value) => {
    if (onChange) {
      onChange({ ...escenario, [key]: value });
    }
  };

  const applyPreset = (presetWeights) => {
    if (onChange) {
      onChange({
        ...escenario,
        ...presetWeights
      });
    }
  };

  const FOCUS_MODES = [
    {
      id: "balanceado",
      name: "⚖️ Enfoque de Planificación Física",
      desc: "Analiza el balance hídrico natural (lluvias y ríos) vs el consumo humano y agrícola básico. Ideal para planeamiento clásico.",
      icon: "⚖️",
      weights: { peso_cantidad: 0.5, peso_calidad: 0.3, peso_presion: 0.2, peso_mineria: 0.0, peso_agroexportacion: 0.0 }
    },
    {
      id: "minero",
      name: "⛏️ Enfoque de Seguridad Minera y Social",
      desc: "Integra la disponibilidad de agua con el impacto de concesiones de INGEMMET en cabeceras de cuenca y pasivos ambientales de alto riesgo.",
      icon: "⛏️",
      weights: { peso_cantidad: 0.4, peso_calidad: 0.3, peso_presion: 0.3, peso_mineria: 0.8, peso_agroexportacion: 0.1 }
    },
    {
      id: "agro",
      name: "🥑 Enfoque de Agroexportación y Acuíferos",
      desc: "Cruza la huella hídrica y retorno ($ FOB/m³) de cultivos de élite (palta, arándano) de la SUNAT con la tasa de descenso de napas subterráneas.",
      icon: "🥑",
      weights: { peso_cantidad: 0.3, peso_calidad: 0.2, peso_presion: 0.5, peso_mineria: 0.1, peso_agroexportacion: 0.8 }
    },
    {
      id: "integrado",
      name: "🚨 Enfoque de Prevención Nacional Multidimensional",
      desc: "El modelo nacional preventivo integral: unifica factores físicos, presiones mineras, agroexportadoras y climáticas en un solo índice.",
      icon: "🚨",
      weights: { peso_cantidad: 0.5, peso_calidad: 0.3, peso_presion: 0.2, peso_mineria: 0.6, peso_agroexportacion: 0.6 }
    }
  ];

  const PRESETS_EL_NINO = [
    { name: "Sin Anomalía (Normal)", icon: "☀️", value: 1.0 },
    { name: "Anomalía Moderada", icon: "🌦️", value: 1.4 },
    { name: "Mega El Niño (Crítico)", icon: "🔥", value: 1.8 }
  ];

  const getActiveFocusMode = () => {
    for (const mode of FOCUS_MODES) {
      const w = mode.weights;
      if (
        Math.abs(escenario.peso_mineria - w.peso_mineria) < 0.05 &&
        Math.abs(escenario.peso_agroexportacion - w.peso_agroexportacion) < 0.05 &&
        Math.abs(escenario.peso_cantidad - w.peso_cantidad) < 0.05
      ) {
        return mode.id;
      }
    }
    return "custom";
  };

  const activeFocus = getActiveFocusMode();

  return (
    <div className="glass-panel" style={{ padding: "18px", display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <h3 style={{ fontSize: "14px", fontWeight: "800", letterSpacing: "-0.01em", color: "var(--text-primary)" }}>
          Directrices de Planificación Estratégica (ISHT)
        </h3>
        <span style={{
          background: "rgba(79, 70, 229, 0.08)",
          color: "var(--primary)",
          fontSize: "9px",
          fontWeight: "800",
          padding: "2px 6px",
          borderRadius: "4px"
        }}>
          Simulador Preventivo
        </span>
      </div>

      <p style={{ margin: 0, fontSize: "11px", color: "var(--text-muted)", lineHeight: "1.4" }}>
        Selecciona una <strong>Directriz de Gestión Pública</strong>. El sistema reajustará de inmediato la ponderación de factores físicos, mineros e hídricos sin que tengas que lidiar con las complejas perillas matemáticas.
      </p>

      {/* ENFOQUES DE ANÁLISIS (SISTEMA DE PRESETS PREMIUM) */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {FOCUS_MODES.map((mode) => {
          const isSelected = activeFocus === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => applyPreset(mode.weights)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: "4px",
                background: isSelected ? "linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)" : "#ffffff",
                border: isSelected ? "1px solid rgba(255,255,255,0.15)" : "1px solid var(--border-color)",
                color: isSelected ? "#ffffff" : "var(--text-primary)",
                padding: "10px 12px",
                borderRadius: "10px",
                cursor: "pointer",
                textAlign: "left",
                boxShadow: isSelected ? "0 4px 12px rgba(79, 70, 229, 0.15)" : "none",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = "var(--primary)";
                  e.currentTarget.style.background = "#f8fafc";
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = "var(--border-color)";
                  e.currentTarget.style.background = "#ffffff";
                }
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: "800", fontSize: "12px" }}>
                <span>{mode.name}</span>
              </div>
              <div style={{
                fontSize: "10px",
                color: isSelected ? "rgba(255,255,255,0.85)" : "var(--text-muted)",
                lineHeight: "1.35",
                fontWeight: "500"
              }}>
                {mode.desc}
              </div>
            </button>
          );
        })}
      </div>

      {/* NUEVO PANEL: ENTENDIMIENTO DE PONDERACIÓN V6.0 (HUMANIZADO) */}
      <div style={{
        background: "#f8fafc",
        border: "1px solid var(--border-color)",
        borderRadius: "12px",
        padding: "12px",
        display: "flex",
        flexDirection: "column",
        gap: "8px"
      }}>
        <div style={{ fontSize: "9.5px", fontWeight: "800", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          📊 Configuración de Criterios Activa (Ponderación V6.0)
        </div>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "11px" }}>
          {/* Disponibilidad Física */}
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-secondary)", fontWeight: "600" }}>💧 Balance Físico del Agua</span>
              <strong style={{ color: "var(--text-primary)" }}>
                {Math.round(escenario.peso_cantidad * 100)}%
              </strong>
            </div>
            <div style={{ width: "100%", height: "4px", background: "rgba(15,23,42,0.04)", borderRadius: "99px", overflow: "hidden" }}>
              <div style={{ width: `${escenario.peso_cantidad * 100}%`, height: "100%", background: "var(--color-verde)", borderRadius: "99px" }} />
            </div>
          </div>

          {/* Calidad Física */}
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-secondary)", fontWeight: "600" }}>🧪 Control de Calidad y Vertimientos</span>
              <strong style={{ color: "var(--text-primary)" }}>
                {Math.round(escenario.peso_calidad * 100)}%
              </strong>
            </div>
            <div style={{ width: "100%", height: "4px", background: "rgba(15,23,42,0.04)", borderRadius: "99px", overflow: "hidden" }}>
              <div style={{ width: `${escenario.peso_calidad * 100}%`, height: "100%", background: "var(--color-amarillo)", borderRadius: "99px" }} />
            </div>
          </div>

          {/* Presión Poblacional */}
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-secondary)", fontWeight: "600" }}>👥 Demanda de Agua Poblacional</span>
              <strong style={{ color: "var(--text-primary)" }}>
                {Math.round(escenario.peso_presion * 100)}%
              </strong>
            </div>
            <div style={{ width: "100%", height: "4px", background: "rgba(15,23,42,0.04)", borderRadius: "99px", overflow: "hidden" }}>
              <div style={{ width: `${escenario.peso_presion * 100}%`, height: "100%", background: "var(--primary)", borderRadius: "99px" }} />
            </div>
          </div>

          {/* Multiplicadores Socioeconómicos Avanzados */}
          <div style={{ display: "flex", gap: "8px", borderTop: "1px dashed var(--border-color)", paddingTop: "6px", marginTop: "2px" }}>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "2px" }}>
              <span style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: "700" }}>⛏️ PENALIDAD MINERA</span>
              <span style={{ fontSize: "12px", fontWeight: "800", color: escenario.peso_mineria > 0 ? "#8b5cf6" : "var(--text-muted)" }}>
                {escenario.peso_mineria > 0 ? `+${Math.round(escenario.peso_mineria * 100)}%` : "Desactivada"}
              </span>
            </div>
            <div style={{ width: "1px", background: "var(--border-color)" }} />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "2px" }}>
              <span style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: "700" }}>🥑 RIESGO ACUÍFERO</span>
              <span style={{ fontSize: "12px", fontWeight: "800", color: escenario.peso_agroexportacion > 0 ? "#ec4899" : "var(--text-muted)" }}>
                {escenario.peso_agroexportacion > 0 ? `+${Math.round(escenario.peso_agroexportacion * 100)}%` : "Desactivado"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <hr style={{ border: "0", borderTop: "1px solid var(--border-color)", margin: "4px 0" }} />

      {/* FACTORES CLIMÁTICOS DE ANOMALÍA - SIEMPRE VISIBLES PORQUE SON COMPRENSIBLES */}
      <div>
        <div style={{ fontSize: "9.5px", fontWeight: "800", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
          Simular Eventos de Emergencia Climática:
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {/* El Niño */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10.5px", color: "var(--text-primary)", marginBottom: "4px" }}>
              <span style={{ fontWeight: "700" }}>🔥 Gravedad de Anomalía \"El Niño\"</span>
              <span style={{ fontWeight: "800", color: "var(--color-rojo)", fontFamily: "var(--font-mono)" }}>{escenario.el_nino.toFixed(1)}x</span>
            </div>
            <div style={{ display: "flex", gap: "4px", marginBottom: "6px" }}>
              {PRESETS_EL_NINO.map((n) => {
                const isMatch = Math.abs(escenario.el_nino - n.value) < 0.05;
                return (
                  <button
                    key={n.name}
                    onClick={() => handleSliderChange("el_nino", n.value)}
                    style={{
                      flex: 1,
                      background: isMatch ? "rgba(239, 68, 68, 0.08)" : "#ffffff",
                      border: isMatch ? "1px solid var(--color-rojo)" : "1px solid var(--border-color)",
                      color: isMatch ? "var(--color-rojo)" : "var(--text-secondary)",
                      padding: "5px 0",
                      borderRadius: "6px",
                      fontSize: "9px",
                      fontWeight: "700",
                      cursor: "pointer",
                      transition: "all 0.1s ease"
                    }}
                  >
                    {n.icon} {n.name.split(" ")[0]}
                  </button>
                );
              })}
            </div>
            <input
              type="range"
              min="1.0"
              max="2.0"
              step="0.1"
              value={escenario.el_nino}
              style={{ width: "100%" }}
              onChange={(e) => handleSliderChange("el_nino", parseFloat(e.target.value))}
            />
          </div>

          {/* Expansión Demanda */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10.5px", color: "var(--text-primary)", marginBottom: "4px" }}>
              <span style={{ fontWeight: "700" }}>👥 Crecimiento de Población Local</span>
              <span style={{ fontWeight: "800", color: "#3b82f6", fontFamily: "var(--font-mono)" }}>+{Math.round(escenario.expansion_demanda * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="0.5"
              step="0.05"
              value={escenario.expansion_demanda}
              style={{ width: "100%" }}
              onChange={(e) => handleSliderChange("expansion_demanda", parseFloat(e.target.value))}
            />
          </div>
        </div>
      </div>

      <hr style={{ border: "0", borderTop: "1px solid var(--border-color)", margin: "4px 0" }} />

      {/* ACCORDEÓN COLAPSABLE PARA LAS COMPLEJAS PERILLAS DE PONDERACIÓN */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          style={{
            background: "none",
            border: "none",
            color: "var(--primary)",
            fontSize: "11px",
            fontWeight: "700",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "4px 0",
            outline: "none"
          }}
        >
          <span>{showAdvanced ? "▼ Ocultar perillas avanzadas de pesos" : "▶ Personalizar perillas de ponderación (Avanzado)"}</span>
          <span style={{ fontSize: "10px" }}>{showAdvanced ? "🔓" : "🔒"}</span>
        </button>

        {showAdvanced && (
          <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "12px", padding: "12px", background: "#f8fafc", borderRadius: "10px", border: "1px solid var(--border-color)" }}>
            <div>
              <div style={{ fontSize: "9px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px", display: "flex", justifyContent: "space-between" }}>
                <span>Ponderadores de Balance Físico:</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {/* Cantidad */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "var(--text-primary)", marginBottom: "2px" }}>
                    <span style={{ fontWeight: "600" }}>● Disponibilidad de Agua</span>
                    <span style={{ fontWeight: "700", fontFamily: "var(--font-mono)", color: "var(--primary)" }}>{Math.round(escenario.peso_cantidad * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={escenario.peso_cantidad}
                    style={{ width: "100%" }}
                    onChange={(e) => handleSliderChange("peso_cantidad", parseFloat(e.target.value))}
                  />
                </div>

                {/* Calidad */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "var(--text-primary)", marginBottom: "2px" }}>
                    <span style={{ fontWeight: "600" }}>● Calidad y Vertimientos</span>
                    <span style={{ fontWeight: "700", fontFamily: "var(--font-mono)", color: "var(--primary)" }}>{Math.round(escenario.peso_calidad * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={escenario.peso_calidad}
                    style={{ width: "100%" }}
                    onChange={(e) => handleSliderChange("peso_calidad", parseFloat(e.target.value))}
                  />
                </div>

                {/* Demanda */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "var(--text-primary)", marginBottom: "2px" }}>
                    <span style={{ fontWeight: "600" }}>● Presión de Demanda Poblacional</span>
                    <span style={{ fontWeight: "700", fontFamily: "var(--font-mono)", color: "var(--primary)" }}>{Math.round(escenario.peso_presion * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={escenario.peso_presion}
                    style={{ width: "100%" }}
                    onChange={(e) => handleSliderChange("peso_presion", parseFloat(e.target.value))}
                  />
                </div>
              </div>
            </div>

            <div>
              <div style={{ fontSize: "9px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
                Ponderadores de Presión Económica:
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {/* Peso Minería */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "var(--text-primary)", marginBottom: "2px" }}>
                    <span style={{ fontWeight: "600", color: "#8b5cf6" }}>⛏️ Presión Minera (Cabeceras + PAMs)</span>
                    <span style={{ fontWeight: "700", fontFamily: "var(--font-mono)", color: "#8b5cf6" }}>+{Math.round((escenario.peso_mineria ?? 0.0) * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={escenario.peso_mineria ?? 0.0}
                    style={{ width: "100%" }}
                    onChange={(e) => handleSliderChange("peso_mineria", parseFloat(e.target.value))}
                  />
                </div>

                {/* Peso Agroexportación */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "var(--text-primary)", marginBottom: "2px" }}>
                    <span style={{ fontWeight: "600", color: "#ec4899" }}>🥑 Presión Agroexportadora (Acuíferos)</span>
                    <span style={{ fontWeight: "700", fontFamily: "var(--font-mono)", color: "#ec4899" }}>+{Math.round((escenario.peso_agroexportacion ?? 0.0) * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={escenario.peso_agroexportacion ?? 0.0}
                    style={{ width: "100%" }}
                    onChange={(e) => handleSliderChange("peso_agroexportacion", parseFloat(e.target.value))}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
