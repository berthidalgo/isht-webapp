import { useState } from "react";
import { COLOR } from "../lib/indice";

export default function RankingTabla({ ranking, onSelectCuenca, selectedCuencaId }) {
  const [activeFilter, setActiveFilter] = useState("ALL"); // ALL, Pacific, Amazon (Atlántico), Titicaca

  if (!ranking || ranking.length === 0) {
    return (
      <div style={{ padding: "16px", textAlign: "center", color: "var(--text-muted)", fontSize: "12px" }}>
        No hay datos de ranking disponibles.
      </div>
    );
  }

  // Filter based on Vertiente (API returns 'Pacific', 'Amazon', 'Titicaca')
  const filteredRanking = ranking.filter((item) => {
    if (activeFilter === "ALL") return true;
    return item.vertiente === activeFilter;
  });

  const top15 = filteredRanking.slice(0, 15);

  const getSemaforoColor = (semaforo) => {
    if (semaforo === "rojo") return "var(--color-rojo)";
    if (semaforo === "amarillo") return "var(--color-amarillo)";
    return "var(--color-verde)";
  };

  return (
    <div className="glass-panel" style={{ padding: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "12px" }}>
        <h3 style={{
          fontSize: "14px",
          fontWeight: "700",
          color: "#ffffff",
          letterSpacing: "-0.01em"
        }}>Ranking de Estrés Crítico (Top 15)</h3>
        
        <span style={{ fontSize: "10px", color: "var(--text-secondary)", fontWeight: "600" }}>
          {filteredRanking.length} cuencas
        </span>
      </div>

      {/* Filtros Rápidos de Vertientes */}
      <div style={{
        display: "flex",
        background: "rgba(255, 255, 255, 0.03)",
        borderRadius: "8px",
        padding: "3px",
        gap: "2px",
        marginBottom: "12px",
        border: "1px solid rgba(255, 255, 255, 0.05)"
      }}>
        {[
          { id: "ALL", label: "Todas" },
          { id: "Pacific", label: "Pacífico" },
          { id: "Amazon", label: "Atlántico" },
          { id: "Titicaca", label: "Titicaca" }
        ].map((f) => {
          const isSel = activeFilter === f.id;
          return (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              style={{
                flex: 1,
                background: isSel ? "rgba(255, 255, 255, 0.08)" : "transparent",
                border: "none",
                color: isSel ? "#ffffff" : "var(--text-secondary)",
                fontSize: "10px",
                fontWeight: "700",
                padding: "6px 4px",
                borderRadius: "6px",
                cursor: "pointer",
                transition: "all 0.15s ease"
              }}
              onMouseEnter={(e) => { if (!isSel) e.currentTarget.style.color = "#ffffff"; }}
              onMouseLeave={(e) => { if (!isSel) e.currentTarget.style.color = "var(--text-secondary)"; }}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Tabla */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px", textAlign: "left" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.06)", color: "var(--text-secondary)" }}>
              <th style={{ padding: "6px 2px", fontWeight: "600", width: "20px" }}>#</th>
              <th style={{ padding: "6px 4px", fontWeight: "600" }}>Cuenca</th>
              <th style={{ padding: "6px 4px", fontWeight: "600", textAlign: "right", width: "50px" }}>ISHT</th>
              <th style={{ padding: "6px 2px", fontWeight: "600", textAlign: "center", width: "25px" }}>S</th>
            </tr>
          </thead>
          <tbody>
            {top15.map((item, index) => {
              const isSelected = selectedCuencaId && String(item.codigo) === String(selectedCuencaId);
              
              return (
                <tr
                  key={item.codigo}
                  onClick={() => onSelectCuenca && onSelectCuenca(item.codigo)}
                  style={{
                    borderBottom: "1px solid rgba(255, 255, 255, 0.03)",
                    cursor: "pointer",
                    background: isSelected ? "rgba(99, 102, 241, 0.08)" : "transparent",
                    color: isSelected ? "#ffffff" : "var(--text-primary)",
                    fontWeight: isSelected ? "700" : "normal",
                    transition: "all 0.1s ease",
                  }}
                  onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)"; }}
                  onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}
                >
                  <td style={{ padding: "8px 2px", color: "var(--text-muted)" }}>{index + 1}</td>
                  <td style={{
                    padding: "8px 4px",
                    maxWidth: "120px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                  }} title={item.nombre}>
                    {item.nombre}
                  </td>
                  <td style={{ padding: "8px 4px", textAlign: "right", fontWeight: "700", fontFamily: "var(--font-mono)" }}>
                    {item.indice.toFixed(1)}%
                  </td>
                  <td style={{ padding: "8px 2px", textAlign: "center" }}>
                    <span style={{
                      display: "inline-block",
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: getSemaforoColor(item.semaforo),
                      boxShadow: `0 0 6px ${getSemaforoColor(item.semaforo)}`
                    }} title={item.semaforo} />
                  </td>
                </tr>
              );
            })}
            {top15.length === 0 && (
              <tr>
                <td colSpan="4" style={{ textAlign: "center", padding: "16px", color: "var(--text-muted)" }}>
                  Ninguna cuenca crítica en esta vertiente
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
