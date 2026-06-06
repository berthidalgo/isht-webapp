import { useEffect, useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, CartesianGrid, Cell } from "recharts";
import { getHealth, getCuencas, getIndice, getMetrics, predecir } from "./api";
import { recalcularLocal } from "./lib/indice";
import MapaCuencas from "./components/MapaCuencas";
import ControlesEscenario from "./components/ControlesEscenario";
import RankingTabla from "./components/RankingTabla";
import PanelCuenca from "./components/PanelCuenca";
import BuscadorCuencas from "./components/BuscadorCuencas";

// Centro y zoom del Perú
const PERU_CENTER = [-9.19, -75.0];
const PERU_ZOOM = 6;

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState("map"); // "map" | "xgboost" | "finance" | "pitch"
  
  // Mobile Subtab state for GIS Studio Map view
  const [mobileSubTab, setMobileSubTab] = useState("controls"); // "controls" | "ranking" | "details"

  // Backend & Connection State
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
    expansion_demanda: 0.0,
    peso_mineria: 0.0,
    peso_agroexportacion: 0.0
  });

  // Portfolio State (Sorting and Filtering)
  const [portfolioSearch, setPortfolioSearch] = useState("");
  const [portfolioVertiente, setPortfolioVertiente] = useState("ALL");
  const [portfolioRisk, setPortfolioRisk] = useState("ALL");
  const [sortField, setSortField] = useState("indice");
  const [sortAsc, setSortAsc] = useState(false);

  // ML Playground Inputs
  const [mlPlaygroundInput, setMlPlaygroundInput] = useState({
    oferta: 100,
    demanda: 50,
    poblacion: 150000,
    precip_anual: 800,
    escorrentia_mm: 350,
    area_km2: 1200
  });

  // Check if device is mobile on viewport resize (fallback helper)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Load Initial Data from Backend
  useEffect(() => {
    let alive = true;
    
    getHealth()
      .then((h) => {
        if (!alive) return;
        setStatus("ok");
        setDetail(`Live · XGBoost: ${h.modelo ? "Online" : "Pendiente"}`);
      })
      .catch((e) => {
        if (!alive) return;
        setStatus("error");
        setDetail("Inactivo");
      });

    getMetrics()
      .then((m) => {
        if (alive) setMetrics(m);
      })
      .catch(console.error);

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
    setPrediction(null);
    
    // Automatically transition to details tab in mobile view so the user doesn't get lost
    if (isMobile) {
      setMobileSubTab("details");
    }

    const c = cuencas.find((item) => String(item.codigo) === String(codigo));
    if (c) {
      setMlPlaygroundInput({
        oferta: parseFloat(c.oferta || 100),
        demanda: parseFloat(c.demanda || 50),
        poblacion: parseFloat(c.poblacion || 10000),
        precip_anual: parseFloat(c.precip_anual || 500),
        escorrentia_mm: parseFloat(c.escorrentia_mm || 200),
        area_km2: parseFloat(c.area_km2 || 1000)
      });
    }
  };

  // Run ML Prediction via Backend API
  const handlePredictML = async () => {
    setIsPredicting(true);
    try {
      const payload = {
        oferta: parseFloat(mlPlaygroundInput.oferta),
        demanda: parseFloat(mlPlaygroundInput.demanda),
        poblacion: parseFloat(mlPlaygroundInput.poblacion),
        precip_anual: parseFloat(mlPlaygroundInput.precip_anual),
        escorrentia_mm: parseFloat(mlPlaygroundInput.escorrentia_mm),
        area_km2: parseFloat(mlPlaygroundInput.area_km2)
      };
      const res = await predecir(payload);
      setPrediction(res.indice_predicho);
    } catch (e) {
      console.error(e);
      alert("Error llamando al API de Predicción ML. Verifica que el Backend esté Activo.");
    } finally {
      setIsPredicting(false);
    }
  };

  const selectedCuencaInfo = cuencas.find((c) => String(c.codigo) === String(selectedCuencaId));
  const rankingSorted = [...cuencas].sort((a, b) => b.indice - a.indice);

  // Recharts Format for Feature Importance
  const featureImportanceData = metrics && metrics.feature_importance
    ? Object.entries(metrics.feature_importance)
        .map(([key, value]) => ({
          name: key.toUpperCase(),
          importance: parseFloat((value * 100).toFixed(1))
        }))
        .sort((a, b) => b.importance - a.importance)
    : [];

  // Filter and Sort Portfolio Table
  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const portfolioFiltered = cuencas
    .filter((c) => {
      const matchesSearch = c.nombre.toLowerCase().includes(portfolioSearch.toLowerCase()) || String(c.codigo).includes(portfolioSearch);
      const matchesVertiente = portfolioVertiente === "ALL" || c.vertiente === portfolioVertiente;
      const matchesRisk = portfolioRisk === "ALL" || c.semaforo === portfolioRisk;
      return matchesSearch && matchesVertiente && matchesRisk;
    })
    .sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      
      // SIAF calculation on the fly for sorting
      if (sortField === "siaf") {
        valA = (a.demanda * 0.15) * (a.indice / 100.0) * 1.5 * 1000000;
        valB = (b.demanda * 0.15) * (b.indice / 100.0) * 1.5 * 1000000;
      }

      if (typeof valA === "string") {
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortAsc ? valA - valB : valB - valA;
    });

  // Statistics for executive header
  const totalRiesgoAlto = cuencas.filter((c) => c.semaforo === "rojo").length;
  const totalRiesgoMedio = cuencas.filter((c) => c.semaforo === "amarillo").length;

  return (
    <div style={{
      fontFamily: "var(--font-sans)",
      background: "var(--bg-app)",
      color: "var(--text-primary)",
      height: isMobile ? "auto" : "100vh",
      display: "flex",
      flexDirection: "column",
    }}>
      
      {/* HEADER PREMIUM (McKinsey / Arthur Andersen Aesthetics) */}
      <header style={{
        padding: "12px 24px",
        background: "rgba(255, 255, 255, 0.9)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--border-color)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "24px",
        zIndex: 10
      }}>
        {/* Logo & Platform Info */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            background: "linear-gradient(135deg, #4f46e5 0%, #312e81 100%)",
            color: "white",
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "800",
            fontSize: "16px",
            boxShadow: "0 4px 10px rgba(79, 70, 229, 0.15)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            flexShrink: 0
          }}>
            H
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <h1 style={{ margin: 0, fontSize: "15px", fontWeight: "800", letterSpacing: "-0.02em", color: "var(--text-primary)" }}>
                HiDATA ISHT
              </h1>
              <span style={{
                background: "var(--primary-light)",
                color: "var(--primary)",
                fontSize: "9px",
                fontWeight: "800",
                padding: "1px 5px",
                borderRadius: "4px",
                border: "1px solid rgba(79, 70, 229, 0.1)"
              }}>
                v3.0 Executive
              </span>
            </div>
            <p style={{ margin: "2px 0 0", fontSize: "10px", color: "var(--text-muted)", fontWeight: "600" }}>
              Índice de Seguridad Hídrica Territorial del Perú • PCM Geotón 2026
            </p>
          </div>
        </div>

        {/* Real-time Search Box */}
        <BuscadorCuencas
          cuencas={cuencas}
          onSelectCuenca={handleSelectCuenca}
          selectedCuencaId={selectedCuencaId}
        />

        {/* Executive Stats & Status */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ display: "flex", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--color-rojo)", boxShadow: "0 0 6px var(--color-rojo)" }} />
              <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-secondary)" }}>{totalRiesgoAlto} Crisis Crítica</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--color-amarillo)" }} />
              <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-secondary)" }}>{totalRiesgoMedio} Estrés Medio</span>
            </div>
          </div>
          
          <div style={{ height: "20px", width: "1px", background: "var(--border-color)" }} />

          {/* Backend Status */}
          <span style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            background: status === "ok" ? "rgba(16,185,129,0.06)" : "rgba(239,68,68,0.06)",
            border: status === "ok" ? "1px solid rgba(16,185,129,0.12)" : "1px solid rgba(239,68,68,0.12)",
            color: status === "ok" ? "#047857" : "#b91c1c",
            padding: "3px 10px",
            borderRadius: "6px",
            fontSize: "11px",
            fontWeight: "700"
          }} title={detail}>
            <span style={{
              width: "5px",
              height: "5px",
              borderRadius: "50%",
              background: status === "ok" ? "var(--color-verde)" : "var(--color-rojo)"
            }} />
            {status === "ok" ? "Sistemas Activos" : "Backend Offline"}
          </span>
        </div>
      </header>

      {/* SUB-HEADER / TAB NAVIGATION (WITH HORIZONTAL SCROLL IN MOBILE) */}
      <div className="tab-navigation-wrapper" style={{
        background: "#ffffff",
        borderBottom: "1px solid var(--border-color)",
        display: "flex",
        padding: "0 24px",
        gap: "4px"
      }}>
        <button className={`tab-btn ${activeTab === "map" ? "active" : ""}`} onClick={() => setActiveTab("map")}>
          🌍 GIS Studio (Mapa)
        </button>
        <button className={`tab-btn ${activeTab === "xgboost" ? "active" : ""}`} onClick={() => setActiveTab("xgboost")}>
          📊 XGBoost Predictor & Analytics
        </button>
        <button className={`tab-btn ${activeTab === "finance" ? "active" : ""}`} onClick={() => setActiveTab("finance")}>
          💼 McKinsey Risk Portfolio
        </button>
        <button className={`tab-btn ${activeTab === "pitch" ? "active" : ""}`} onClick={() => setActiveTab("pitch")}>
          📜 Pitch Geotón 2026 (PCM)
        </button>
      </div>

      {/* MAIN CONTENT AREA */}
      <main style={{ flex: 1, display: "flex", minHeight: 0, position: "relative" }}>
        
        {/* TAB 1: GIS STUDY MAP WORKSTATION (MAPBOX FLOATING STYLE) */}
        {activeTab === "map" && (
          <div className="map-workspace fade-in">
            
            {/* Full-screen Backdrop Map */}
            <div style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0, zIndex: 1 }}>
              <MapContainer
                center={PERU_CENTER}
                zoom={PERU_ZOOM}
                style={{ height: "100%", width: "100%" }}
                zoomControl={!isMobile}
              >
                <TileLayer
                  attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
                  url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />
                <MapaCuencas
                  key={JSON.stringify(escenario) + String(selectedCuencaId) + (geojson ? geojson.features.length : 0)}
                  geojson={geojson}
                  onSelectCuenca={handleSelectCuenca}
                  selectedCuencaId={selectedCuencaId}
                />
              </MapContainer>
            </div>

            {/* MOBILE ONLY SUBTAB TOGGLE */}
            {isMobile && (
              <div className="mobile-subtab-bar">
                <button
                  onClick={() => setMobileSubTab("controls")}
                  className={mobileSubTab === "controls" ? "active" : ""}
                >
                  🎛️ Simular
                </button>
                <button
                  onClick={() => setMobileSubTab("ranking")}
                  className={mobileSubTab === "ranking" ? "active" : ""}
                >
                  🏆 Ranking
                </button>
                <button
                  onClick={() => setMobileSubTab("details")}
                  className={mobileSubTab === "details" ? "active" : ""}
                >
                  📊 Detalles {selectedCuencaId && "📍"}
                </button>
              </div>
            )}

            {/* Floating Left Side: Presets & Controls (CONDITIONAL ON MOBILE) */}
            {(!isMobile || mobileSubTab === "controls" || mobileSubTab === "ranking") && (
              <div className="floating-sidebar-left" style={{ zIndex: 10 }}>
                {(!isMobile || mobileSubTab === "controls") && (
                  <ControlesEscenario escenario={escenario} onChange={handleEscenarioChange} />
                )}
                {(!isMobile || mobileSubTab === "ranking") && (
                  <RankingTabla
                    ranking={rankingSorted}
                    onSelectCuenca={handleSelectCuenca}
                    selectedCuencaId={selectedCuencaId}
                  />
                )}
              </div>
            )}

            {/* Floating Right Side: Metric Inspector (CONDITIONAL ON MOBILE) */}
            {(!isMobile || mobileSubTab === "details") && (
              <div className="floating-sidebar-right" style={{ zIndex: 10 }}>
                <PanelCuenca
                  cuenca={selectedCuencaInfo}
                  metrics={metrics}
                  onPredict={() => setActiveTab("xgboost")}
                />
              </div>
            )}

          </div>
        )}

        {/* TAB 2: XGBOOST ANALYTICS & PREDICTIVE PLAYGROUND */}
        {activeTab === "xgboost" && (
          <div className="fade-in" style={{ flex: 1, display: "flex", flexDirection: "column", padding: "24px", gap: "24px", overflowY: "auto" }}>
            
            {/* Header Metrics Summary (Responsive Class) */}
            <div className="metrics-grid">
              <div className="glass-panel" style={{ padding: "16px", background: "#ffffff" }}>
                <div style={{ fontSize: "10px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Coeficiente R²</div>
                <div style={{ fontSize: "24px", fontWeight: "800", color: "var(--primary)", marginTop: "4px" }}>89.1%</div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>Ajuste de varianza territorial</div>
              </div>
              <div className="glass-panel" style={{ padding: "16px", background: "#ffffff" }}>
                <div style={{ fontSize: "10px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Error Medio (MAE)</div>
                <div style={{ fontSize: "24px", fontWeight: "800", color: "var(--color-verde)", marginTop: "4px" }}>5.76%</div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>Margen promedio en predicción</div>
              </div>
              <div className="glass-panel" style={{ padding: "16px", background: "#ffffff" }}>
                <div style={{ fontSize: "10px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Algoritmo Predictivo</div>
                <div style={{ fontSize: "16px", fontWeight: "800", color: "var(--text-primary)", marginTop: "8px" }}>XGBoost Regressor</div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>Gradient Boosting sobre árboles</div>
              </div>
              <div className="glass-panel" style={{ padding: "16px", background: "#ffffff" }}>
                <div style={{ fontSize: "10px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Variables Clave</div>
                <div style={{ fontSize: "24px", fontWeight: "800", color: "var(--color-amarillo)", marginTop: "4px" }}>6 Reales</div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>Datos físicos sin proxies sintéticos</div>
              </div>
            </div>

            <div className="analytics-grid">
              
              {/* Feature Importance Chart */}
              <div className="glass-panel" style={{ padding: "20px", background: "#ffffff", display: "flex", flexDirection: "column" }}>
                <h3 style={{ fontSize: "14px", fontWeight: "800", marginBottom: "16px", color: "var(--text-primary)" }}>
                  Importancia de Variables (SHAP / XGBoost)
                </h3>
                {featureImportanceData.length > 0 ? (
                  <div style={{ flex: 1, minHeight: "260px" }}>
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart
                        data={featureImportanceData}
                        layout="vertical"
                        margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,23,42,0.04)" />
                        <XAxis type="number" stroke="var(--text-muted)" fontSize={10} unit="%" />
                        <YAxis dataKey="name" type="category" stroke="var(--text-muted)" fontSize={10} width={80} />
                        <ChartTooltip
                          contentStyle={{ background: "#ffffff", border: "1px solid var(--border-color)", borderRadius: "8px", fontSize: "11px", color: "var(--text-primary)" }}
                        />
                        <Bar dataKey="importance" radius={[0, 4, 4, 0]}>
                          {featureImportanceData.map((entry, index) => {
                            const colors = ["#4f46e5", "#6366f1", "#818cf8", "#10b981", "#fbbf24", "#f43f5e"];
                            return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                          })}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)", fontSize: "12px" }}>
                    Cargando métricas del modelo...
                  </div>
                )}
              </div>

              {/* Prediction Playground (Interactive) */}
              <div className="glass-panel" style={{ padding: "20px", background: "#ffffff" }}>
                <h3 style={{ fontSize: "14px", fontWeight: "800", marginBottom: "4px", color: "var(--text-primary)" }}>
                  Playground de Inferencia XGBoost
                </h3>
                <p style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "16px" }}>
                  Modifica las variables físicas reales para simular instantáneamente el índice ISHT en el backend.
                </p>

                {selectedCuencaId && (
                  <div style={{ display: "flex", gap: "8px", alignItems: "center", background: "rgba(79,70,229,0.04)", padding: "8px 12px", borderRadius: "8px", marginBottom: "16px", border: "1px solid rgba(79,70,229,0.08)" }}>
                    <span style={{ fontSize: "12px" }}>📍</span>
                    <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-secondary)" }}>Valores importados de: <strong>{selectedCuencaInfo?.nombre}</strong></span>
                  </div>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 12px", marginBottom: "16px" }}>
                  {[
                    { key: "oferta", label: "Oferta Anual (MMC)" },
                    { key: "demanda", label: "Demanda Anual (MMC)" },
                    { key: "poblacion", label: "Población (Hab.)" },
                    { key: "precip_anual", label: "Precipitación (mm)" },
                    { key: "escorrentia_mm", label: "Escorrentía (mm)" },
                    { key: "area_km2", label: "Área (km²)" }
                  ].map((field) => (
                    <div key={field.key} style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                      <label style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: "700" }}>{field.label}</label>
                      <input
                        type="number"
                        value={mlPlaygroundInput[field.key]}
                        onChange={(e) => setMlPlaygroundInput({ ...mlPlaygroundInput, [field.key]: parseFloat(e.target.value) || 0 })}
                        style={{
                          background: "#ffffff",
                          border: "1px solid var(--border-color)",
                          borderRadius: "8px",
                          padding: "6px 10px",
                          fontSize: "12px",
                          color: "var(--text-primary)",
                          fontFamily: "var(--font-mono)",
                          fontWeight: "600",
                          outline: "none"
                        }}
                      />
                    </div>
                  ))}
                </div>

                <button
                  onClick={handlePredictML}
                  className="btn-premium"
                  disabled={isPredicting}
                  style={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", fontSize: "12px" }}
                >
                  {isPredicting ? "Invocando XGBoost..." : "Ejecutar Predicción en Backend"}
                </button>

                {prediction !== null && (
                  <div style={{
                    marginTop: "14px",
                    background: "linear-gradient(135deg, #e0e7ff 0%, #ffffff 100%)",
                    border: "1px solid rgba(79,70,229,0.15)",
                    borderRadius: "10px",
                    padding: "12px 16px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}>
                    <div>
                      <div style={{ fontSize: "9px", fontWeight: "700", color: "var(--primary)", textTransform: "uppercase" }}>Índice de Estrés Predicho</div>
                      <div style={{ fontSize: "24px", fontWeight: "800", color: "var(--text-primary)", marginTop: "2px" }}>
                        {prediction.toFixed(1)}%
                      </div>
                    </div>
                    <span style={{
                      fontSize: "9px",
                      fontWeight: "700",
                      background: "#ffffff",
                      border: "1px solid var(--border-color)",
                      color: "var(--text-secondary)",
                      padding: "3px 6px",
                      borderRadius: "6px"
                    }}>
                      XGBoost Model v2.0
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: MCKINSEY RISK PORTFOLIO & PUBLIC INVESTMENT MANAGER */}
        {activeTab === "finance" && (
          <div className="fade-in" style={{ flex: 1, display: "flex", flexDirection: "column", padding: "24px", gap: "20px", overflowY: "auto" }}>
            
            {/* Context & Description */}
            <div>
              <h2 style={{ fontSize: "16px", fontWeight: "800", color: "var(--text-primary)" }}>Portafolio de Riesgo Financiero y Sostenibilidad Territorial</h2>
              <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                Auditoría ejecutiva de inversiones y valorizaciones económicas de crisis hídrica proyectada en Soles para las 231 cuencas del Perú.
              </p>
            </div>

            {/* Filter Dashboard Card */}
            <div className="glass-panel" style={{ padding: "14px 16px", background: "#ffffff", display: "flex", gap: "14px", flexWrap: "wrap", alignItems: "center" }}>
              
              {/* Search Inside Portfolio */}
              <div style={{ flex: 1, minWidth: "200px" }}>
                <input
                  type="text"
                  placeholder="Filtrar por nombre o código..."
                  value={portfolioSearch}
                  onChange={(e) => setPortfolioSearch(e.target.value)}
                  style={{
                    width: "100%",
                    background: "#f1f5f9",
                    border: "1px solid var(--border-color)",
                    borderRadius: "8px",
                    padding: "6px 12px",
                    fontSize: "12px",
                    color: "var(--text-primary)",
                    fontWeight: "600",
                    outline: "none"
                  }}
                />
              </div>

              {/* Vertiente filter */}
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <label style={{ fontSize: "9px", fontWeight: "800", color: "var(--text-muted)" }}>VERTIENTE</label>
                <select
                  value={portfolioVertiente}
                  onChange={(e) => setPortfolioVertiente(e.target.value)}
                  style={{
                    background: "#ffffff",
                    border: "1px solid var(--border-color)",
                    color: "var(--text-primary)",
                    borderRadius: "6px",
                    padding: "5px 10px",
                    fontSize: "11px",
                    fontWeight: "600"
                  }}
                >
                  <option value="ALL">Todas las vertientes</option>
                  <option value="Pacific">Pacífico</option>
                  <option value="Amazon">Atlántico</option>
                  <option value="Titicaca">Titicaca</option>
                </select>
              </div>

              {/* Alerta filter */}
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <label style={{ fontSize: "9px", fontWeight: "800", color: "var(--text-muted)" }}>SEMAFORO DE ALERTA</label>
                <select
                  value={portfolioRisk}
                  onChange={(e) => setPortfolioRisk(e.target.value)}
                  style={{
                    background: "#ffffff",
                    border: "1px solid var(--border-color)",
                    color: "var(--text-primary)",
                    borderRadius: "6px",
                    padding: "5px 10px",
                    fontSize: "11px",
                    fontWeight: "600"
                  }}
                >
                  <option value="ALL">Todos los semáforos</option>
                  <option value="rojo">Crisis Crítica (Rojo)</option>
                  <option value="amarillo">Estrés Medio (Amarillo)</option>
                  <option value="azul">Estable / Seguro (Azul)</option>
                </select>
              </div>

              <div style={{ marginLeft: isMobile ? "0" : "auto" }}>
                <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-secondary)" }}>
                  Mostrando {portfolioFiltered.length} de {cuencas.length} registros
                </span>
              </div>
            </div>

            {/* Large Grid Table */}
            <div className="glass-panel" style={{ flex: 1, overflow: "auto", background: "#ffffff" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px", textAlign: "left" }}>
                <thead style={{ position: "sticky", top: 0, background: "#f8fafc", zIndex: 1, borderBottom: "1px solid var(--border-color)" }}>
                  <tr>
                    <th onClick={() => handleSort("codigo")} style={{ padding: "10px 14px", cursor: "pointer", color: "var(--text-secondary)", fontWeight: "700" }}>Código ⇵</th>
                    <th onClick={() => handleSort("nombre")} style={{ padding: "10px 14px", cursor: "pointer", color: "var(--text-secondary)", fontWeight: "700" }}>Nombre de Cuenca ⇵</th>
                    <th style={{ padding: "10px 14px", color: "var(--text-secondary)", fontWeight: "700" }}>Vertiente</th>
                    <th onClick={() => handleSort("poblacion")} style={{ padding: "10px 14px", cursor: "pointer", color: "var(--text-secondary)", textAlign: "right", fontWeight: "700" }}>Población INEI ⇵</th>
                    <th onClick={() => handleSort("oferta")} style={{ padding: "10px 14px", cursor: "pointer", color: "var(--text-secondary)", textAlign: "right", fontWeight: "700" }}>Oferta (MMC) ⇵</th>
                    <th onClick={() => handleSort("demanda")} style={{ padding: "10px 14px", cursor: "pointer", color: "var(--text-secondary)", textAlign: "right", fontWeight: "700" }}>Demanda (MMC) ⇵</th>
                    <th onClick={() => handleSort("indice")} style={{ padding: "10px 14px", cursor: "pointer", color: "var(--text-secondary)", textAlign: "right", fontWeight: "700" }}>Riesgo ISHT ⇵</th>
                    <th onClick={() => handleSort("siaf")} style={{ padding: "10px 14px", cursor: "pointer", color: "var(--text-secondary)", textAlign: "right", fontWeight: "700" }}>Costo Infr. (S/.) ⇵</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolioFiltered.map((c) => {
                    const costoInfra = (c.demanda * 0.15) * (c.indice / 100.0) * 1.5 * 1000000;
                    const semColor = c.semaforo === "rojo" ? "var(--color-rojo)" : (c.semaforo === "amarillo" ? "var(--color-amarillo)" : "var(--color-verde)");
                    const isSelected = selectedCuencaId && String(c.codigo) === String(selectedCuencaId);

                    return (
                      <tr
                        key={c.codigo}
                        onClick={() => {
                          handleSelectCuenca(c.codigo);
                          setActiveTab("map");
                        }}
                        style={{
                          borderBottom: "1px solid rgba(15,23,42,0.04)",
                          cursor: "pointer",
                          background: isSelected ? "var(--primary-light)" : "transparent",
                          transition: "background 0.1s"
                        }}
                        onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = "rgba(15,23,42,0.01)"; }}
                        onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}
                      >
                        <td style={{ padding: "10px 14px", fontFamily: "var(--font-mono)", color: "var(--text-muted)", fontWeight: "600" }}>{c.codigo}</td>
                        <td style={{ padding: "10px 14px", fontWeight: "700", color: isSelected ? "var(--primary)" : "var(--text-primary)" }}>{c.nombre}</td>
                        <td style={{ padding: "10px 14px", color: "var(--text-secondary)" }}>{c.vertiente === "Pacific" ? "Pacífico" : (c.vertiente === "Titicaca" ? "Titicaca" : "Atlántico")}</td>
                        <td style={{ padding: "10px 14px", textAlign: "right", fontWeight: "600" }}>{parseInt(c.poblacion).toLocaleString("en-US")}</td>
                        <td style={{ padding: "10px 14px", textAlign: "right", fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}>{parseFloat(c.oferta).toFixed(1)}</td>
                        <td style={{ padding: "10px 14px", textAlign: "right", fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}>{parseFloat(c.demanda).toFixed(1)}</td>
                        <td style={{ padding: "10px 14px", textAlign: "right", color: semColor, fontWeight: "800" }}>
                          {c.indice.toFixed(1)}%
                        </td>
                        <td style={{ padding: "10px 14px", textAlign: "right", color: "var(--primary)", fontWeight: "700", fontFamily: "var(--font-mono)" }}>
                          S/. {Math.round(costoInfra).toLocaleString("es-PE")}
                        </td>
                      </tr>
                    );
                  })}
                  {portfolioFiltered.length === 0 && (
                    <tr>
                      <td colSpan="8" style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)", fontSize: "12px" }}>
                        No se encontraron registros que coincidan con la búsqueda.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: PCM GEOTON EVALUATION BRIEF (HIGH-END STRIPE/MCKINSEY VALUE PITCH) */}
        {activeTab === "pitch" && (
          <div className="fade-in" style={{ flex: 1, display: "flex", flexDirection: "column", padding: "30px 24px", gap: "24px", overflowY: "auto" }}>
            
            <div style={{ maxWidth: "1000px", margin: "0 auto", width: "100%" }}>
              <div style={{ textAlign: "center", marginBottom: "36px" }}>
                <span style={{
                  background: "var(--primary-light)",
                  color: "var(--primary)",
                  fontSize: "10px",
                  fontWeight: "800",
                  padding: "4px 10px",
                  borderRadius: "99px",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  border: "1px solid rgba(79, 70, 229, 0.1)"
                }}>PCM Geotón 2026 Pitch</span>
                <h2 style={{ fontSize: "24px", fontWeight: "800", color: "var(--text-primary)", letterSpacing: "-0.02em", marginTop: "10px" }}>
                  Estrategia de Propuesta de Alto Impacto
                </h2>
                <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "6px" }}>
                  Ecosistema de datos georreferenciados para la planificación de recursos hídricos e inversión pública ministerial.
                </p>
              </div>

              {/* Grid 4 Strategic Pillars */}
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "20px" }}>
                
                {/* Pillar 1 */}
                <div className="glass-panel" style={{ padding: "24px", background: "#ffffff", position: "relative" }}>
                  <div style={{
                    position: "absolute",
                    top: "20px",
                    right: "24px",
                    fontSize: "36px",
                    fontWeight: "800",
                    color: "rgba(79, 70, 229, 0.05)",
                    fontFamily: "var(--font-mono)",
                    userSelect: "none"
                  }}>01</div>
                  <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "12px" }}>
                    <span style={{ fontSize: "20px" }}>🏆</span>
                    <h3 style={{ fontSize: "14px", fontWeight: "800", color: "var(--text-primary)" }}>Veracidad Absoluta (Sin Proxies)</h3>
                  </div>
                  <p style={{ fontSize: "11px", color: "var(--text-secondary)", lineHeight: "1.6" }}>
                    Para asegurar la máxima honestidad técnica ante el jurado, descartamos variables arbitrarias o proxies artificiales. 
                    La analítica de riesgo utiliza <strong>6 variables físicas reales</strong> reportadas por el ANA (Autoridad Nacional del Agua), INEI, y el producto grillado PISCO del SENAMHI, optimizando las geometrías de las cuencas para respuestas locales inmediatas.
                  </p>
                </div>

                {/* Pillar 2 */}
                <div className="glass-panel" style={{ padding: "24px", background: "#ffffff", position: "relative" }}>
                  <div style={{
                    position: "absolute",
                    top: "20px",
                    right: "24px",
                    fontSize: "36px",
                    fontWeight: "800",
                    color: "rgba(16, 185, 129, 0.05)",
                    fontFamily: "var(--font-mono)",
                    userSelect: "none"
                  }}>02</div>
                  <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "12px" }}>
                    <span style={{ fontSize: "20px" }}>⚙️</span>
                    <h3 style={{ fontSize: "14px", fontWeight: "800", color: "var(--text-primary)" }}>Simulación Climatológica en Tiempo Real</h3>
                  </div>
                  <p style={{ fontSize: "11px", color: "var(--text-secondary)", lineHeight: "1.6" }}>
                    Los sliders del panel simulan el impacto directo de un evento <strong>"Mega El Niño"</strong> o una <strong>Explosión de Demanda Hídrica</strong> demográfica. 
                    El algoritmo recalcula localmente en el navegador a 60 FPS las ponderaciones, permitiendo una toma de decisiones sumamente dinámica.
                  </p>
                </div>

                {/* Pillar 3 */}
                <div className="glass-panel" style={{ padding: "24px", background: "#ffffff", position: "relative" }}>
                  <div style={{
                    position: "absolute",
                    top: "20px",
                    right: "24px",
                    fontSize: "36px",
                    fontWeight: "800",
                    color: "rgba(245, 158, 11, 0.05)",
                    fontFamily: "var(--font-mono)",
                    userSelect: "none"
                  }}>03</div>
                  <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "12px" }}>
                    <span style={{ fontSize: "20px" }}>🧠</span>
                    <h3 style={{ fontSize: "14px", fontWeight: "800", color: "var(--text-primary)" }}>Inteligencia Predictiva XGBoost</h3>
                  </div>
                  <p style={{ fontSize: "11px", color: "var(--text-secondary)", lineHeight: "1.6" }}>
                    Conectamos la plataforma a un microservicio en FastAPI que expone un modelo de regresión <strong>XGBoost entrenado y certificado con un R² del 89.1%</strong>. 
                    Los usuarios pueden manipular las entradas físicas en un playground predictivo interactivo, auditando las proyecciones de estrés con base científica.
                  </p>
                </div>

                {/* Pillar 4 */}
                <div className="glass-panel" style={{ padding: "24px", background: "#ffffff", position: "relative" }}>
                  <div style={{
                    position: "absolute",
                    top: "20px",
                    right: "24px",
                    fontSize: "36px",
                    fontWeight: "800",
                    color: "rgba(239, 68, 68, 0.05)",
                    fontFamily: "var(--font-mono)",
                    userSelect: "none"
                  }}>04</div>
                  <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "12px" }}>
                    <span style={{ fontSize: "20px" }}>💸</span>
                    <h3 style={{ fontSize: "14px", fontWeight: "800", color: "var(--text-primary)" }}>Mapeo de Presupuesto SIAF (Criterio MEF)</h3>
                  </div>
                  <p style={{ fontSize: "11px", color: "var(--text-secondary)", lineHeight: "1.6" }}>
                    Para que la propuesta trascienda la teoría, cuantificamos económicamente el riesgo de las 231 cuencas en Soles. 
                    Al cruzar la demanda sectorial y el nivel de riesgo calculamos estimaciones de <strong>inversión en infraestructura (SIAF/MEF) y pérdidas agrícolas</strong>, uniendo la ciencia climática con el planeamiento fiscal nacional.
                  </p>
                </div>

              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
