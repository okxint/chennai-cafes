"use client";

import { useState, useMemo, useEffect } from "react";
import { Cafe, areas } from "@/data/cafes";
import CafeCard from "./CafeCard";
import CafeDetail from "./CafeDetail";

interface SidebarProps {
  cafes: Cafe[];
  selectedCafe: Cafe | null;
  onSelectCafe: (cafe: Cafe) => void;
  onFilterChange?: (filtered: Cafe[]) => void;
}

type TypeFilter = "all" | "cafe" | "restaurant";
type ServiceFilter = "all" | "dine-in" | "takeaway" | "both";
type CuisineFilter = "all" | "south" | "north" | "chinese" | "continental" | "italian" | "seafood" | "biryani" | "desserts";

const CUISINE_FILTER_MAP: Record<Exclude<CuisineFilter, "all">, string[]> = {
  south: ["South Indian", "Tiffin", "Filter Coffee", "Idli", "Chettinad", "Kerala", "Karnataka", "Kongunadu", "Andhra", "Mangalorean"],
  north: ["North Indian", "Mughlai", "Tandoori", "North West Frontier", "Hyderabadi"],
  chinese: ["Chinese", "Pan-Asian", "Asian", "Oriental", "Thai", "Japanese", "Malaysian"],
  continental: ["Continental", "European", "American", "Mediterranean"],
  italian: ["Italian", "Pizza", "Pasta"],
  seafood: ["Seafood"],
  biryani: ["Biryani", "Mandi", "Arabian", "Arabic"],
  desserts: ["Desserts", "Chocolate", "Bakery", "Sweets"],
};

export default function Sidebar({ cafes, selectedCafe, onSelectCafe, onFilterChange }: SidebarProps) {
  const [search, setSearch] = useState("");
  const [areaFilter, setAreaFilter] = useState<string>("all");
  const [priceFilter, setPriceFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [serviceFilter, setServiceFilter] = useState<ServiceFilter>("all");
  const [cuisineFilter, setCuisineFilter] = useState<CuisineFilter>("all");
  const [showDetail, setShowDetail] = useState(false);

  const filtered = useMemo(() => {
    return cafes.filter((cafe) => {
      const matchesSearch =
        !search ||
        cafe.name.toLowerCase().includes(search.toLowerCase()) ||
        cafe.area.toLowerCase().includes(search.toLowerCase()) ||
        cafe.cuisine.some((c) => c.toLowerCase().includes(search.toLowerCase()));
      const matchesArea = areaFilter === "all" || cafe.area === areaFilter;
      const matchesPrice = priceFilter === "all" || cafe.priceRange === priceFilter;
      const matchesType = typeFilter === "all" || cafe.type === typeFilter;
      const matchesService =
        serviceFilter === "all" ||
        cafe.dineInTakeaway === serviceFilter ||
        (serviceFilter !== "both" && cafe.dineInTakeaway === "both");
      const matchesCuisine =
        cuisineFilter === "all" ||
        cafe.cuisine.some((c) =>
          CUISINE_FILTER_MAP[cuisineFilter]?.some(
            (fc) => c.toLowerCase() === fc.toLowerCase()
          )
        );
      return matchesSearch && matchesArea && matchesPrice && matchesType && matchesService && matchesCuisine;
    });
  }, [cafes, search, areaFilter, priceFilter, typeFilter, serviceFilter, cuisineFilter]);

  useEffect(() => {
    onFilterChange?.(filtered);
  }, [filtered, onFilterChange]);

  const activeFilters = [areaFilter, priceFilter, typeFilter, serviceFilter, cuisineFilter].filter(
    (f) => f !== "all"
  ).length;

  const clearFilters = () => {
    setSearch("");
    setAreaFilter("all");
    setPriceFilter("all");
    setTypeFilter("all");
    setServiceFilter("all");
    setCuisineFilter("all");
  };

  const handleSelect = (cafe: Cafe) => {
    onSelectCafe(cafe);
    setShowDetail(true);
  };

  return (
    <div className="relative flex h-full flex-col bg-zinc-950 border-r border-zinc-800">
      {/* Header */}
      <div className="border-b border-zinc-800 p-4 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">☕</span>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">chennai.cafes</h1>
            <p className="text-[11px] text-zinc-500">
              {cafes.length} spots mapped · Redhills to Chengalpattu
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="mt-3">
          <input
            type="text"
            placeholder="Search by name, area, or cuisine..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-orange-500 transition-colors"
          />
        </div>

        {/* Type toggle: All / Cafes / Restaurants */}
        <div className="mt-2 flex rounded-lg bg-zinc-900 p-0.5">
          {(["all", "cafe", "restaurant"] as TypeFilter[]).map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${
                typeFilter === t
                  ? "bg-orange-500 text-white"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {t === "all" ? "All" : t === "cafe" ? "Cafes" : "Restaurants"}
            </button>
          ))}
        </div>

        {/* Service toggle: Dine-in / Takeaway */}
        <div className="mt-2 flex rounded-lg bg-zinc-900 p-0.5">
          {(["all", "dine-in", "takeaway"] as ServiceFilter[]).map((s) => (
            <button
              key={s}
              onClick={() => setServiceFilter(s)}
              className={`flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${
                serviceFilter === s
                  ? "bg-orange-500 text-white"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {s === "all" ? "All Service" : s === "dine-in" ? "Dine-in" : "Takeaway"}
            </button>
          ))}
        </div>

        {/* Dropdowns row */}
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

        {/* Cuisine filter */}
        <div className="mt-2">
          <select
            value={cuisineFilter}
            onChange={(e) => setCuisineFilter(e.target.value as CuisineFilter)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-2 py-1.5 text-xs text-zinc-300 outline-none focus:border-orange-500"
          >
            <option value="all">All Cuisines</option>
            <option value="south">South Indian</option>
            <option value="north">North Indian / Mughlai</option>
            <option value="chinese">Chinese / Asian</option>
            <option value="continental">Continental / European</option>
            <option value="italian">Italian</option>
            <option value="seafood">Seafood</option>
            <option value="biryani">Biryani / Arabian</option>
            <option value="desserts">Desserts / Bakery</option>
          </select>
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2">
        <span className="text-xs text-zinc-500">
          {filtered.length} spot{filtered.length !== 1 ? "s" : ""} found
        </span>
        {activeFilters > 0 && (
          <button
            onClick={clearFilters}
            className="text-[11px] text-orange-400 hover:text-orange-300 transition-colors"
          >
            Clear filters ({activeFilters})
          </button>
        )}
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
            <p className="text-sm">No spots match your filters</p>
            <button
              onClick={clearFilters}
              className="mt-2 text-xs text-orange-400 hover:text-orange-300"
            >
              Clear all filters
            </button>
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
