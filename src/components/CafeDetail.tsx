"use client";

import { Cafe } from "@/data/cafes";

interface CafeDetailProps {
  cafe: Cafe;
  onClose: () => void;
}

export default function CafeDetail({ cafe, onClose }: CafeDetailProps) {
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${cafe.lat},${cafe.lng}`;

  return (
    <div className="absolute inset-0 z-20 overflow-y-auto bg-zinc-950/95 backdrop-blur-sm">
      <div className="p-4">
        <button
          onClick={onClose}
          className="mb-3 flex items-center gap-1 text-sm text-zinc-400 hover:text-white transition-colors"
        >
          <span>←</span> Back to list
        </button>

        <img
          src={cafe.image}
          alt={cafe.name}
          className="h-48 w-full rounded-xl object-cover"
        />

        <div className="mt-4">
          <div className="flex items-start justify-between">
            <h2 className="text-xl font-bold text-white">{cafe.name}</h2>
            <span className="rounded-lg bg-green-600/20 px-2 py-1 text-sm font-semibold text-green-400">
              ⭐ {cafe.rating}
            </span>
          </div>

          <p className="mt-1 text-sm text-zinc-400">
            {cafe.area} · {cafe.priceRange} ·{" "}
            <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-medium ${cafe.type === "cafe" ? "bg-blue-500/20 text-blue-400" : "bg-amber-500/20 text-amber-400"}`}>
              {cafe.type === "cafe" ? "Cafe" : "Restaurant"}
            </span>
          </p>

          <p className="mt-3 text-sm italic text-orange-300">{cafe.highlight}</p>

          <div className="mt-4 space-y-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                Cuisine
              </p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {cafe.cuisine.map((c) => (
                  <span
                    key={c}
                    className="rounded-full bg-zinc-800 px-2.5 py-1 text-xs text-zinc-300"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                Service
              </p>
              <p className="mt-1 text-sm text-zinc-300">
                {cafe.dineInTakeaway === "both"
                  ? "Dine-in & Takeaway"
                  : cafe.dineInTakeaway === "dine-in"
                  ? "Dine-in only"
                  : "Takeaway only"}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                Hours
              </p>
              <p className="mt-1 text-sm text-zinc-300">{cafe.hours}</p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                Address
              </p>
              <p className="mt-1 text-sm text-zinc-300">{cafe.address}</p>
            </div>
          </div>

          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
          >
            <span>📍</span> Open in Google Maps
          </a>
        </div>
      </div>
    </div>
  );
}
