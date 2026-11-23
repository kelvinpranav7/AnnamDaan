import { MapContainer, Marker, Polyline, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  TILE_URL,
  TILE_ATTRIBUTION,
  isGeoapifyConfigured,
} from "@/services/geoapifyService";

// Fix Leaflet's default marker icon — Vite doesn't resolve the default paths.
const markerIcon = L.icon({
  iconUrl:
    "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl:
    "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// A red Annam Daan branded pin via SVG data URL.
const primaryPin = L.divIcon({
  className: "annam-pin",
  html: `
    <div style="
      width:32px;height:32px;position:relative;
      transform:translate(-50%,-100%);
    ">
      <div style="
        width:32px;height:32px;border-radius:50%;
        background:#760009;border:3px solid #fff;
        box-shadow:0 4px 12px rgba(118,0,9,0.4);
        display:flex;align-items:center;justify-content:center;
      ">
        <span style="
          color:white;font-family:'Material Symbols Outlined';
          font-size:18px;font-variation-settings:'FILL' 1;
        ">restaurant</span>
      </div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const accentPin = L.divIcon({
  className: "annam-pin-accent",
  html: `
    <div style="
      width:32px;height:32px;position:relative;
      transform:translate(-50%,-100%);
    ">
      <div style="
        width:32px;height:32px;border-radius:50%;
        background:#991b1b;border:3px solid #fff;
        box-shadow:0 4px 12px rgba(153,27,27,0.4);
        display:flex;align-items:center;justify-content:center;
      ">
        <span style="
          color:white;font-family:'Material Symbols Outlined';
          font-size:18px;font-variation-settings:'FILL' 1;
        ">volunteer_activism</span>
      </div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  title?: string;
  subtitle?: string;
  accent?: boolean; // use the alt-colored pin
}

interface GeoMapProps {
  center?: [number, number];
  zoom?: number;
  markers?: MapMarker[];
  /** Polyline (for routes) — array of [lat, lng] */
  route?: [number, number][];
  height?: string;
  className?: string;
}

export function GeoMap({
  center = [12.9716, 77.5946], // Bengaluru default
  zoom = 12,
  markers = [],
  route,
  height = "400px",
  className = "",
}: GeoMapProps) {
  if (!isGeoapifyConfigured) {
    return (
      <div
        className={`bg-surface-container flex items-center justify-center text-on-surface-variant ${className}`}
        style={{ height }}
      >
        <div className="text-center">
          <span className="material-symbols-outlined text-[64px] opacity-30">
            map
          </span>
          <p className="font-body-md text-body-md mt-sm">
            Map unavailable — Geoapify API key not configured.
          </p>
        </div>
      </div>
    );
  }

  // If we have markers but no explicit center, center on the first marker.
  const resolvedCenter: [number, number] =
    markers.length > 0 ? [markers[0].lat, markers[0].lng] : center;

  return (
    <div className={className} style={{ height }}>
      <MapContainer
        center={resolvedCenter}
        zoom={zoom}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution={TILE_ATTRIBUTION}
          url={TILE_URL}
          maxZoom={20}
        />
        {markers.map((m) => (
          <Marker
            key={m.id}
            position={[m.lat, m.lng]}
            icon={m.accent ? accentPin : primaryPin}
          >
            {(m.title || m.subtitle) && (
              <Popup>
                {m.title && (
                  <div className="font-bold text-primary">{m.title}</div>
                )}
                {m.subtitle && (
                  <div className="text-on-surface-variant text-sm">
                    {m.subtitle}
                  </div>
                )}
              </Popup>
            )}
          </Marker>
        ))}
        {route && route.length > 1 && (
          <Polyline
            positions={route}
            pathOptions={{ color: "#760009", weight: 4, opacity: 0.85 }}
          />
        )}
      </MapContainer>
    </div>
  );
}

// Re-export marker icons in case callers want to extend
export { primaryPin, accentPin, markerIcon };
