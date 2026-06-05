import { useEffect, useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import { getHealth, getCuencas, getIndice, getMetrics, predecir } from "./api";
import { recalcularLocal } from "./lib/indice";
import MapaCuencas from "./components/MapaCuencas";
import ControlesEscenario from "./components/ControlesEscenario";
import RankingTabla from "./components/RankingTabla";
import PanelCuenca from "./components/PanelCuenca";

// Centro y zoom del Perú.
const PERU_CENTER = [-9.19, -75.0];
const PERU_ZOOM = 6;

function StatusBadge({ state, detail }) {
  const map = {
    checking: { bg: "#475569", label: "Conectando..." },
    ok: { bg: "#10b981", label: "Backend Activo" },
    error: { bg: "#ef4444", label: "Backend Inactivo" },
  };
  const s = map[state] || map.checking;
  return (
    <span
      title={detail || ""}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        background: s.bg,
        color: "white",
        padding: "4px 12px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)"
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: "white",
          animation: state === "checking" ? "pulse 1.5s infinite" : "none"
        }}
      />
      {s.label}
    </span>
  );
}

export default function App() {
  const [status, setStatus] = useState("checking");
  const [detail, setDetail] = useState("");
  
  // Data State
  const [geojson, setGeojson] = useState(null);
  const [rawCuencas, setRawCuencas] = useState([]);
  const [cuencas, setCuencas] = useState([]);
  const [metrics, setMetrics] = useState(null);
  
  // Interaction State
  const [selectedCuencaId, setSelectedCuencaId] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [escenario, setEscenario] = useState({
    peso_cantidad: 0.5,
    peso_calidad: 0.3,
    peso_presion: 0.2,
    el_nino: 1.0,
    expansion_demanda: 0.0
  });

  // Load Initial Data from Backend
  useEffect(() => {
    let alive = true;
    
    // Check Health
    getHealth()
      .then((h) => {
        if (!alive) return;
        setStatus("ok");
        setDetail(`fase: ${h.fase} · modelo: ${h.modelo ? "cargado" : "pendiente"}`);
      })
      .catch((e) => {
        if (!alive) return;
        setStatus("error");
        setDetail(String(e.message || e));
      });

    // Load Metrics
    getMetrics()
      .then((m) => {
        if (alive) setMetrics(m);
      })
      .catch(console.error);

    // Load Cuencas GeoJSON & Indice Table
    Promise.all([getCuencas(), getIndice()])
      .then(([geo, ind]) => {
        if (!alive) return;
        setGeojson(geo);
        const list = ind.cuencas || [];
        setRawCuencas(list);
        setCuencas(list);
      })
      .catch(console.error);

    return () => {
      alive = false;
    };
  }, []);

  // Recalculate Indice locally when sliders change
  const handleEscenarioChange = (nuevoEscenario) => {
    setEscenario(nuevoEscenario);
    const recalculadas = recalcularLocal(rawCuencas, nuevoEscenario);
    setCuencas(recalculadas);
    
    // Update GeoJSON properties on the fly for map recoloring
    if (geojson) {
      const idMap = new Map(recalculadas.map((c) => [c.codigo, c]));
      const updatedFeatures = geojson.features.map((f) => {
        const cod = String(f.properties?.CODIGO || f.properties?.codigo);
        const c = idMap.get(cod);
        if (c) {
          return {
            ...f,
            properties: {
              ...f.properties,
              ISHT_INDICE: c.indice,
              ISHT_SEMAFORO: c.semaforo,
              semaforo: c.semaforo,
              indice: c.indice
            }
          };
        }
        return f;
      });
      setGeojson({ ...geojson, features: updatedFeatures });
    }
  };

  const handleSelectCuenca = (codigo) => {
    setSelectedCuencaId(codigo);
    setPrediction(null); // Clear previous prediction
  };

  // Run ML Prediction via Backend API
  const handlePredictML = async () => {
    const selected = cuencas.find((c) => String(c.codigo) === String(selectedCuencaId));
    if (!selected) return;
    
    setIsPredicting(true);
    try {
      const payload = {
        oferta: selected.oferta,
        demanda: selected.demanda,
        poblacion: selected.poblacion,
        precip_anual: selected.precip_anual,
        escorrentia_mm: selected.escorrentia_mm,
        area_km2: selected.area_km2
      };
      const res = await predecir(payload);
      setPrediction(res.indice_predicho);
    } catch (e) {
      console.error(e);
      alert("Error llamando al API de Predicción ML");
    } finally {
      setIsPredicting(false);
    }
  };

  // Find selected basin info
  const selectedCuencaInfo = cuencas.find((c) => String(c.codigo) === String(selectedCuencaId));

  // Sort ranking list by active simulated index descending
  const rankingSorted = [...cuencas].sort((a, b) => b.indice - a.indice);

  return (
    <div style={{
      fontFamily: "Inter, -apple-system, Segoe UI, Roboto, sans-serif",
      color: "#0f172a",
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      background: "#f8fafc"
    }}>
      {/* Header Premium (Arthur Andersen / McKinsey aesthetics) */}
      <header style={{
        padding: "12px 24px",
        background: "#0f172a",
        color: "#ffffff",
        borderBottom: "1px solid #1e293b",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
            color: "white",
            width: "36px",
            height: "36px",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "800",
            fontSize: "16px",
            boxShadow: "0 2px 4px 0 rgba(59, 130, 246, 0.5)"
          }}>
            H
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: "16px", fontWeight: "700", letterSpacing: "-0.02em" }}>
              HiDATA ISHT — Índice de Seguridad Hídrica Territorial
            </h1>
            <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#94a3b8", fontWeight: "500" }}>
              Ecosistema Analítico Espacial • 231 Cuencas Pfafstetter del Perú • SENAMHI PISCO + INEI + ANA
            </p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <StatusBadge state={status} detail={detail} />
        </div>
      </header>

      {/* Main Container */}
      <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
        {/* Left Side: Map and Sliders Card */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "16px", gap: "16px", minWidth: 0 }}>
          {/* Map Card */}
          <div style={{
            flex: 1,
            position: "relative",
            background: "#ffffff",
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)",
            border: "1px solid #e2e8f0"
          }}>
            <MapContainer
              center={PERU_CENTER}
              zoom={PERU_ZOOM}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              />
              <MapaCuencas
                key={JSON.stringify(escenario) + String(selectedCuencaId) + (geojson ? geojson.features.length : 0)}
                geojson={geojson}
                onSelectCuenca={handleSelectCuenca}
                selectedCuencaId={selectedCuencaId}
              />
            </MapContainer>
          </div>

          {/* Sliders Box (Horizontal bottom card) */}
          <ControlesEscenario escenario={escenario} onChange={handleEscenarioChange} />
        </div>

        {/* Right Side: Metrics Drill-Down & Ranking */}
        <aside style={{
          width: "360px",
          borderLeft: "1px solid #e2e8f0",
          background: "#ffffff",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          padding: "16px",
          overflowY: "auto",
          boxShadow: "-4px 0 6px -1px rgb(0 0 0 / 0.02)"
        }}>
          {/* Detail card */}
          <div style={{
            flex: "1 1 auto",
            border: "1px solid #f1f5f9",
            borderRadius: "12px",
            padding: "16px",
            background: "#f8fafc",
            overflowY: "auto",
            maxHeight: "450px"
          }}>
            <PanelCuenca
              cuenca={selectedCuencaInfo}
              metrics={metrics}
              onPredict={handlePredictML}
            />
            
            {prediction !== null && (
              <div style={{
                marginTop: "12px",
                background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
                color: "#ffffff",
                padding: "12px",
                borderRadius: "8px",
                fontSize: "12px",
                boxShadow: "0 2px 4px 0 rgba(0, 0, 0, 0.1)"
              }}>
                <div style={{ fontWeight: "600", color: "#94a3b8", textTransform: "uppercase", fontSize: "10px", marginBottom: "4px" }}>Resultado Predicción XGBoost</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontSize: "20px", fontWeight: "800" }}>{prediction.toFixed(1)}%</span>
                  <span style={{ fontSize: "10px", background: "rgba(255,255,255,0.1)", padding: "2px 6px", borderRadius: "4px" }}>Modelo Certificado v2.0</span>
                </div>
              </div>
            )}
            
            {isPredicting && (
              <div style={{ marginTop: "12px", textAlign: "center", color: "#64748b", fontSize: "11px" }}>
                Consultando cerebro XGBoost...
              </div>
            )}
          </div>

          {/* Ranking Card */}
          <div style={{ flex: "0 0 auto" }}>
            <RankingTabla
              ranking={rankingSorted}
              onSelectCuenca={handleSelectCuenca}
              selectedCuencaId={selectedCuencaId}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
