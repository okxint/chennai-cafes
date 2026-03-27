"use client";

import { Cafe } from "@/data/cafes";

interface CafeDetailProps {
  cafe: Cafe;
  onClose: () => void;
}

export default function CafeDetail({ cafe, onClose }: CafeDetailProps) {
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${cafe.lat},${cafe.lng}`;

  return (
    <div
      className="absolute inset-0 z-20 overflow-y-auto"
      style={{ background: "rgba(7,8,13,0.97)", backdropFilter: "blur(8px)" }}
    >
      <div className="p-4">
        <button
          onClick={onClose}
          className="mb-3 flex items-center gap-1 text-sm transition-colors hover:opacity-80"
          style={{ color: "var(--text-secondary)" }}
        >
          ← Back
        </button>

        <img
          src={cafe.image}
          alt={cafe.name}
          className="h-48 w-full rounded-xl object-cover"
        />

        <div className="mt-4">
          <div className="flex items-start justify-between">
            <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
              {cafe.name}
            </h2>
            <span
              className="rounded-lg px-2 py-1 text-sm font-semibold"
              style={{ background: "rgba(34,197,94,0.15)", color: "#4ade80" }}
            >
              ⭐ {cafe.rating}
            </span>
          </div>

          <p className="mt-1 text-sm flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
            {cafe.area} · {cafe.priceRange}
            <span
              className="rounded px-1.5 py-0.5 text-[10px] font-medium"
              style={{
                background: cafe.type === "cafe" ? "rgba(59,130,246,0.15)" : "rgba(245,158,11,0.15)",
                color: cafe.type === "cafe" ? "#60a5fa" : "#fbbf24",
              }}
            >
              {cafe.type === "cafe" ? "Cafe" : "Restaurant"}
            </span>
          </p>

          <p className="mt-3 text-sm italic" style={{ color: "var(--accent)" }}>
            {cafe.highlight}
          </p>

          <div className="mt-4 space-y-3">
            <DetailRow label="Cuisine">
              <div className="flex flex-wrap gap-1.5">
                {cafe.cuisine.map((c) => (
                  <span
                    key={c}
                    className="rounded-full px-2.5 py-1 text-xs"
                    style={{ background: "var(--bg-hover)", color: "var(--text-secondary)" }}
                  >
                    {c}
                  </span>
                ))}
              </div>
            </DetailRow>

            <DetailRow label="Service">
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                {cafe.dineInTakeaway === "both"
                  ? "🪑 Dine-in & 📦 Takeaway"
                  : cafe.dineInTakeaway === "dine-in"
                  ? "🪑 Dine-in only"
                  : "📦 Takeaway only"}
              </p>
            </DetailRow>

            <DetailRow label="Hours">
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{cafe.hours}</p>
            </DetailRow>

            <DetailRow label="Address">
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{cafe.address}</p>
            </DetailRow>
          </div>

          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: "var(--accent)" }}
          >
            📍 Open in Google Maps
          </a>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p
        className="text-[10px] font-medium uppercase tracking-widest"
        style={{ color: "var(--text-muted)" }}
      >
        {label}
      </p>
      <div className="mt-1">{children}</div>
    </div>
  );
}
