"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Cafe } from "@/data/cafes";

function makeIcon(color: string, size: number, glow: string) {
  return new L.DivIcon({
    className: "",
    html: `<div style="
      background: ${color};
      width: ${size}px;
      height: ${size}px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 2px solid rgba(255,255,255,0.9);
      box-shadow: 0 2px 12px ${glow};
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    ">
      <span style="transform: rotate(45deg); font-size: ${size * 0.42}px;">☕</span>
    </div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
}

const cafeIcon = makeIcon("#f97316", 28, "rgba(249,115,22,0.3)");
const selectedIcon = makeIcon("#ef4444", 38, "rgba(239,68,68,0.5)");

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

interface MapProps {
  cafes: Cafe[];
  selectedCafe: Cafe | null;
  onSelectCafe: (cafe: Cafe) => void;
}

export default function CafeMap({ cafes, selectedCafe, onSelectCafe }: MapProps) {
  return (
    <MapContainer
      center={[13.04, 80.24]}
      zoom={12}
      className="h-full w-full"
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      <FlyToSelected cafe={selectedCafe} />
      <InvalidateOnResize />
      {cafes.map((cafe) => (
        <Marker
          key={cafe.id}
          position={[cafe.lat, cafe.lng]}
          icon={selectedCafe?.id === cafe.id ? selectedIcon : cafeIcon}
          eventHandlers={{ click: () => onSelectCafe(cafe) }}
        >
          <Popup>
            <div style={{ minWidth: 180 }}>
              <p style={{ fontWeight: 700, fontSize: 14, margin: 0, color: "var(--text-primary)" }}>
                {cafe.name}
              </p>
              <p style={{ fontSize: 12, margin: "4px 0 0", color: "var(--text-muted)" }}>
                {cafe.area} · {cafe.priceRange}
              </p>
              <p style={{ fontSize: 12, margin: "2px 0 0", color: "var(--text-secondary)" }}>
                ⭐ {cafe.rating} · {cafe.type === "cafe" ? "Cafe" : "Restaurant"}
              </p>
              <p style={{ fontSize: 11, margin: "4px 0 0", color: "var(--accent)", fontStyle: "italic" }}>
                {cafe.vibe}
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
