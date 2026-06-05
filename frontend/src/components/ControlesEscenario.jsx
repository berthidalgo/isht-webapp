export default function ControlesEscenario({ escenario, onChange }) {
  const handleSliderChange = (key, value) => {
    if (onChange) {
      onChange({ ...escenario, [key]: value });
    }
  };

  const applyPreset = (preset) => {
    if (onChange) {
      onChange(preset);
    }
  };

  const PRESETS = [
    {
      name: "Escenario Neutral",
      icon: "⚖️",
      data: { peso_cantidad: 0.5, peso_calidad: 0.3, peso_presion: 0.2, el_nino: 1.0, expansion_demanda: 0.0 }
    },
    {
      name: "Mega El Niño",
      icon: "🔥",
      data: { peso_cantidad: 0.6, peso_calidad: 0.2, peso_presion: 0.2, el_nino: 1.8, expansion_demanda: 0.15 }
    },
    {
      name: "Explosión Demanda",
      icon: "📈",
      data: { peso_cantidad: 0.4, peso_calidad: 0.2, peso_presion: 0.4, el_nino: 1.2, expansion_demanda: 0.4 }
    },
    {
      name: "Sostenibilidad",
      icon: "🌱",
      data: { peso_cantidad: 0.3, peso_calidad: 0.5, peso_presion: 0.2, el_nino: 1.0, expansion_demanda: 0.0 }
    }
  ];

  return (
    <div className="glass-panel" style={{ padding: "18px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "14px" }}>
        <h3 style={{ fontSize: "14px", fontWeight: "800", letterSpacing: "-0.01em", color: "var(--text-primary)" }}>
          Simulador de Escenarios (ISHT)
        </h3>
        <span style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: "600" }}>
          Simulación Reactiva Local
        </span>
      </div>

      {/* Botones de Presets de Alto Impacto */}
      <div style={{ marginBottom: "16px" }}>
        <div style={{ fontSize: "9px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
          Escenarios Prediseñados
        </div>
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {PRESETS.map((p) => {
            const isMatch =
              Math.abs(escenario.el_nino - p.data.el_nino) < 0.05 &&
              Math.abs(escenario.expansion_demanda - p.data.expansion_demanda) < 0.05;

            return (
              <button
                key={p.name}
                onClick={() => applyPreset(p.data)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  background: isMatch ? "linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)" : "#f1f5f9",
                  border: isMatch ? "1px solid rgba(255,255,255,0.15)" : "1px solid var(--border-color)",
                  color: isMatch ? "#ffffff" : "var(--text-secondary)",
                  padding: "6px 10px",
                  borderRadius: "8px",
                  fontSize: "11px",
                  fontWeight: "700",
                  cursor: "pointer",
                  boxShadow: isMatch ? "0 2px 8px rgba(79, 70, 229, 0.2)" : "none",
                  transition: "all 0.15s ease"
                }}
                onMouseEnter={(e) => {
                  if (!isMatch) {
                    e.currentTarget.style.background = "#e2e8f0";
                    e.currentTarget.style.color = "var(--text-primary)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isMatch) {
                    e.currentTarget.style.background = "#f1f5f9";
                    e.currentTarget.style.color = "var(--text-secondary)";
                  }
                }}
              >
                <span style={{ fontSize: "12px" }}>{p.icon}</span>
                <span>{p.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {/* Ponderación de Dimensiones */}
        <div>
          <div style={{ fontSize: "9px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
            Ponderación de Pesos de Dimensión
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--text-primary)", marginBottom: "3px" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "5px", fontWeight: "600" }}>
                  <span style={{ color: "var(--color-verde)", fontSize: "8px" }}>●</span> Cantidad (Oferta)
                </span>
                <span style={{ fontWeight: "700", fontFamily: "var(--font-mono)", color: "var(--primary)" }}>{Math.round(escenario.peso_cantidad * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={escenario.peso_cantidad}
                onChange={(e) => handleSliderChange("peso_cantidad", parseFloat(e.target.value))}
              />
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--text-primary)", marginBottom: "3px" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "5px", fontWeight: "600" }}>
                  <span style={{ color: "var(--color-amarillo)", fontSize: "8px" }}>●</span> Calidad (Vertimientos)
                </span>
                <span style={{ fontWeight: "700", fontFamily: "var(--font-mono)", color: "var(--primary)" }}>{Math.round(escenario.peso_calidad * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={escenario.peso_calidad}
                onChange={(e) => handleSliderChange("peso_calidad", parseFloat(e.target.value))}
              />
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--text-primary)", marginBottom: "3px" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "5px", fontWeight: "600" }}>
                  <span style={{ color: "var(--color-rojo)", fontSize: "8px" }}>●</span> Presión (Demanda)
                </span>
                <span style={{ fontWeight: "700", fontFamily: "var(--font-mono)", color: "var(--primary)" }}>{Math.round(escenario.peso_presion * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={escenario.peso_presion}
                onChange={(e) => handleSliderChange("peso_presion", parseFloat(e.target.value))}
              />
            </div>
          </div>
        </div>

        {/* Factores de Anomalía */}
        <div>
          <div style={{ fontSize: "9px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
            Simulación de Anomalías
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--text-primary)", marginBottom: "3px" }}>
                <span style={{ fontWeight: "600" }}>🔥 Intensidad "El Niño" (Déficit)</span>
                <span style={{ fontWeight: "700", color: "var(--color-rojo)", fontFamily: "var(--font-mono)" }}>{escenario.el_nino.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="2.0"
                step="0.1"
                value={escenario.el_nino}
                onChange={(e) => handleSliderChange("el_nino", parseFloat(e.target.value))}
              />
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--text-primary)", marginBottom: "3px" }}>
                <span style={{ fontWeight: "600" }}>⚡ Expansión Demanda Población</span>
                <span style={{ fontWeight: "700", color: "#3b82f6", fontFamily: "var(--font-mono)" }}>+{Math.round(escenario.expansion_demanda * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.5"
                step="0.05"
                value={escenario.expansion_demanda}
                onChange={(e) => handleSliderChange("expansion_demanda", parseFloat(e.target.value))}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
