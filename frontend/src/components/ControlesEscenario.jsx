export default function ControlesEscenario({ escenario, onChange }) {
  const handleSliderChange = (key, value) => {
    if (onChange) {
      onChange({ ...escenario, [key]: value });
    }
  };

  return (
    <div style={{ 
      background: "#ffffff", 
      padding: "16px", 
      borderRadius: "12px", 
      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)", 
      border: "1px solid #f1f5f9" 
    }}>
      <h3 style={{ 
        fontSize: "14px", 
        fontWeight: "600", 
        color: "#1e293b", 
        margin: "0 0 16px 0", 
        letterSpacing: "-0.01em" 
      }}>Controles de Escenario Analítico</h3>
      
      {/* Pesos de Dimensiones */}
      <div style={{ marginBottom: "16px" }}>
        <div style={{ 
          fontSize: "11px", 
          fontWeight: "700", 
          color: "#64748b", 
          textTransform: "uppercase", 
          marginBottom: "8px", 
          letterSpacing: "0.05em" 
        }}>Ponderación de Dimensiones</div>
        
        <div style={{ marginBottom: "12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#475569", marginBottom: "4px" }}>
            <span>Peso Cantidad (Balance)</span>
            <span style={{ fontWeight: "600" }}>{Math.round(escenario.peso_cantidad * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={escenario.peso_cantidad}
            onChange={(e) => handleSliderChange("peso_cantidad", parseFloat(e.target.value))}
            style={{ width: "100%", accentColor: "#ef4444" }}
          />
        </div>

        <div style={{ marginBottom: "12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#475569", marginBottom: "4px" }}>
            <span>Peso Calidad (Minería/Ind.)</span>
            <span style={{ fontWeight: "600" }}>{Math.round(escenario.peso_calidad * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={escenario.peso_calidad}
            onChange={(e) => handleSliderChange("peso_calidad", parseFloat(e.target.value))}
            style={{ width: "100%", accentColor: "#f59e0b" }}
          />
        </div>

        <div style={{ marginBottom: "12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#475569", marginBottom: "4px" }}>
            <span>Peso Presión (Demanda)</span>
            <span style={{ fontWeight: "600" }}>{Math.round(escenario.peso_presion * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={escenario.peso_presion}
            onChange={(e) => handleSliderChange("peso_presion", parseFloat(e.target.value))}
            style={{ width: "100%", accentColor: "#3b82f6" }}
          />
        </div>
      </div>

      <hr style={{ border: "0", borderTop: "1px solid #f1f5f9", margin: "16px 0" }} />

      {/* Factores de Impacto */}
      <div>
        <div style={{ 
          fontSize: "11px", 
          fontWeight: "700", 
          color: "#64748b", 
          textTransform: "uppercase", 
          marginBottom: "8px", 
          letterSpacing: "0.05em" 
        }}>Factores de Impacto Ambiental</div>
        
        <div style={{ marginBottom: "12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#475569", marginBottom: "4px" }}>
            <span>Anomalía "El Niño" (Déficit de Oferta)</span>
            <span style={{ fontWeight: "600", color: "#ef4444" }}>{escenario.el_nino.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min="1.0"
            max="2.0"
            step="0.1"
            value={escenario.el_nino}
            onChange={(e) => handleSliderChange("el_nino", parseFloat(e.target.value))}
            style={{ width: "100%", accentColor: "#ef4444" }}
          />
        </div>

        <div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#475569", marginBottom: "4px" }}>
            <span>Expansión de Demanda Hídrica</span>
            <span style={{ fontWeight: "600", color: "#3b82f6" }}>+{Math.round(escenario.expansion_demanda * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="0.5"
            step="0.05"
            value={escenario.expansion_demanda}
            onChange={(e) => handleSliderChange("expansion_demanda", parseFloat(e.target.value))}
            style={{ width: "100%", accentColor: "#3b82f6" }}
          />
        </div>
      </div>
    </div>
  );
}
