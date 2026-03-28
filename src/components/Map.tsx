"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Cafe } from "@/data/cafes";

/* ─── Marker Icons ─── */
function makeIcon(emoji: string, bg: string, size: number, glow: string) {
  return new L.DivIcon({
    className: "",
    html: `<div style="
      background: ${bg};
      width: ${size}px;
      height: ${size}px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 2px solid rgba(255,255,255,0.85);
      box-shadow: 0 2px 10px ${glow};
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    ">
      <span style="transform: rotate(45deg); font-size: ${size * 0.4}px; line-height: 1;">${emoji}</span>
    </div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
}

// Cafe = blue, Restaurant = amber
const cafeIcon = makeIcon("☕", "#3b82f6", 28, "rgba(59,130,246,0.35)");
const cafeSelectedIcon = makeIcon("☕", "#2563eb", 38, "rgba(37,99,235,0.5)");
const restIcon = makeIcon("🍽️", "#f59e0b", 28, "rgba(245,158,11,0.35)");
const restSelectedIcon = makeIcon("🍽️", "#d97706", 38, "rgba(217,119,6,0.5)");

function getIcon(cafe: Cafe, selected: boolean) {
  if (cafe.type === "cafe") return selected ? cafeSelectedIcon : cafeIcon;
  return selected ? restSelectedIcon : restIcon;
}

/* ─── Cluster Icon ─── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createClusterIcon(cluster: any) {
  const markers = cluster.getAllChildMarkers();
  const count = markers.length;

  // Count cafes vs restaurants in cluster
  let cafeCount = 0;
  let restCount = 0;
  markers.forEach((m: any) => {
    const type = (m.options as { cafeType?: string }).cafeType;
    if (type === "cafe") cafeCount++;
    else restCount++;
  });

  // Determine dominant color
  const cafeRatio = cafeCount / count;
  let bg: string;
  let border: string;
  if (cafeRatio > 0.7) {
    bg = "rgba(59,130,246,0.9)";
    border = "#60a5fa";
  } else if (cafeRatio < 0.3) {
    bg = "rgba(245,158,11,0.9)";
    border = "#fbbf24";
  } else {
    // Mixed — gradient-like split
    bg = `linear-gradient(135deg, rgba(59,130,246,0.9) 50%, rgba(245,158,11,0.9) 50%)`;
    border = "#8b8ba3";
  }

  const size = count < 10 ? 36 : count < 50 ? 42 : count < 100 ? 48 : 54;

  return new L.DivIcon({
    className: "",
    html: `<div style="
      background: ${bg};
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      border: 2.5px solid ${border};
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-weight: 700;
      font-size: ${count >= 100 ? 12 : 13}px;
      font-family: -apple-system, sans-serif;
      box-shadow: 0 3px 12px rgba(0,0,0,0.5);
      cursor: pointer;
      transition: transform 0.15s;
    "><span>${count}</span></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

/* ─── Map helpers ─── */
function FlyToSelected({ cafe }: { cafe: Cafe | null }) {
  const map = useMap();
  useEffect(() => {
    if (cafe) {
      map.flyTo([cafe.lat, cafe.lng], 15, { duration: 0.8 });
    }
  }, [cafe, map]);
  return null;
}

function InvalidateOnResize() {
  const map = useMap();
  useEffect(() => {
    const observer = new ResizeObserver(() => {
      map.invalidateSize();
    });
    const container = map.getContainer();
    if (container) observer.observe(container);
    return () => observer.disconnect();
  }, [map]);
  return null;
}

/* ─── Main Component ─── */
interface MapProps {
  cafes: Cafe[];
  selectedCafe: Cafe | null;
  onSelectCafe: (cafe: Cafe) => void;
}

export default function CafeMap({ cafes, selectedCafe, onSelectCafe }: MapProps) {
  const cafeCount = cafes.filter((c) => c.type === "cafe").length;
  const restCount = cafes.filter((c) => c.type === "restaurant").length;

  return (
    <>
      <MapContainer
        center={[13.04, 80.24]}
        zoom={12}
        className="h-full w-full"
        zoomControl={false}
        maxZoom={18}
        minZoom={10}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <FlyToSelected cafe={selectedCafe} />
        <InvalidateOnResize />

        {/* Zoom controls — custom position for mobile friendliness */}
        <ZoomControl />

        <MarkerClusterGroup
          chunkedLoading
          maxClusterRadius={50}
          spiderfyOnMaxZoom
          showCoverageOnHover={false}
          iconCreateFunction={createClusterIcon}
          animate
          animateAddingMarkers={false}
        >
          {cafes.map((cafe) => (
            <Marker
              key={cafe.id}
              position={[cafe.lat, cafe.lng]}
              icon={getIcon(cafe, selectedCafe?.id === cafe.id)}
              eventHandlers={{ click: () => onSelectCafe(cafe) }}
              // @ts-expect-error custom option for cluster icon
              cafeType={cafe.type}
            >
              <Popup>
                <div style={{ minWidth: 170 }}>
                  <p style={{ fontWeight: 700, fontSize: 13, margin: 0, color: "var(--text-primary)" }}>
                    {cafe.name}
                  </p>
                  <p style={{ fontSize: 11, margin: "3px 0 0", color: "var(--text-muted)" }}>
                    {cafe.area} · {cafe.priceRange}
                  </p>
                  <p style={{ fontSize: 11, margin: "2px 0 0", color: "var(--text-secondary)" }}>
                    ⭐ {cafe.rating} ·{" "}
                    <span style={{ color: cafe.type === "cafe" ? "#60a5fa" : "#fbbf24" }}>
                      {cafe.type === "cafe" ? "Cafe" : "Restaurant"}
                    </span>
                  </p>
                  <p style={{ fontSize: 10, margin: "3px 0 0", color: "var(--accent)", fontStyle: "italic" }}>
                    {cafe.vibe}
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>

      {/* Darkstores-style legend/count badge */}
      <div className="map-legend">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span
              className="inline-block rounded-full"
              style={{ width: 10, height: 10, background: "#3b82f6", border: "1.5px solid #60a5fa" }}
            />
            <span className="text-[11px] font-medium" style={{ color: "var(--text-secondary)" }}>
              {cafeCount} Cafes
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className="inline-block rounded-full"
              style={{ width: 10, height: 10, background: "#f59e0b", border: "1.5px solid #fbbf24" }}
            />
            <span className="text-[11px] font-medium" style={{ color: "var(--text-secondary)" }}>
              {restCount} Restaurants
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

/* ─── Custom Zoom Control (better mobile position) ─── */
function ZoomControl() {
  const map = useMap();
  useEffect(() => {
    const zoom = L.control.zoom({ position: "bottomright" });
    zoom.addTo(map);
    return () => { zoom.remove(); };
  }, [map]);
  return null;
}
