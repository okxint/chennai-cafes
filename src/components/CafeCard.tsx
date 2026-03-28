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
      className="cursor-pointer rounded-xl p-3 transition-all duration-200"
      style={{
        background: isSelected ? "var(--accent-glow)" : "var(--bg-card)",
        border: `1px solid ${isSelected ? "var(--accent)" : "var(--border)"}`,
      }}
    >
      <div className="flex gap-3">
        <img
          src={cafe.image}
          alt={cafe.name}
          className="h-[72px] w-[72px] rounded-lg object-cover flex-shrink-0"
          loading="lazy"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3
              className="font-semibold text-sm leading-tight truncate"
              style={{ color: "var(--text-primary)" }}
            >
              {cafe.name}
            </h3>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {onToggleFavorite && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(cafe.id);
                  }}
                  className="text-sm transition-transform hover:scale-110"
                  style={{ color: isFavorite ? "#ef4444" : "var(--text-muted)" }}
                  aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                >
                  {isFavorite ? "♥" : "♡"}
                </button>
              )}
              <span
                className="rounded-md px-1.5 py-0.5 text-[11px] font-semibold"
                style={{ background: "rgba(34,197,94,0.15)", color: "#4ade80" }}
              >
                {cafe.rating}
              </span>
            </div>
          </div>
          <p className="mt-0.5 text-[11px] flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
            {cafe.area} · {cafe.priceRange}
            {distance != null && (
              <span
                className="rounded px-1 py-0.5 text-[9px] font-medium"
                style={{ background: "rgba(34,197,94,0.12)", color: "#4ade80" }}
              >
                {distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`}
              </span>
            )}
            <span
              className="rounded px-1 py-0.5 text-[9px] font-medium"
              style={{
                background: cafe.type === "cafe" ? "rgba(59,130,246,0.15)" : "rgba(245,158,11,0.15)",
                color: cafe.type === "cafe" ? "#60a5fa" : "#fbbf24",
              }}
            >
              {cafe.type === "cafe" ? "CAFE" : "RESTAURANT"}
            </span>
            <span
              className="rounded px-1 py-0.5 text-[9px] font-medium"
              style={{ background: "rgba(139,92,246,0.15)", color: "#a78bfa" }}
            >
              {cafe.dineInTakeaway === "both" ? "DINE+TAKE" : cafe.dineInTakeaway === "dine-in" ? "DINE-IN" : "TAKEAWAY"}
            </span>
          </p>
          <p className="mt-1 text-[11px] italic" style={{ color: "var(--accent)" }}>
            {cafe.vibe}
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {cafe.cuisine.slice(0, 3).map((c) => (
              <span
                key={c}
                className="rounded-full px-2 py-0.5 text-[10px]"
                style={{ background: "var(--bg-hover)", color: "var(--text-secondary)" }}
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
