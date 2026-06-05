import { useState } from "react";

export default function RankingTabla({ ranking, onSelectCuenca, selectedCuencaId }) {
  const [activeFilter, setActiveFilter] = useState("ALL"); // ALL, Pacific, Amazon (Atlántico), Titicaca

  if (!ranking || ranking.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: "16px", textAlign: "center", color: "var(--text-muted)", fontSize: "11px" }}>
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
    <div className="glass-panel" style={{ padding: "14px 16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "10px" }}>
        <h3 style={{
          fontSize: "13px",
          fontWeight: "800",
          color: "var(--text-primary)",
          letterSpacing: "-0.01em"
        }}>Ranking de Riesgo (Top 15)</h3>
        
        <span style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: "700" }}>
          {filteredRanking.length} cuencas
        </span>
      </div>

      {/* Filtros Rápidos de Vertientes */}
      <div style={{
        display: "flex",
        background: "#f1f5f9",
        borderRadius: "8px",
        padding: "3px",
        gap: "2px",
        marginBottom: "10px",
        border: "1px solid var(--border-color)"
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
                background: isSel ? "#ffffff" : "transparent",
                border: "none",
                color: isSel ? "var(--primary)" : "var(--text-secondary)",
                fontSize: "10px",
                fontWeight: "700",
                padding: "5px 2px",
                borderRadius: "6px",
                cursor: "pointer",
                boxShadow: isSel ? "0 1px 3px rgba(15,23,42,0.08)" : "none",
                transition: "all 0.15s ease"
              }}
              onMouseEnter={(e) => { if (!isSel) e.currentTarget.style.color = "var(--text-primary)"; }}
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
            <tr style={{ borderBottom: "1px solid var(--border-color)", color: "var(--text-muted)" }}>
              <th style={{ padding: "4px 2px", fontWeight: "700", width: "20px" }}>#</th>
              <th style={{ padding: "4px 4px", fontWeight: "700" }}>Cuenca</th>
              <th style={{ padding: "4px 4px", fontWeight: "700", textAlign: "right", width: "50px" }}>ISHT</th>
              <th style={{ padding: "4px 2px", fontWeight: "700", textAlign: "center", width: "25px" }}>R</th>
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
                    borderBottom: "1px solid rgba(15, 23, 42, 0.03)",
                    cursor: "pointer",
                    background: isSelected ? "rgba(79, 70, 229, 0.06)" : "transparent",
                    color: isSelected ? "var(--primary)" : "var(--text-primary)",
                    fontWeight: isSelected ? "700" : "500",
                    borderLeft: isSelected ? "3px solid var(--primary)" : "3px solid transparent",
                    transition: "all 0.1s ease",
                  }}
                  onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = "rgba(15,23,42,0.02)"; }}
                  onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}
                >
                  <td style={{ padding: "7px 2px 7px 4px", color: "var(--text-muted)", fontSize: "10px" }}>{index + 1}</td>
                  <td style={{
                    padding: "7px 4px",
                    maxWidth: "140px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                  }} title={item.nombre}>
                    {item.nombre}
                  </td>
                  <td style={{ padding: "7px 4px", textAlign: "right", fontWeight: "700", fontFamily: "var(--font-mono)" }}>
                    {item.indice.toFixed(1)}%
                  </td>
                  <td style={{ padding: "7px 2px", textAlign: "center" }}>
                    <span style={{
                      display: "inline-block",
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: getSemaforoColor(item.semaforo),
                      boxShadow: `0 0 4px ${getSemaforoColor(item.semaforo)}60`
                    }} title={item.semaforo} />
                  </td>
                </tr>
              );
            })}
            {top15.length === 0 && (
              <tr>
                <td colSpan="4" style={{ textAlign: "center", padding: "16px", color: "var(--text-muted)" }}>
                  Ninguna cuenca en esta vertiente
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
