import { useEffect } from "react";
import { GeoJSON, useMap } from "react-leaflet";
import { COLOR } from "../lib/indice";

// Helper to calculate centroid of Polygon or MultiPolygon
function getCentroid(geometry) {
  if (!geometry || !geometry.coordinates) return null;
  let latSum = 0;
  let lngSum = 0;
  let count = 0;

  const traverse = (coords) => {
    if (
      Array.isArray(coords) &&
      coords.length === 2 &&
      typeof coords[0] === "number" &&
      typeof coords[1] === "number"
    ) {
      lngSum += coords[0];
      latSum += coords[1];
      count++;
    } else if (Array.isArray(coords)) {
      for (const item of coords) {
        traverse(item);
      }
    }
  };

  traverse(geometry.coordinates);

  if (count > 0) {
    return [latSum / count, lngSum / count]; // Leaflet expects [lat, lng]
  }
  return null;
}

export default function MapaCuencas({ geojson, onSelectCuenca, selectedCuencaId }) {
  const map = useMap();

  if (!geojson) return null;

  // Fly to selected basin centroid dynamically
  useEffect(() => {
    if (selectedCuencaId && geojson) {
      const feature = geojson.features.find(
        (f) => String(f.properties?.CODIGO || f.properties?.codigo) === String(selectedCuencaId)
      );
      if (feature && feature.geometry) {
        const centroid = getCentroid(feature.geometry);
        if (centroid) {
          map.flyTo(centroid, 9, {
            animate: true,
            duration: 1.5,
          });
        }
      }
    }
  }, [selectedCuencaId, geojson, map]);

  const style = (feature) => {
    const semaforoVal = feature.properties?.ISHT_SEMAFORO || feature.properties?.semaforo || "azul";
    const isSelected = selectedCuencaId && String(feature.properties?.CODIGO) === String(selectedCuencaId);
    return {
      fillColor: COLOR[semaforoVal] || "#6366f1",
      weight: isSelected ? 3 : 1,
      opacity: 1,
      color: isSelected ? "#ffffff" : "rgba(255, 255, 255, 0.25)",
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
          fillOpacity: 0.8,
          weight: 2,
          color: "#ffffff"
        });
      },
      mouseout: (e) => {
        const layer = e.target;
        const isSelected = selectedCuencaId && String(feature.properties?.CODIGO) === String(selectedCuencaId);
        layer.setStyle({
          fillOpacity: isSelected ? 0.8 : 0.45,
          weight: isSelected ? 3 : 1,
          color: isSelected ? "#ffffff" : "rgba(255, 255, 255, 0.25)"
        });
      },
    });

    const nombre = feature.properties?.NOMBRE || feature.properties?.nombre || "Cuenca";
    const indice = feature.properties?.ISHT_INDICE || feature.properties?.indice || 0.0;
    layer.bindTooltip(`<strong>${nombre}</strong><br/>Estrés ISHT: ${indice.toFixed(1)}%`, {
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
