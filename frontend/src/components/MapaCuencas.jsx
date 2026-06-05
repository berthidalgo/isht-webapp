import { GeoJSON } from "react-leaflet";
import { COLOR } from "../lib/indice";

// F4: mapa Leaflet que pinta las 231 cuencas por color de semáforo.
// Recibe el GeoJSON de /api/cuencas y un handler de clic por cuenca.
export default function MapaCuencas({ geojson, onSelectCuenca, selectedCuencaId }) {
  if (!geojson) return null;

  const style = (feature) => {
    const semaforoVal = feature.properties?.ISHT_SEMAFORO || feature.properties?.semaforo || "azul";
    const isSelected = selectedCuencaId && String(feature.properties?.CODIGO) === String(selectedCuencaId);
    return {
      fillColor: COLOR[semaforoVal] || "#3b82f6",
      weight: isSelected ? 3 : 1,
      opacity: 1,
      color: isSelected ? "#ffffff" : "#475569",
      fillOpacity: isSelected ? 0.8 : 0.45,
    };
  };

  const onEachFeature = (feature, layer) => {
    layer.on({
      click: () => {
        if (onSelectCuenca) {
          onSelectCuenca(feature.properties?.CODIGO || feature.properties?.codigo);
        }
      },
      mouseover: (e) => {
        const layer = e.target;
        layer.setStyle({
          fillOpacity: 0.9,
          weight: 2,
        });
      },
      mouseout: (e) => {
        const layer = e.target;
        const isSelected = selectedCuencaId && String(feature.properties?.CODIGO) === String(selectedCuencaId);
        layer.setStyle({
          fillOpacity: isSelected ? 0.8 : 0.45,
          weight: isSelected ? 3 : 1,
        });
      },
    });

    const nombre = feature.properties?.NOMBRE || feature.properties?.nombre || "Cuenca";
    const indice = feature.properties?.ISHT_INDICE || feature.properties?.indice || 0.0;
    layer.bindTooltip(`<strong>${nombre}</strong><br/>Índice: ${indice}%`, {
      sticky: true,
      direction: "top",
    });
  };

  return (
    <GeoJSON
      key={JSON.stringify(selectedCuencaId) + geojson.features.length}
      data={geojson}
      style={style}
      onEachFeature={onEachFeature}
    />
  );
}
