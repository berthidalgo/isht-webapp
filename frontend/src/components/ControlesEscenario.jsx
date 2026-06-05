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
      name: "Explosión de Demanda",
      icon: "📈",
      data: { peso_cantidad: 0.4, peso_calidad: 0.2, peso_presion: 0.4, el_nino: 1.2, expansion_demanda: 0.4 }
    },
    {
      name: "Sostenibilidad Estricta",
      icon: "🌱",
      data: { peso_cantidad: 0.3, peso_calidad: 0.5, peso_presion: 0.2, el_nino: 1.0, expansion_demanda: 0.0 }
    }
  ];

  return (
    <div className="glass-panel" style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <h3 style={{ fontSize: "15px", fontWeight: "700", letterSpacing: "-0.01em", color: "#ffffff" }}>
          Simulador de Escenarios Territoriales (ISHT)
        </h3>
        <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "500" }}>
          Simulación Local Interactiva • Reactiva a Sliders
        </span>
      </div>

      {/* Botones de Presets de Alto Impacto */}
      <div style={{ marginBottom: "20px" }}>
        <div style={{ fontSize: "10px", fontWeight: "700", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
          Presets de Simulación de la Geotón 2026
        </div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
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
                  gap: "6px",
                  background: isMatch ? "linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)" : "rgba(255, 255, 255, 0.05)",
                  border: isMatch ? "1px solid rgba(255,255,255,0.2)" : "1px solid rgba(255, 255, 255, 0.05)",
                  color: isMatch ? "#ffffff" : "var(--text-secondary)",
                  padding: "6px 12px",
                  borderRadius: "8px",
                  fontSize: "11px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
                onMouseEnter={(e) => {
                  if (!isMatch) {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
                    e.currentTarget.style.color = "#ffffff";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isMatch) {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                    e.currentTarget.style.color = "var(--text-secondary)";
                  }
                }}
              >
                <span>{p.icon}</span>
                <span>{p.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        {/* Ponderación de Dimensiones */}
        <div>
          <div style={{ fontSize: "10px", fontWeight: "700", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "12px" }}>
            Ponderación de Pesos de Dimensión
          </div>

          <div style={{ marginBottom: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--text-primary)", marginBottom: "4px" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ color: "var(--color-verde)" }}>●</span> Oferta Hídrica (Cantidad)
              </span>
              <span style={{ fontWeight: "700", fontFamily: "var(--font-mono)" }}>{Math.round(escenario.peso_cantidad * 100)}%</span>
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

          <div style={{ marginBottom: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--text-primary)", marginBottom: "4px" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ color: "var(--color-amarillo)" }}>●</span> Calidad (Vertimientos/Minería)
              </span>
              <span style={{ fontWeight: "700", fontFamily: "var(--font-mono)" }}>{Math.round(escenario.peso_calidad * 100)}%</span>
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
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--text-primary)", marginBottom: "4px" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ color: "var(--color-rojo)" }}>●</span> Presión de Uso (Demanda)
              </span>
              <span style={{ fontWeight: "700", fontFamily: "var(--font-mono)" }}>{Math.round(escenario.peso_presion * 100)}%</span>
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

        {/* Factores de Cambio Climático / Demografía */}
        <div>
          <div style={{ fontSize: "10px", fontWeight: "700", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "12px" }}>
            Simulación de Anomalías Críticas (Ambiental & Humano)
          </div>

          <div style={{ marginBottom: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--text-primary)", marginBottom: "4px" }}>
              <span>🔥 Intensidad de Anomalía "El Niño" (Déficit)</span>
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
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--text-primary)", marginBottom: "4px" }}>
              <span>⚡ Crecimiento de Demanda Hídrica Población/Agro</span>
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
  );
}
