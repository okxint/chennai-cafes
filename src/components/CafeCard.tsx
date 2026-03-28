"use client";

import { Cafe } from "@/data/cafes";

interface CafeCardProps {
  cafe: Cafe;
  isSelected: boolean;
  onClick: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: (id: number) => void;
  distance?: number;
}

export default function CafeCard({
  cafe,
  isSelected,
  onClick,
  isFavorite = false,
  onToggleFavorite,
  distance,
}: CafeCardProps) {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer rounded-xl p-2.5 transition-all duration-200"
      style={{
        background: isSelected ? "var(--accent-glow)" : "var(--bg-card)",
        border: `1px solid ${isSelected ? "var(--accent)" : "var(--border)"}`,
      }}
    >
      <div className="flex gap-2.5">
        <img
          src={cafe.image}
          alt={cafe.name}
          className="h-[64px] w-[64px] rounded-lg object-cover flex-shrink-0"
          loading="lazy"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-1">
            <h3
              className="font-semibold text-[13px] leading-tight truncate"
              style={{ color: "var(--text-primary)" }}
            >
              {cafe.name}
            </h3>
            <div className="flex items-center gap-1 flex-shrink-0">
              {onToggleFavorite && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(cafe.id);
                  }}
                  className="text-xs transition-transform hover:scale-110"
                  style={{ color: isFavorite ? "#ef4444" : "var(--text-muted)" }}
                >
                  {isFavorite ? "♥" : "♡"}
                </button>
              )}
              <span
                className="rounded-md px-1.5 py-0.5 text-[10px] font-semibold"
                style={{ background: "rgba(34,197,94,0.15)", color: "#4ade80" }}
              >
                {cafe.rating}
              </span>
            </div>
          </div>
          <p className="mt-0.5 text-[10px] flex items-center gap-1 flex-wrap" style={{ color: "var(--text-muted)" }}>
            <span>{cafe.area}</span>
            <span>·</span>
            <span>{cafe.priceRange}</span>
            {distance != null && (
              <span
                className="rounded px-1 py-px text-[9px] font-medium"
                style={{ background: "rgba(34,197,94,0.12)", color: "#4ade80" }}
              >
                {distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`}
              </span>
            )}
            <span
              className="rounded px-1 py-px text-[9px] font-medium"
              style={{
                background: cafe.type === "cafe" ? "rgba(59,130,246,0.12)" : "rgba(245,158,11,0.12)",
                color: cafe.type === "cafe" ? "#60a5fa" : "#fbbf24",
              }}
            >
              {cafe.type === "cafe" ? "CAFE" : "REST."}
            </span>
          </p>
          <p className="mt-0.5 text-[10px] italic truncate" style={{ color: "var(--accent)" }}>
            {cafe.vibe}
          </p>
        </div>
      </div>
    </div>
  );
}
