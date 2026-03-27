"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Cafe } from "@/data/cafes";

const cafeIcon = new L.DivIcon({
  className: "custom-marker",
  html: `<div style="
    background: #f97316;
    width: 32px;
    height: 32px;
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    border: 3px solid #fff;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    display: flex;
    align-items: center;
    justify-content: center;
  ">
    <span style="transform: rotate(45deg); font-size: 14px;">☕</span>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const selectedIcon = new L.DivIcon({
  className: "custom-marker-selected",
  html: `<div style="
    background: #dc2626;
    width: 40px;
    height: 40px;
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    border: 3px solid #fff;
    box-shadow: 0 4px 16px rgba(220,38,38,0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
  ">
    <span style="transform: rotate(45deg); font-size: 18px;">☕</span>
  </div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

function FlyToSelected({ cafe }: { cafe: Cafe | null }) {
  const map = useMap();
  useEffect(() => {
    if (cafe) {
      map.flyTo([cafe.lat, cafe.lng], 15, { duration: 0.8 });
    }
  }, [cafe, map]);
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
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      <FlyToSelected cafe={selectedCafe} />
      {cafes.map((cafe) => (
        <Marker
          key={cafe.id}
          position={[cafe.lat, cafe.lng]}
          icon={selectedCafe?.id === cafe.id ? selectedIcon : cafeIcon}
          eventHandlers={{
            click: () => onSelectCafe(cafe),
          }}
        >
          <Popup>
            <div className="text-sm min-w-[200px]">
              <p className="font-bold text-base m-0">{cafe.name}</p>
              <p className="text-gray-500 m-0 mt-1">{cafe.area}</p>
              <p className="m-0 mt-1">⭐ {cafe.rating} · {cafe.priceRange}</p>
              <p className="m-0 mt-1 text-gray-600 italic">{cafe.vibe}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
