import { COLOR } from "../lib/indice";

export default function RankingTabla({ ranking, onSelectCuenca, selectedCuencaId }) {
  if (!ranking || ranking.length === 0) {
    return (
      <div style={{ padding: "16px", textAlign: "center", color: "#64748b", fontSize: "13px" }}>
        No hay datos de ranking disponibles.
      </div>
    );
  }

  // Top 15 cuencas
  const top15 = ranking.slice(0, 15);

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
        margin: "0 0 12px 0", 
        letterSpacing: "-0.01em" 
      }}>Ranking de Estrés Crítico (Top 15)</h3>
      
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", textAlign: "left" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
              <th style={{ padding: "8px 4px", fontWeight: "600", color: "#64748b", width: "24px" }}>#</th>
              <th style={{ padding: "8px 4px", fontWeight: "600", color: "#64748b" }}>Cuenca</th>
              <th style={{ padding: "8px 4px", fontWeight: "600", color: "#64748b", textAlign: "right", width: "60px" }}>Índice</th>
              <th style={{ padding: "8px 4px", fontWeight: "600", color: "#64748b", textAlign: "center", width: "40px" }}>Alerta</th>
            </tr>
          </thead>
          <tbody>
            {top15.map((item, index) => {
              const isSelected = selectedCuencaId && String(item.codigo) === String(selectedCuencaId);
              const colorBg = COLOR[item.semaforo] || "#3b82f6";
              
              return (
                <tr
                  key={item.codigo}
                  onClick={() => onSelectCuenca && onSelectCuenca(item.codigo)}
                  style={{
                    borderBottom: "1px solid #f1f5f9",
                    cursor: "pointer",
                    background: isSelected ? "#f8fafc" : "transparent",
                    fontWeight: isSelected ? "600" : "normal",
                    transition: "background 0.15s ease",
                  }}
                  onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = "#f1f5f9"; }}
                  onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}
                >
                  <td style={{ padding: "8px 4px", color: "#94a3b8" }}>{index + 1}</td>
                  <td style={{ 
                    padding: "8px 4px", 
                    color: "#334155", 
                    maxWidth: "110px", 
                    overflow: "hidden", 
                    textOverflow: "ellipsis", 
                    whiteSpace: "nowrap" 
                  }} title={item.nombre}>
                    {item.nombre}
                  </td>
                  <td style={{ padding: "8px 4px", textAlign: "right", color: "#0f172a", fontWeight: "600" }}>
                    {item.indice.toFixed(1)}%
                  </td>
                  <td style={{ padding: "8px 4px", textAlign: "center" }}>
                    <span style={{
                      display: "inline-block",
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: colorBg,
                    }} title={item.semaforo} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
