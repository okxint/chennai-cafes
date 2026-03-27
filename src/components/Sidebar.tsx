"use client";

import { useState, useMemo } from "react";
import { Cafe, areas } from "@/data/cafes";
import CafeCard from "./CafeCard";
import CafeDetail from "./CafeDetail";

interface SidebarProps {
  cafes: Cafe[];
  selectedCafe: Cafe | null;
  onSelectCafe: (cafe: Cafe) => void;
}

export default function Sidebar({ cafes, selectedCafe, onSelectCafe }: SidebarProps) {
  const [search, setSearch] = useState("");
  const [areaFilter, setAreaFilter] = useState<string>("all");
  const [priceFilter, setPriceFilter] = useState<string>("all");
  const [showDetail, setShowDetail] = useState(false);

  const filtered = useMemo(() => {
    return cafes.filter((cafe) => {
      const matchesSearch =
        !search ||
        cafe.name.toLowerCase().includes(search.toLowerCase()) ||
        cafe.cuisine.some((c) => c.toLowerCase().includes(search.toLowerCase()));
      const matchesArea = areaFilter === "all" || cafe.area === areaFilter;
      const matchesPrice = priceFilter === "all" || cafe.priceRange === priceFilter;
      return matchesSearch && matchesArea && matchesPrice;
    });
  }, [cafes, search, areaFilter, priceFilter]);

  const handleSelect = (cafe: Cafe) => {
    onSelectCafe(cafe);
    setShowDetail(true);
  };

  return (
    <div className="relative flex h-full flex-col bg-zinc-950 border-r border-zinc-800">
      {/* Header */}
      <div className="border-b border-zinc-800 p-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">☕</span>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">chennai.cafes</h1>
            <p className="text-[11px] text-zinc-500">Top cafes & restaurants mapped</p>
          </div>
        </div>

        {/* Search */}
        <div className="mt-3">
          <input
            type="text"
            placeholder="Search cafes or cuisines..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-orange-500 transition-colors"
          />
        </div>

        {/* Filters */}
        <div className="mt-2 flex gap-2">
          <select
            value={areaFilter}
            onChange={(e) => setAreaFilter(e.target.value)}
            className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900 px-2 py-1.5 text-xs text-zinc-300 outline-none focus:border-orange-500"
          >
            <option value="all">All Areas</option>
            {areas.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>
          <select
            value={priceFilter}
            onChange={(e) => setPriceFilter(e.target.value)}
            className="rounded-lg border border-zinc-800 bg-zinc-900 px-2 py-1.5 text-xs text-zinc-300 outline-none focus:border-orange-500"
          >
            <option value="all">Any Price</option>
            <option value="₹">₹ Budget</option>
            <option value="₹₹">₹₹ Mid</option>
            <option value="₹₹₹">₹₹₹ Premium</option>
            <option value="₹₹₹₹">₹₹₹₹ Luxury</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2">
        <span className="text-xs text-zinc-500">
          {filtered.length} cafe{filtered.length !== 1 ? "s" : ""} found
        </span>
        <span className="text-xs text-zinc-600">sorted by rating</span>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filtered
          .sort((a, b) => b.rating - a.rating)
          .map((cafe) => (
            <CafeCard
              key={cafe.id}
              cafe={cafe}
              isSelected={selectedCafe?.id === cafe.id}
              onClick={() => handleSelect(cafe)}
            />
          ))}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
            <span className="text-3xl mb-2">🔍</span>
            <p className="text-sm">No cafes match your filters</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-zinc-800 px-4 py-2">
        <p className="text-[10px] text-zinc-600 text-center">
          Built by{" "}
          <a
            href="https://github.com/okxint"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-400 hover:text-orange-400 transition-colors"
          >
            @okxint
          </a>
          {" · "}
          <a
            href="https://github.com/okxint/chennai-cafes"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-400 hover:text-orange-400 transition-colors"
          >
            GitHub
          </a>
        </p>
      </div>

      {/* Detail overlay */}
      {showDetail && selectedCafe && (
        <CafeDetail cafe={selectedCafe} onClose={() => setShowDetail(false)} />
      )}
    </div>
  );
}
