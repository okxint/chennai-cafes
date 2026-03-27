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
  collapsed: boolean;
  onToggle: () => void;
}

type TypeFilter = "all" | "cafe" | "restaurant";
type ServiceFilter = "all" | "dine-in" | "takeaway";
type CuisineFilter =
  | "all"
  | "south"
  | "north"
  | "chinese"
  | "continental"
  | "italian"
  | "seafood"
  | "biryani"
  | "desserts";

const CUISINE_FILTER_MAP: Record<Exclude<CuisineFilter, "all">, string[]> = {
  south: ["South Indian", "Tiffin", "Filter Coffee", "Idli", "Chettinad", "Kerala", "Karnataka", "Kongunadu", "Andhra", "Mangalorean"],
  north: ["North Indian", "Mughlai", "Tandoori", "North West Frontier", "Hyderabadi"],
  chinese: ["Chinese", "Pan-Asian", "Asian", "Oriental", "Thai", "Japanese", "Malaysian", "Korean"],
  continental: ["Continental", "European", "American", "Mediterranean"],
  italian: ["Italian", "Pizza", "Pasta"],
  seafood: ["Seafood"],
  biryani: ["Biryani", "Mandi", "Arabian", "Arabic"],
  desserts: ["Desserts", "Chocolate", "Bakery", "Sweets"],
};

export default function Sidebar({
  cafes,
  selectedCafe,
  onSelectCafe,
  onFilterChange,
  collapsed,
  onToggle,
}: SidebarProps) {
  const [search, setSearch] = useState("");
  const [areaFilter, setAreaFilter] = useState<string>("all");
  const [priceFilter, setPriceFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [serviceFilter, setServiceFilter] = useState<ServiceFilter>("all");
  const [cuisineFilter, setCuisineFilter] = useState<CuisineFilter>("all");
  const [showDetail, setShowDetail] = useState(false);

  const filtered = useMemo(() => {
    return cafes.filter((cafe) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        cafe.name.toLowerCase().includes(q) ||
        cafe.area.toLowerCase().includes(q) ||
        cafe.cuisine.some((c) => c.toLowerCase().includes(q));
      const matchesArea = areaFilter === "all" || cafe.area === areaFilter;
      const matchesPrice = priceFilter === "all" || cafe.priceRange === priceFilter;
      const matchesType = typeFilter === "all" || cafe.type === typeFilter;
      const matchesService =
        serviceFilter === "all" ||
        cafe.dineInTakeaway === serviceFilter ||
        cafe.dineInTakeaway === "both";
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
    <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      {/* Toggle button */}
      <button onClick={onToggle} className="sidebar-toggle" aria-label={collapsed ? "Open sidebar" : "Close sidebar"}>
        <span className="hidden md:inline">{collapsed ? "▸" : "◂"}</span>
        <span className="md:hidden">{collapsed ? "▴" : "▾"}</span>
      </button>

      {/* Mobile drag handle */}
      <div className="sidebar-drag-handle hidden" onClick={onToggle} />

      {/* Header */}
      <div style={{ borderBottom: "1px solid var(--border)", padding: "16px 16px 12px" }}>
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">☕</span>
          <div>
            <h1 className="text-base font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
              chennai.cafes
            </h1>
            <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
              {cafes.length} spots · Redhills to Chengalpattu
            </p>
          </div>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search by name, area, or cuisine..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mt-3 w-full rounded-xl px-3 py-2 text-sm outline-none transition-colors"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            color: "var(--text-primary)",
          }}
        />

        {/* Type pills */}
        <div className="filter-pills mt-2.5">
          {(["all", "cafe", "restaurant"] as TypeFilter[]).map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`filter-pill ${typeFilter === t ? "active" : ""}`}
            >
              {t === "all" ? "All" : t === "cafe" ? "☕ Cafes" : "🍽️ Restaurants"}
            </button>
          ))}
        </div>

        {/* Service pills */}
        <div className="filter-pills mt-2">
          {(["all", "dine-in", "takeaway"] as ServiceFilter[]).map((s) => (
            <button
              key={s}
              onClick={() => setServiceFilter(s)}
              className={`filter-pill ${serviceFilter === s ? "active" : ""}`}
            >
              {s === "all" ? "All Service" : s === "dine-in" ? "🪑 Dine-in" : "📦 Takeaway"}
            </button>
          ))}
        </div>

        {/* Cuisine pills */}
        <div className="filter-pills mt-2">
          {(
            [
              ["all", "All Cuisine"],
              ["south", "South Indian"],
              ["north", "North Indian"],
              ["chinese", "Chinese/Asian"],
              ["continental", "Continental"],
              ["italian", "Italian"],
              ["seafood", "Seafood"],
              ["biryani", "Biryani"],
              ["desserts", "Desserts"],
            ] as [CuisineFilter, string][]
          ).map(([val, label]) => (
            <button
              key={val}
              onClick={() => setCuisineFilter(val)}
              className={`filter-pill ${cuisineFilter === val ? "active" : ""}`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Dropdowns row */}
        <div className="mt-2 flex gap-2">
          <select
            value={areaFilter}
            onChange={(e) => setAreaFilter(e.target.value)}
            className="flex-1 rounded-lg px-2 py-1.5 text-xs outline-none"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
          >
            <option value="all">All Areas</option>
            {areas.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
          <select
            value={priceFilter}
            onChange={(e) => setPriceFilter(e.target.value)}
            className="rounded-lg px-2 py-1.5 text-xs outline-none"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
          >
            <option value="all">Any Price</option>
            <option value="₹">₹ Budget</option>
            <option value="₹₹">₹₹ Mid</option>
            <option value="₹₹₹">₹₹₹ Premium</option>
            <option value="₹₹₹₹">₹₹₹₹ Luxury</option>
          </select>
        </div>
      </div>

      {/* Stats bar */}
      <div
        className="flex items-center justify-between px-4 py-2"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
          {filtered.length} spot{filtered.length !== 1 ? "s" : ""} found
        </span>
        {activeFilters > 0 && (
          <button
            onClick={clearFilters}
            className="text-[11px] transition-colors hover:opacity-80"
            style={{ color: "var(--accent)" }}
          >
            Clear ({activeFilters})
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
          <div className="flex flex-col items-center justify-center py-12" style={{ color: "var(--text-muted)" }}>
            <span className="text-3xl mb-2">🔍</span>
            <p className="text-sm">No spots match your filters</p>
            <button onClick={clearFilters} className="mt-2 text-xs" style={{ color: "var(--accent)" }}>
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 text-center" style={{ borderTop: "1px solid var(--border)" }}>
        <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
          Built by{" "}
          <a href="https://github.com/okxint" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity" style={{ color: "var(--text-secondary)" }}>
            @okxint
          </a>
          {" · "}
          <a href="https://github.com/okxint/chennai-cafes" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity" style={{ color: "var(--text-secondary)" }}>
            Source
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
