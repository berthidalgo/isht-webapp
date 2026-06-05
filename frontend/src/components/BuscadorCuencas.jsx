import { useState, useEffect, useRef } from "react";

export default function BuscadorCuencas({ cuencas, onSelectCuenca, selectedCuencaId }) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  // Click outside to close suggestion dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync selected basin name to input if selected from outside
  useEffect(() => {
    if (selectedCuencaId) {
      const selected = cuencas.find((c) => String(c.codigo) === String(selectedCuencaId));
      if (selected) {
        setQuery(selected.nombre);
      }
    } else {
      setQuery("");
    }
  }, [selectedCuencaId, cuencas]);

  // Filter basins
  const suggestions = query.trim() === ""
    ? []
    : cuencas.filter((c) =>
        c.nombre.toLowerCase().includes(query.toLowerCase()) ||
        String(c.codigo).includes(query)
      ).slice(0, 6);

  const handleSelect = (item) => {
    setQuery(item.nombre);
    setIsOpen(false);
    if (onSelectCuenca) {
      onSelectCuenca(item.codigo);
    }
  };

  const getSemaforoColor = (semaforo) => {
    if (semaforo === "rojo") return "var(--color-rojo)";
    if (semaforo === "amarillo") return "var(--color-amarillo)";
    return "var(--color-verde)";
  };

  return (
    <div ref={wrapperRef} style={{ position: "relative", width: "100%", maxWidth: "340px" }}>
      <div style={{ display: "flex", alignItems: "center", position: "relative" }}>
        {/* Lupa SVG */}
        <svg
          style={{
            position: "absolute",
            left: "12px",
            width: "15px",
            height: "15px",
            color: "var(--text-muted)",
            pointerEvents: "none"
          }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.5"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>

        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Buscar cuenca (ej: Ica, Chili, Virú)..."
          style={{
            width: "100%",
            background: "#f1f5f9",
            border: "1px solid var(--border-color)",
            borderRadius: "10px",
            padding: "8px 16px 8px 34px",
            fontSize: "12px",
            fontWeight: "600",
            color: "var(--text-primary)",
            outline: "none",
            transition: "all 0.15s ease"
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && suggestions.length > 0) {
              handleSelect(suggestions[0]);
            }
          }}
        />

        {/* Clear Button */}
        {query && (
          <button
            onClick={() => {
              setQuery("");
              if (onSelectCuenca) onSelectCuenca(null);
            }}
            style={{
              position: "absolute",
              right: "12px",
              background: "none",
              border: "none",
              color: "var(--text-muted)",
              cursor: "pointer",
              fontSize: "14px",
              display: "flex",
              alignItems: "center"
            }}
          >
            &times;
          </button>
        )}
      </div>

      {/* Suggestion Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div style={{
          position: "absolute",
          top: "100%",
          left: 0,
          right: 0,
          marginTop: "6px",
          background: "#ffffff",
          border: "1px solid var(--border-color)",
          borderRadius: "12px",
          boxShadow: "var(--shadow-floating)",
          zIndex: 9999,
          overflow: "hidden"
        }}>
          {suggestions.map((item) => (
            <div
              key={item.codigo}
              onClick={() => handleSelect(item)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 12px",
                cursor: "pointer",
                borderBottom: "1px solid rgba(15,23,42,0.04)",
                fontSize: "11px",
                transition: "background 0.15s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "rgba(15,23,42,0.03)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
                <span style={{ fontWeight: "700", color: "var(--text-primary)" }}>{item.nombre}</span>
                <span style={{ fontSize: "9px", color: "var(--text-muted)" }}>Código Pfafstetter: {item.codigo}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{
                  fontSize: "10px",
                  fontWeight: "800",
                  color: getSemaforoColor(item.semaforo)
                }}>{item.indice.toFixed(1)}%</span>
                <span style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: getSemaforoColor(item.semaforo)
                }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
