import { useEffect, useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import { getHealth, API } from "./api";

// Centro y zoom del Perú (DoD Fase 0).
const PERU_CENTER = [-9.19, -75.0];
const PERU_ZOOM = 5;

function StatusBadge({ state, detail }) {
  const map = {
    checking: { bg: "#475569", label: "Conectando con el backend…" },
    ok: { bg: "#15803d", label: "backend OK" },
    error: { bg: "#b91c1c", label: "backend sin respuesta" },
  };
  const s = map[state] || map.checking;
  return (
    <span
      title={detail || ""}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        background: s.bg,
        color: "white",
        padding: "4px 12px",
        borderRadius: 999,
        fontSize: 13,
        fontWeight: 600,
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: "white",
          opacity: state === "checking" ? 0.6 : 1,
        }}
      />
      {s.label}
    </span>
  );
}

export default function App() {
  const [status, setStatus] = useState("checking");
  const [detail, setDetail] = useState("");

  useEffect(() => {
    let alive = true;
    getHealth()
      .then((h) => {
        if (!alive) return;
        setStatus("ok");
        setDetail(`fase: ${h.fase} · modelo: ${h.modelo ? "cargado" : "pendiente (F2)"}`);
      })
      .catch((e) => {
        if (!alive) return;
        setStatus("error");
        setDetail(String(e.message || e));
      });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div
      style={{
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
        color: "#0f172a",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Encabezado */}
      <header
        style={{
          padding: "14px 22px",
          borderBottom: "1px solid #e2e8f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: 19, letterSpacing: "-0.01em" }}>
            ISHT — Índice de Seguridad Hídrica Territorial
          </h1>
          <p style={{ margin: "2px 0 0", fontSize: 13, color: "#64748b" }}>
            159 unidades hidrográficas del Perú · oferta − demanda → brecha → decisión
          </p>
        </div>
        <StatusBadge state={status} detail={detail} />
      </header>

      {/* Cuerpo: mapa + panel lateral (el panel se llena en F4) */}
      <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
        <main style={{ flex: 1, minWidth: 0 }}>
          <MapContainer
            center={PERU_CENTER}
            zoom={PERU_ZOOM}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {/* F1: aquí se pintan las 159 cuencas por semáforo (GeoJSON layer) */}
          </MapContainer>
        </main>

        <aside
          style={{
            width: 320,
            borderLeft: "1px solid #e2e8f0",
            padding: 20,
            overflowY: "auto",
            background: "#f8fafc",
          }}
        >
          <h2 style={{ fontSize: 14, textTransform: "uppercase", color: "#64748b", marginTop: 0 }}>
            Estado del prototipo
          </h2>
          <p style={{ fontSize: 14, lineHeight: 1.5 }}>
            <strong>Fase 0 — Esqueleto desplegado.</strong> El frontend (Vercel) está
            hablando con el backend (Render). Las capas de datos, el modelo y los
            controles llegan en las siguientes fases.
          </p>

          <ul style={{ fontSize: 13, lineHeight: 1.7, paddingLeft: 18, color: "#334155" }}>
            <li>F1 — mapa de las 159 cuencas por semáforo</li>
            <li>F2 — modelo XGBoost de estrés hídrico</li>
            <li>F3 — API de índice, predicción y simulación</li>
            <li>F4 — sliders de escenario + proyección + ranking</li>
          </ul>

          <div
            style={{
              marginTop: 16,
              padding: 12,
              background: "white",
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              fontSize: 12,
              color: "#64748b",
              wordBreak: "break-all",
            }}
          >
            <div style={{ fontWeight: 600, color: "#334155", marginBottom: 4 }}>API_URL</div>
            {API}
            {detail && (
              <>
                <div style={{ fontWeight: 600, color: "#334155", margin: "8px 0 4px" }}>
                  Detalle
                </div>
                {detail}
              </>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
