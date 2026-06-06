export default function PanelCuenca({ cuenca, metrics, onPredict }) {
  if (!cuenca) {
    return (
      <div className="glass-panel" style={{
        padding: "36px 20px",
        textAlign: "center",
        color: "var(--text-secondary)",
        fontSize: "12px",
        fontWeight: "600",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "12px",
        height: "100%",
        justifyContent: "center"
      }}>
        {/* Globe Icon */}
        <svg style={{ width: "32px", height: "36px", color: "var(--text-muted)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span style={{ lineHeight: "1.5" }}>Selecciona una cuenca en el mapa o utiliza el buscador superior para auditar sus métricas de seguridad hídrica territorial.</span>
      </div>
    );
  }

  const indice = cuenca.indice ?? 50;
  const demanda = cuenca.demanda ?? 100;
  
  // Costo de infraestructura estimado en Soles (Fórmula indicativa pública para el SIAF)
  const costoInfraSoles = Math.round((demanda * 0.15) * (indice / 100.0) * 1.5 * 1000000);
  const perdidasAgroSoles = Math.round((demanda * 0.08) * (indice / 100.0) * 0.8 * 1000000);

  const getSemaforoLabel = (semaforo) => {
    if (semaforo === "rojo") return "🔴 CRISIS CRÍTICA / RIESGO MÁXIMO";
    if (semaforo === "amarillo") return "🟡 ESTRÉS MODERADO / ALERTA";
    return "🔵 ESTABLE / BAJO RIESGO";
  };

  const getSemaforoColor = (semaforo) => {
    if (semaforo === "rojo") return "var(--color-rojo)";
    if (semaforo === "amarillo") return "var(--color-amarillo)";
    return "var(--color-verde)";
  };

  const isCritical = cuenca.semaforo === "rojo";

  // Alerta Preventiva Dinámica y Humana (Planificación Territorial y Recomendaciones de Política)
  const getRecomendacionPreventiva = () => {
    const iCcm = cuenca.i_ccm ?? 0;
    const iEaf = cuenca.i_eaf ?? 0;
    
    if (indice >= 66) {
      return {
        titulo: "🚨 ACCIÓN DE EMERGENCIA INMEDIATA REQUERIDA",
        tipo: "danger",
        desc: "Esta cuenca sobrepasa los umbrales de seguridad hídrica nacional. Se sugiere decretar estado de emergencia hídrica regional, restringir nuevas licencias de uso consuntivo industrial y activar comités de vigilancia participativa de la ANA para evitar conflictos.",
        bg: "rgba(239, 68, 68, 0.04)",
        border: "rgba(239, 68, 68, 0.2)",
        color: "var(--color-rojo)"
      };
    }
    
    if (iCcm > 50) {
      return {
        titulo: "⚠️ ALERTA: PRESIÓN MINERA EN CABECERAS DE CUENCA",
        tipo: "warning",
        desc: `Presenta un ${cuenca.area_concesionada_cabecera_pct}% de territorio concesionado por INGEMMET y ${cuenca.pam_alto_riesgo} pasivos ambientales de alto riesgo. Se recomienda priorizar recursos presupuestales del SIAF para remediación de relaves y fiscalización de vertimientos.`,
        bg: "rgba(139, 92, 246, 0.04)",
        border: "rgba(139, 92, 246, 0.2)",
        color: "#8b5cf6"
      };
    }
    
    if (iEaf > 50) {
      return {
        titulo: "💧 ALERTA: SOBREEXPLOTACIÓN ACUÍFERA SUBTERRÁNEA",
        tipo: "warning",
        desc: `La napa freática desciende a una tasa crítica de ${cuenca.dh_dt} m/año debido a la agricultura intensiva. Se sugiere incentivar el riego tecnificado mediante subsidios y vedar la perforación de nuevos pozos en zonas de alta subsidencia de suelo.`,
        bg: "rgba(236, 72, 153, 0.04)",
        border: "rgba(236, 72, 153, 0.2)",
        color: "#ec4899"
      };
    }

    return {
      titulo: "✅ MONITOREO Y CONSERVACIÓN PREVENTIVA",
      tipo: "success",
      desc: "Cuenca con balance hídrico y presiones socioeconómicas estables. Se sugiere implementar programas de reforestación en zonas altas para retención hídrica natural y MRSE (Mecanismos de Retribución por Servicios Ecosistémicos).",
      bg: "rgba(16, 185, 129, 0.04)",
      border: "rgba(16, 185, 129, 0.15)",
      color: "var(--color-verde)"
    };
  };

  const rec = getRecomendacionPreventiva();

  return (
    <div className={`glass-panel ${isCritical ? "pulse-red-glow" : ""}`} style={{
      color: "var(--text-primary)",
      padding: "18px",
      display: "flex",
      flexDirection: "column",
      gap: "16px",
      transition: "all 0.3s ease",
      overflowY: "auto",
      maxHeight: "100%"
    }}>
      {/* Cabecera de Cuenca */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: "10px", fontWeight: "700", color: "var(--text-muted)", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Unidad Hidrográfica: {cuenca.codigo}
          </div>
          <span style={{
            fontSize: "9px",
            fontWeight: "700",
            background: cuenca.vertiente === "Pacific" ? "rgba(59,130,246,0.08)" : (cuenca.vertiente === "Titicaca" ? "rgba(245,158,11,0.08)" : "rgba(16,185,129,0.08)"),
            color: cuenca.vertiente === "Pacific" ? "#2563eb" : (cuenca.vertiente === "Titicaca" ? "#d97706" : "#059669"),
            padding: "2px 6px",
            borderRadius: "4px",
            border: "1px solid currentColor"
          }}>
            Vertiente {cuenca.vertiente === "Pacific" ? "Pacífico" : (cuenca.vertiente === "Titicaca" ? "Titicaca" : "Atlántico")}
          </span>
        </div>
        <h2 style={{ fontSize: "18px", fontWeight: "800", color: "var(--text-primary)", margin: "6px 0 0 0", letterSpacing: "-0.02em" }}>
          {cuenca.nombre}
        </h2>
      </div>

      {/* Bloque de Índices Compuestos */}
      <div style={{ background: "#f8fafc", padding: "14px", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
        <div style={{ fontSize: "9.5px", fontWeight: "800", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "4px", letterSpacing: "0.05em" }}>
          ÍNDICE DE VULNERABILIDAD Y ESTRÉS HÍDRICO (ISHT)
        </div>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <span style={{ fontSize: "32px", fontWeight: "800", color: "var(--text-primary)", letterSpacing: "-0.03em" }}>
            {indice.toFixed(1)}%
          </span>
          <span style={{
            fontSize: "10px",
            fontWeight: "800",
            color: getSemaforoColor(cuenca.semaforo),
            padding: "3px 8px",
            borderRadius: "6px",
            background: `${getSemaforoColor(cuenca.semaforo)}0f`,
            border: `1px solid ${getSemaforoColor(cuenca.semaforo)}20`
          }}>
            {getSemaforoLabel(cuenca.semaforo)}
          </span>
        </div>
        
        {/* Barra de Progreso */}
        <div style={{ width: "100%", height: "6px", background: "rgba(15,23,42,0.05)", borderRadius: "999px", overflow: "hidden", marginBottom: "8px" }}>
          <div style={{
            width: `${indice}%`,
            height: "100%",
            background: `linear-gradient(90deg, ${getSemaforoColor(cuenca.semaforo)}dd, ${getSemaforoColor(cuenca.semaforo)}ff)`,
            borderRadius: "999px",
            transition: "width 0.4s cubic-bezier(0.16, 1, 0.3, 1)"
          }} />
        </div>

        {/* Leyenda de escala explicada */}
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "9px", fontWeight: "800", color: "var(--text-muted)", marginBottom: "10px" }}>
          <span style={{ color: "var(--color-verde)" }}>🟢 0% (Sostenibilidad Óptima)</span>
          <span style={{ color: "var(--color-rojo)" }}>🔴 100% (Colapso / Crisis Total)</span>
        </div>

        {/* Explicación de la Escala 0-100% (Aclaración de dudas del usuario) */}
        <div style={{
          background: "#ffffff",
          border: "1px solid var(--border-color)",
          borderRadius: "8px",
          padding: "8px 10px",
          fontSize: "10.5px",
          color: "var(--text-secondary)",
          lineHeight: "1.35",
          marginTop: "6px"
        }}>
          <strong>💡 Entendiendo la Escala:</strong> El ISHT es un indicador normativo. 
          Un valor de <strong>0%</strong> indica abundancia física, nula minería conflictiva y acuíferos recargados. 
          Un valor de <strong>100%</strong> representa un estado extremo donde la demanda excede la oferta física y las presiones mineras y de sobreexplotación agrícola saturan totalmente la resiliencia del territorio.
        </div>

        {/* Tres Dimensiones de Estrés (Termómetros) */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "6px", marginTop: "10px" }}>
          <div style={{ background: "#ffffff", padding: "6px", borderRadius: "8px", border: "1px solid var(--border-color)", textAlign: "center" }}>
            <div style={{ fontSize: "9px", color: "var(--text-muted)", fontWeight: "700" }}>Escasez Física</div>
            <div style={{ fontSize: "12px", fontWeight: "800", color: "var(--color-verde)", fontFamily: "var(--font-mono)", marginTop: "2px" }}>
              {parseFloat(cuenca.estres_cantidad ?? cuenca.brecha_norm ?? 50.0).toFixed(0)}%
            </div>
          </div>
          <div style={{ background: "#ffffff", padding: "6px", borderRadius: "8px", border: "1px solid var(--border-color)", textAlign: "center" }}>
            <div style={{ fontSize: "9px", color: "var(--text-muted)", fontWeight: "700" }}>Vertimientos</div>
            <div style={{ fontSize: "12px", fontWeight: "800", color: "var(--color-amarillo)", fontFamily: "var(--font-mono)", marginTop: "2px" }}>
              {parseFloat(cuenca.estres_calidad ?? 50.0).toFixed(0)}%
            </div>
          </div>
          <div style={{ background: "#ffffff", padding: "6px", borderRadius: "8px", border: "1px solid var(--border-color)", textAlign: "center" }}>
            <div style={{ fontSize: "9px", color: "var(--text-muted)", fontWeight: "700" }}>Demanda Agr.</div>
            <div style={{ fontSize: "12px", fontWeight: "800", color: "var(--color-rojo)", fontFamily: "var(--font-mono)", marginTop: "2px" }}>
              {parseFloat(cuenca.presion ?? 50.0).toFixed(0)}%
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN DE RECOMENDACIÓN PREVENTIVA Y GOBERNANZA */}
      <div style={{
        background: rec.bg,
        border: `1px solid ${rec.border}`,
        borderRadius: "12px",
        padding: "12px 14px",
        display: "flex",
        flexDirection: "column",
        gap: "6px"
      }}>
        <div style={{ fontSize: "11px", fontWeight: "800", color: rec.color, display: "flex", alignItems: "center", gap: "6px" }}>
          <span>{rec.titulo}</span>
        </div>
        <p style={{ margin: 0, fontSize: "11px", color: "var(--text-primary)", lineHeight: "1.4", fontWeight: "500" }}>
          {rec.desc}
        </p>
      </div>

      {/* Variables Físicas Reales */}
      <div className="detail-card" style={{ border: "1px solid var(--border-color)", borderRadius: "12px", padding: "12px" }}>
        <div style={{ fontSize: "9px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "8px", letterSpacing: "0.05em" }}>
          Variables Hidrológicas Físicas (ANA/SENAMHI)
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 12px", fontSize: "11px" }}>
          <div>
            <div style={{ color: "var(--text-muted)", fontSize: "10px" }}>Oferta Hidrológica Anual:</div>
            <div style={{ fontWeight: "700", color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>
              {parseFloat(cuenca.oferta).toLocaleString("en-US", { minimumFractionDigits: 1 })} MMC
            </div>
          </div>
          <div>
            <div style={{ color: "var(--text-muted)", fontSize: "10px" }}>Demanda Multisectorial:</div>
            <div style={{ fontWeight: "700", color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>
              {parseFloat(cuenca.demanda).toLocaleString("en-US", { minimumFractionDigits: 1 })} MMC
            </div>
          </div>
          <div>
            <div style={{ color: "var(--text-muted)", fontSize: "10px" }}>Precipitación Media:</div>
            <div style={{ fontWeight: "700", color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>
              {parseFloat(cuenca.precip_anual).toFixed(1)} mm/año
            </div>
          </div>
          <div>
            <div style={{ color: "var(--text-muted)", fontSize: "10px" }}>Población Censada (INEI):</div>
            <div style={{ fontWeight: "700", color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>
              {parseInt(cuenca.poblacion).toLocaleString("en-US")} hab.
            </div>
          </div>
        </div>
      </div>

      {/* Dimensión Minera (INGEMMET) - ENRIQUECIDA Y EXPLICADA CON DETALLE PREVENTIVO */}
      <div className="detail-card" style={{ border: "1px solid var(--border-color)", borderRadius: "12px", padding: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
        <div style={{ fontSize: "9px", fontWeight: "700", color: "#8b5cf6", textTransform: "uppercase", letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: "4px" }}>
          <span>⛏️ Presión Geoespacial Minera (INGEMMET / Defensoría)</span>
        </div>
        
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 12px", fontSize: "11px" }}>
          <div>
            <div style={{ color: "var(--text-muted)", fontSize: "10px" }}>Área Concesionada:</div>
            <div style={{ fontWeight: "700", color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>
              {parseFloat(cuenca.area_concesionada_cabecera_pct ?? 0.0).toFixed(2)}%
            </div>
          </div>
          <div>
            <div style={{ color: "var(--text-muted)", fontSize: "10px" }}>PAMs en Cabecera:</div>
            <div style={{ fontWeight: "700", color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>
              {parseInt(cuenca.pam_alto_riesgo ?? 0)} de alto riesgo
            </div>
          </div>
          <div>
            <div style={{ color: "var(--text-muted)", fontSize: "10px" }}>Conflictos Socioambientales:</div>
            <div style={{ fontWeight: "700", color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>
              {parseInt(cuenca.conflictos_activos ?? 0)} activos
            </div>
          </div>
          <div>
            <div style={{ color: "var(--text-muted)", fontSize: "10px" }}>Índice de Presión Minera:</div>
            <div style={{ fontWeight: "700", color: "#8b5cf6", fontFamily: "var(--font-mono)" }}>
              {parseFloat(cuenca.i_ccm ?? 0.0).toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Explicación Explicativa Humana de Riesgo Minero */}
        <div style={{
          background: "rgba(139, 92, 246, 0.04)",
          border: "1px dashed rgba(139, 92, 246, 0.2)",
          borderRadius: "8px",
          padding: "8px 10px",
          fontSize: "10px",
          color: "var(--text-secondary)",
          lineHeight: "1.4"
        }}>
          <strong>🔍 Diagnóstico Territorial:</strong> Las concesiones mineras superpuestas en cabeceras de cuenca andinas actúan como una potencial amenaza química y física sobre los ríos que alimentan los valles bajos. 
          {cuenca.area_concesionada_cabecera_pct > 25 ? (
            <span style={{ color: "#7c3aed", fontWeight: "600" }}> El alto porcentaje concesionado ({parseFloat(cuenca.area_concesionada_cabecera_pct).toFixed(0)}%) en cabeceras de esta cuenca aumenta drásticamente el riesgo de huelgas, bloqueos y reclamos de agua frente al Estado.</span>
          ) : (
            <span> El nivel moderado de concesionamiento mantiene bajo control la vulnerabilidad socioambiental directa en las fuentes de agua andinas.</span>
          )}
        </div>
      </div>

      {/* Dimensión Agroexportadora - DETALLE DE EXPORTACIONES DE ÉLITE (SUNAT) Y EFICIENCIA ACUÍFERA */}
      <div className="detail-card" style={{ border: "1px solid var(--border-color)", borderRadius: "12px", padding: "12px", display: "flex", flexDirection: "column", gap: "10px" }}>
        <div style={{ fontSize: "9px", fontWeight: "700", color: "#ec4899", textTransform: "uppercase", letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: "4px" }}>
          <span>🥑 Inteligencia Agrícola e Impacto en Acuíferos (SUNAT / ANA)</span>
        </div>
        
        {/* Ratios generales */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 12px", fontSize: "11px" }}>
          <div>
            <div style={{ color: "var(--text-muted)", fontSize: "10px" }}>Retorno de Agua Virtual:</div>
            <div style={{ fontWeight: "700", color: "#ec4899", fontFamily: "var(--font-mono)" }}>
              ${parseFloat(cuenca.ef_agro ?? 2.50).toFixed(2)} FOB/m³
            </div>
          </div>
          <div>
            <div style={{ color: "var(--text-muted)", fontSize: "10px" }}>Riesgo Acuífero Subterráneo:</div>
            <div style={{ fontWeight: "700", color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>
              {parseFloat(cuenca.i_eaf ?? 0.0).toFixed(1)}%
            </div>
          </div>
          <div>
            <div style={{ color: "var(--text-muted)", fontSize: "10px" }}>Descenso Freático Anual:</div>
            <div style={{ fontWeight: "700", color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>
              {parseFloat(cuenca.dh_dt ?? 0.0).toFixed(2)} m/año
            </div>
          </div>
          <div>
            <div style={{ color: "var(--text-muted)", fontSize: "10px" }}>Expansión Agrícola Informal:</div>
            <div style={{ fontWeight: "700", color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>
              +{Math.round(parseFloat(cuenca.delta_ext ?? 0.0) * 100)}%
            </div>
          </div>
        </div>

        {/* Explicación Explicativa Humana de Eficiencia Acuífera y Agua Virtual */}
        <div style={{
          background: "rgba(236, 72, 153, 0.03)",
          border: "1px dashed rgba(236, 72, 153, 0.25)",
          borderRadius: "8px",
          padding: "8px 10px",
          fontSize: "10px",
          color: "var(--text-secondary)",
          lineHeight: "1.4"
        }}>
          <strong>🔍 Concepto Clave:</strong> El <strong>Agua Virtual</strong> representa el volumen de agua consumido para producir los cultivos. El <strong>Retorno de Agua Virtual (FOB/m³)</strong> indica cuántos dólares de exportación genera la región por cada metro cúbico consumido. Si la napa freática baja drásticamente (mayor a 0.20 m/año), significa que la agricultura de exportación se financia mediante el vaciado irreversible del acuífero.
        </div>

        {/* DETALLE DE CULTIVOS DE EXPORTACIÓN (PALTA, ARÁNDANO, ETC) */}
        <div style={{ background: "#fffdfa", border: "1px dashed #ec489950", borderRadius: "10px", padding: "10px", display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ fontSize: "9px", fontWeight: "800", color: "#be185d", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Desglose de Cultivos de Élite (Aduanet 2020-2025)
          </div>
          
          {cuenca.crop_breakdown && cuenca.crop_breakdown.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {cuenca.crop_breakdown.map((cropObj) => {
                const waterFobRatio = cropObj.fob / cropObj.agua_m3;
                
                // Explicaciones humanas personalizadas por cultivo
                let cropExplicacion = "";
                if (cropObj.crop.toLowerCase() === "palta") {
                  cropExplicacion = "🥑 Huella hídrica alta (715 L/kg). Cultivo de alta rentabilidad pero con alto consumo acumulado.";
                } else if (cropObj.crop.toLowerCase() === "arándano") {
                  cropExplicacion = "🫐 Huella hídrica óptima (500 L/kg). Genera el mayor retorno por gota de agua ($ FOB/m³).";
                } else if (cropObj.crop.toLowerCase() === "uva") {
                  cropExplicacion = "🍇 Huella hídrica media (581 L/kg). Requiere pozos profundos en valles vulnerables.";
                } else if (cropObj.crop.toLowerCase() === "espárrago") {
                  cropExplicacion = "🌾 Huella hídrica extrema (1,217 L/kg). Alta exigencia de agua tubular en zonas desérticas.";
                }

                return (
                  <div key={cropObj.crop} style={{
                    background: "#ffffff",
                    border: "1px solid rgba(236,72,153,0.12)",
                    borderRadius: "8px",
                    padding: "6px 10px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontWeight: "850", fontSize: "11px", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "4px" }}>
                        <span>{cropObj.icon}</span> <span>{cropObj.crop.toUpperCase()}</span>
                      </span>
                      <span style={{
                        background: "rgba(236,72,153,0.06)",
                        color: "#be185d",
                        fontSize: "9px",
                        fontWeight: "800",
                        padding: "1px 5px",
                        borderRadius: "4px"
                      }}>
                        ${waterFobRatio.toFixed(2)} FOB/m³
                      </span>
                    </div>
                    
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 8px", fontSize: "10px" }}>
                      <div>
                        <span style={{ color: "var(--text-muted)" }}>Exportado:</span>{" "}
                        <strong style={{ color: "var(--text-secondary)" }}>${(cropObj.fob / 1000000).toLocaleString("en-US", { maximumFractionDigits: 1 })}M FOB</strong>
                      </div>
                      <div>
                        <span style={{ color: "var(--text-muted)" }}>Volumen:</span>{" "}
                        <strong style={{ color: "var(--text-secondary)" }}>{Math.round(cropObj.peso_tm).toLocaleString("en-US")} TM</strong>
                      </div>
                      <div style={{ gridColumn: "span 2" }}>
                        <span style={{ color: "var(--text-muted)" }}>Agua Real Consumida:</span>{" "}
                        <strong style={{ color: "var(--text-secondary)" }}>{(cropObj.agua_m3 / 1000000).toFixed(1)} MMC</strong>
                      </div>
                    </div>

                    <div style={{ fontSize: "8.5px", color: "var(--text-muted)", fontStyle: "italic", borderTop: "1px dotted rgba(236,72,153,0.1)", paddingTop: "4px" }}>
                      {cropExplicacion}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "12px 6px", color: "var(--text-muted)", fontSize: "10px", fontWeight: "600" }}>
              🚫 No se registran aduanas de salida directa ni cultivos de élite (palta, arándano, uva, espárrago) asociados comercialmente a este territorio.
            </div>
          )}
        </div>
      </div>

      {/* Planificación Estratégica de Inversiones (SIAF) */}
      <div className="detail-card" style={{ border: "1px solid var(--border-color)", borderRadius: "12px", padding: "12px" }}>
        <div style={{ fontSize: "9px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "8px", letterSpacing: "0.05em" }}>
          Inversión Pública y Mitigación de Riesgos (SIAF)
        </div>
        
        <div style={{
          background: "#fffbeb", /* elegant warm amber tint */
          border: "1px solid #fde68a",
          padding: "10px 12px",
          borderRadius: "10px",
          fontSize: "11px",
          display: "flex",
          flexDirection: "column",
          gap: "8px"
        }}>
          <div>
            <span style={{ color: "#78350f", fontWeight: "600", fontSize: "10px" }}>Presupuesto de Mitigación de Infraestructura Requerido (SIAF):</span>
            <div style={{ fontWeight: "800", fontSize: "14px", color: "#b45309", fontFamily: "var(--font-mono)", marginTop: "1px" }}>
              S/. {costoInfraSoles.toLocaleString("es-PE")}
            </div>
          </div>
          <div>
            <span style={{ color: "#78350f", fontWeight: "600", fontSize: "10px" }}>Pérdidas de PBI Agrario Proyectadas (Sin Intervención):</span>
            <div style={{ fontWeight: "800", fontSize: "14px", color: "#b45309", fontFamily: "var(--font-mono)", marginTop: "1px" }}>
              S/. {perdidasAgroSoles.toLocaleString("es-PE")}
            </div>
          </div>
        </div>
      </div>

      {/* Inferencia de Inteligencia Artificial */}
      <button 
        onClick={onPredict}
        className="btn-premium"
        style={{
          width: "100%",
          fontSize: "11px",
          padding: "8px 12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",
          border: "1px solid rgba(79, 70, 229, 0.15)",
          borderRadius: "10px"
        }}
      >
        <span>🔮 Simular Impacto Futuro con Inteligencia Artificial (IA)</span>
      </button>
    </div>
  );
}
