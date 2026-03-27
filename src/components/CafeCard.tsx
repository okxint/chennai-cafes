"use client";

import { Cafe } from "@/data/cafes";

interface CafeCardProps {
  cafe: Cafe;
  isSelected: boolean;
  onClick: () => void;
}

export default function CafeCard({ cafe, isSelected, onClick }: CafeCardProps) {
  return (
    <div
      onClick={onClick}
      className={`cursor-pointer rounded-xl border p-4 transition-all duration-200 ${
        isSelected
          ? "border-orange-500 bg-orange-500/10 shadow-lg shadow-orange-500/10"
          : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-600 hover:bg-zinc-800/50"
      }`}
    >
      <div className="flex gap-3">
        <img
          src={cafe.image}
          alt={cafe.name}
          className="h-20 w-20 rounded-lg object-cover flex-shrink-0"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-white text-sm leading-tight truncate">
              {cafe.name}
            </h3>
            <span className="flex-shrink-0 rounded-md bg-green-600/20 px-1.5 py-0.5 text-xs font-medium text-green-400">
              {cafe.rating}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-zinc-400">
            {cafe.area} · {cafe.priceRange}
            <span className={`ml-1 inline-block rounded px-1 py-0.5 text-[9px] font-medium ${cafe.type === "cafe" ? "bg-blue-500/20 text-blue-400" : "bg-amber-500/20 text-amber-400"}`}>
              {cafe.type === "cafe" ? "CAFE" : "RESTAURANT"}
            </span>
          </p>
          <p className="mt-1 text-xs text-orange-300/80 italic">{cafe.vibe}</p>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {cafe.cuisine.slice(0, 3).map((c) => (
              <span
                key={c}
                className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-300"
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
