"use client";

import { useState, useMemo, useEffect } from "react";
import { Cafe, areas } from "@/data/cafes";
import CafeCard from "./CafeCard";
import CafeDetail from "./CafeDetail";
import { isOpenNow } from "@/lib/utils";
import type { Filters } from "@/app/page";

interface SidebarProps {
  cafes: Cafe[];
  selectedCafe: Cafe | null;
  onSelectCafe: (cafe: Cafe) => void;
  onFilterChange?: (filtered: Cafe[]) => void;
  collapsed: boolean;
  onToggle: () => void;
  filters: Filters;
  onFiltersChange: (f: Filters) => void;
  favoriteIds: number[];
  onToggleFavorite: (id: number) => void;
  userLocation: { lat: number; lng: number } | null;
  distances: Map<number, number>;
  onNearMe: () => void;
  onSurpriseMe: () => void;
  showToast: (msg: string) => void;
}

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

const BEST_FOR_OPTIONS = [
  "Date Night", "Work/Laptop", "Group Hangout", "Pet Friendly",
  "Instagram-worthy", "Late Night", "Breakfast", "Rooftop",
];

export default function Sidebar({
  cafes,
  selectedCafe,
  onSelectCafe,
  onFilterChange,
  collapsed,
  onToggle,
  filters,
  onFiltersChange,
  favoriteIds,
  onToggleFavorite,
  userLocation,
  distances,
  onNearMe,
  onSurpriseMe,
  showToast,
}: SidebarProps) {
  const [showDetail, setShowDetail] = useState(false);
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  const setFilter = <K extends keyof Filters>(key: K, val: Filters[K]) => {
    onFiltersChange({ ...filters, [key]: val });
  };

  const filtered = useMemo(() => {
    return cafes.filter((cafe) => {
      const q = filters.q.toLowerCase();
      const matchesSearch =
        !q ||
        cafe.name.toLowerCase().includes(q) ||
        cafe.area.toLowerCase().includes(q) ||
        cafe.cuisine.some((c) => c.toLowerCase().includes(q));
      const matchesArea = filters.area === "all" || cafe.area === filters.area;
      const matchesPrice = filters.price === "all" || cafe.priceRange === filters.price;
      const matchesType = filters.type === "all" || cafe.type === filters.type;
      const matchesService =
        filters.service === "all" ||
        cafe.dineInTakeaway === filters.service ||
        cafe.dineInTakeaway === "both";
      const cuisineKey = filters.cuisine as CuisineFilter;
      const matchesCuisine =
        cuisineKey === "all" ||
        cafe.cuisine.some((c) =>
          CUISINE_FILTER_MAP[cuisineKey]?.some(
            (fc) => c.toLowerCase() === fc.toLowerCase()
          )
        );
      const matchesOpenNow = !filters.openNow || isOpenNow(cafe.hours);
      const matchesFavorites = !filters.favorites || favoriteIds.includes(cafe.id);
      const matchesBestFor =
        filters.bestFor === "all" ||
        (cafe.bestFor && cafe.bestFor.includes(filters.bestFor));

      return (
        matchesSearch && matchesArea && matchesPrice && matchesType &&
        matchesService && matchesCuisine && matchesOpenNow &&
        matchesFavorites && matchesBestFor
      );
    });
  }, [cafes, filters, favoriteIds]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    if (filters.sort === "nearest" && distances.size > 0) {
      arr.sort((a, b) => (distances.get(a.id) ?? Infinity) - (distances.get(b.id) ?? Infinity));
    } else {
      arr.sort((a, b) => b.rating - a.rating);
    }
    return arr;
  }, [filtered, filters.sort, distances]);

  useEffect(() => {
    onFilterChange?.(filtered);
  }, [filtered, onFilterChange]);

  const activeFilters = [
    filters.area, filters.price, filters.type,
    filters.service, filters.cuisine, filters.bestFor,
  ].filter((f) => f !== "all").length +
    (filters.openNow ? 1 : 0) +
    (filters.favorites ? 1 : 0);

  const clearFilters = () => {
    onFiltersChange({
      type: "all", cuisine: "all", area: "all", price: "all",
      service: "all", q: "", openNow: false, favorites: false,
      bestFor: "all", sort: userLocation ? "nearest" : "rating",
    });
  };

  const handleSelect = (cafe: Cafe) => {
    onSelectCafe(cafe);
    setShowDetail(true);
  };

  useEffect(() => {
    if (selectedCafe) setShowDetail(true);
  }, [selectedCafe]);

  return (
    <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      {/* Toggle button */}
      <button onClick={onToggle} className="sidebar-toggle" aria-label={collapsed ? "Open sidebar" : "Close sidebar"}>
        <span className="hidden md:inline">{collapsed ? "▸" : "◂"}</span>
        <span className="md:hidden">{collapsed ? "▴" : "▾"}</span>
      </button>

      {/* Mobile drag handle */}
      <div className="sidebar-drag-handle hidden" onClick={onToggle} />

      {/* Header — compact */}
      <div style={{ borderBottom: "1px solid var(--border)", padding: "12px 14px 10px" }}>
        {/* Title row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">☕</span>
            <div>
              <h1 className="text-sm font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
                chennai.cafes
              </h1>
              <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                {cafes.length} spots mapped
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setFilter("openNow", !filters.openNow)}
              className={`filter-pill ${filters.openNow ? "active" : ""}`}
              style={{ fontSize: 10, padding: "3px 8px" }}
            >
              🟢 Open
            </button>
            <button
              onClick={() => setFilter("favorites", !filters.favorites)}
              className={`filter-pill ${filters.favorites ? "active" : ""}`}
              style={{ fontSize: 10, padding: "3px 8px" }}
            >
              ♥{favoriteIds.length > 0 ? ` ${favoriteIds.length}` : ""}
            </button>
            <button
              onClick={onNearMe}
              className={`filter-pill ${userLocation ? "active" : ""}`}
              style={{ fontSize: 10, padding: "3px 8px" }}
            >
              📍
            </button>
          </div>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search name, area, cuisine..."
          value={filters.q}
          onChange={(e) => setFilter("q", e.target.value)}
          className="mt-2.5 w-full rounded-lg px-3 py-1.5 text-xs outline-none"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            color: "var(--text-primary)",
          }}
        />

        {/* Primary filters — single row each, horizontal scroll */}
        <div className="filter-pills mt-2">
          {(["all", "cafe", "restaurant"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilter("type", t)}
              className={`filter-pill ${filters.type === t ? "active" : ""}`}
            >
              {t === "all" ? "All" : t === "cafe" ? "☕ Cafes" : "🍽️ Restaurants"}
            </button>
          ))}
          <span style={{ width: 1, background: "var(--border)", flexShrink: 0, margin: "2px 2px" }} />
          {(["all", "dine-in", "takeaway"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter("service", s)}
              className={`filter-pill ${filters.service === s ? "active" : ""}`}
            >
              {s === "all" ? "All" : s === "dine-in" ? "🪑 Dine-in" : "📦 Takeaway"}
            </button>
          ))}
        </div>

        {/* Cuisine — horizontal scroll */}
        <div className="filter-pills mt-1.5">
          {([
            ["all", "All Cuisine"], ["south", "South Indian"], ["north", "North Indian"],
            ["chinese", "Chinese"], ["continental", "Continental"], ["italian", "Italian"],
            ["seafood", "Seafood"], ["biryani", "Biryani"], ["desserts", "Desserts"],
          ] as [CuisineFilter, string][]).map(([val, label]) => (
            <button
              key={val}
              onClick={() => setFilter("cuisine", val)}
              className={`filter-pill ${filters.cuisine === val ? "active" : ""}`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Dropdowns row */}
        <div className="mt-1.5 flex gap-1.5">
          <select
            value={filters.area}
            onChange={(e) => setFilter("area", e.target.value)}
            className="flex-1 rounded-lg px-2 py-1 text-[11px] outline-none"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
          >
            <option value="all">All Areas</option>
            {areas.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
          <select
            value={filters.price}
            onChange={(e) => setFilter("price", e.target.value)}
            className="rounded-lg px-2 py-1 text-[11px] outline-none"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
          >
            <option value="all">Any Price</option>
            <option value="₹">₹ Budget</option>
            <option value="₹₹">₹₹ Mid</option>
            <option value="₹₹₹">₹₹₹ Premium</option>
            <option value="₹₹₹₹">₹₹₹₹ Luxury</option>
          </select>
          <select
            value={filters.sort}
            onChange={(e) => setFilter("sort", e.target.value)}
            className="rounded-lg px-2 py-1 text-[11px] outline-none"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
          >
            <option value="rating">Top Rated</option>
            {userLocation && <option value="nearest">Nearest</option>}
          </select>
        </div>

        {/* Expandable: Best-For vibes */}
        <button
          onClick={() => setShowMoreFilters(!showMoreFilters)}
          className="filter-expand-btn mt-1"
        >
          {showMoreFilters ? "▾ Less filters" : "▸ Vibes & more"}
          {filters.bestFor !== "all" && (
            <span className="rounded-full px-1.5 text-[9px]" style={{ background: "var(--accent)", color: "#fff" }}>1</span>
          )}
        </button>
        <div className={`filter-section-extra ${showMoreFilters ? "open" : ""}`}>
          <div className="filter-pills">
            <button
              onClick={() => setFilter("bestFor", "all")}
              className={`filter-pill ${filters.bestFor === "all" ? "active" : ""}`}
            >
              All Vibes
            </button>
            {BEST_FOR_OPTIONS.map((tag) => (
              <button
                key={tag}
                onClick={() => setFilter("bestFor", tag)}
                className={`filter-pill ${filters.bestFor === tag ? "active" : ""}`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div
        className="flex items-center justify-between px-3.5 py-1.5"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
          {sorted.length} spot{sorted.length !== 1 ? "s" : ""}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={onSurpriseMe}
            className="text-[10px] px-2 py-0.5 rounded-lg transition-colors hover:opacity-80"
            style={{ background: "var(--bg-hover)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
          >
            🎲 Surprise
          </button>
          {activeFilters > 0 && (
            <button
              onClick={clearFilters}
              className="text-[10px] transition-colors hover:opacity-80"
              style={{ color: "var(--accent)" }}
            >
              Clear ({activeFilters})
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
        {sorted.map((cafe) => (
          <CafeCard
            key={cafe.id}
            cafe={cafe}
            isSelected={selectedCafe?.id === cafe.id}
            onClick={() => handleSelect(cafe)}
            isFavorite={favoriteIds.includes(cafe.id)}
            onToggleFavorite={onToggleFavorite}
            distance={distances.get(cafe.id)}
          />
        ))}
        {sorted.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10" style={{ color: "var(--text-muted)" }}>
            <span className="text-2xl mb-2">🔍</span>
            <p className="text-xs">No spots match your filters</p>
            <button onClick={clearFilters} className="mt-2 text-[11px]" style={{ color: "var(--accent)" }}>
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-3 py-1.5 text-center" style={{ borderTop: "1px solid var(--border)" }}>
        <p className="text-[9px]" style={{ color: "var(--text-muted)" }}>
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
        <CafeDetail
          cafe={selectedCafe}
          onClose={() => setShowDetail(false)}
          isFavorite={favoriteIds.includes(selectedCafe.id)}
          onToggleFavorite={onToggleFavorite}
          showToast={showToast}
        />
      )}
    </div>
  );
}
