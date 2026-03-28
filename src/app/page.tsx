"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { cafes, Cafe } from "@/data/cafes";
import Sidebar from "@/components/Sidebar";
import MeetUp from "@/components/MeetUp";
import Toast from "@/components/Toast";
import { getFavorites, toggleFavorite, haversineKm } from "@/lib/utils";

const CafeMap = dynamic(() => import("@/components/Map"), { ssr: false });

export interface Filters {
  type: string;
  cuisine: string;
  area: string;
  price: string;
  service: string;
  q: string;
  openNow: boolean;
  favorites: boolean;
  bestFor: string;
  sort: string;
}

const DEFAULT_FILTERS: Filters = {
  type: "all",
  cuisine: "all",
  area: "all",
  price: "all",
  service: "all",
  q: "",
  openNow: false,
  favorites: false,
  bestFor: "all",
  sort: "rating",
};

function readFiltersFromURL(): {
  filters: Partial<Filters>;
  cafeId: number | null;
  meetupLocations: { lat: number; lng: number; label: string }[] | null;
} {
  if (typeof window === "undefined") return { filters: {}, cafeId: null, meetupLocations: null };
  const params = new URLSearchParams(window.location.search);
  const filters: Partial<Filters> = {};
  if (params.get("type")) filters.type = params.get("type")!;
  if (params.get("cuisine")) filters.cuisine = params.get("cuisine")!;
  if (params.get("area")) filters.area = params.get("area")!;
  if (params.get("price")) filters.price = params.get("price")!;
  if (params.get("service")) filters.service = params.get("service")!;
  if (params.get("q")) filters.q = params.get("q")!;
  if (params.get("openNow") === "1") filters.openNow = true;
  if (params.get("favorites") === "1") filters.favorites = true;
  if (params.get("bestFor")) filters.bestFor = params.get("bestFor")!;
  if (params.get("sort")) filters.sort = params.get("sort")!;
  const cafeId = params.get("cafe") ? parseInt(params.get("cafe")!) : null;

  // Parse meetup locations
  let meetupLocations: { lat: number; lng: number; label: string }[] | null = null;
  const meetup = params.get("meetup");
  if (meetup) {
    try {
      meetupLocations = meetup.split("|").map((part) => {
        const [lat, lng, ...labelParts] = part.split(",");
        return {
          lat: parseFloat(lat),
          lng: parseFloat(lng),
          label: decodeURIComponent(labelParts.join(",")) || "Location",
        };
      });
    } catch {
      meetupLocations = null;
    }
  }

  return { filters, cafeId, meetupLocations };
}

function writeFiltersToURL(filters: Filters, selectedCafeId: number | null) {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams();
  if (selectedCafeId) params.set("cafe", String(selectedCafeId));
  if (filters.type !== "all") params.set("type", filters.type);
  if (filters.cuisine !== "all") params.set("cuisine", filters.cuisine);
  if (filters.area !== "all") params.set("area", filters.area);
  if (filters.price !== "all") params.set("price", filters.price);
  if (filters.service !== "all") params.set("service", filters.service);
  if (filters.q) params.set("q", filters.q);
  if (filters.openNow) params.set("openNow", "1");
  if (filters.favorites) params.set("favorites", "1");
  if (filters.bestFor !== "all") params.set("bestFor", filters.bestFor);
  if (filters.sort !== "rating") params.set("sort", filters.sort);
  const qs = params.toString();
  const url = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
  history.replaceState(null, "", url);
}

export default function Home() {
  const [selectedCafe, setSelectedCafe] = useState<Cafe | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [filteredCafes, setFilteredCafes] = useState<Cafe[]>(cafes);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [toast, setToast] = useState({ message: "", visible: false });
  const [urlLoaded, setUrlLoaded] = useState(false);
  const [showMeetUp, setShowMeetUp] = useState(false);
  const [meetupInitialLocations, setMeetupInitialLocations] = useState<
    { lat: number; lng: number; label: string }[] | null
  >(null);

  // Load favorites and URL params on mount
  useEffect(() => {
    setFavoriteIds(getFavorites());
    const { filters: urlFilters, cafeId, meetupLocations } = readFiltersFromURL();
    if (Object.keys(urlFilters).length > 0) {
      setFilters((prev) => ({ ...prev, ...urlFilters }));
    }
    if (cafeId) {
      const cafe = cafes.find((c) => c.id === cafeId);
      if (cafe) setSelectedCafe(cafe);
    }
    if (meetupLocations && meetupLocations.length >= 2) {
      setMeetupInitialLocations(meetupLocations);
      setShowMeetUp(true);
    }
    setUrlLoaded(true);
  }, []);

  // Sync URL when filters or selected cafe change (skip initial load)
  useEffect(() => {
    if (urlLoaded && !showMeetUp) {
      writeFiltersToURL(filters, selectedCafe?.id ?? null);
    }
  }, [filters, selectedCafe, urlLoaded, showMeetUp]);

  const handleFilterChange = useCallback((filtered: Cafe[]) => {
    setFilteredCafes(filtered);
  }, []);

  const handleFiltersChange = useCallback((newFilters: Filters) => {
    setFilters(newFilters);
  }, []);

  const handleToggleFavorite = useCallback((id: number) => {
    const newFavs = toggleFavorite(id);
    setFavoriteIds(newFavs);
  }, []);

  const showToast = useCallback((message: string) => {
    setToast({ message, visible: true });
  }, []);

  const handleNearMe = useCallback(() => {
    if (userLocation) {
      setUserLocation(null);
      setFilters((f) => ({ ...f, sort: "rating" }));
      return;
    }
    if (!navigator.geolocation) {
      showToast("Geolocation not supported");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setFilters((f) => ({ ...f, sort: "nearest" }));
        showToast("Location found! Sorting by distance.");
      },
      () => showToast("Could not get your location"),
      { enableHighAccuracy: true }
    );
  }, [userLocation, showToast]);

  const handleSurpriseMe = useCallback(() => {
    if (filteredCafes.length === 0) return;
    const random = filteredCafes[Math.floor(Math.random() * filteredCafes.length)];
    setSelectedCafe(random);
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setCollapsed(true);
    }
  }, [filteredCafes]);

  // Compute distances
  const distances = useMemo(() => {
    const map = new Map<number, number>();
    if (userLocation) {
      cafes.forEach((c) => {
        map.set(c.id, haversineKm(userLocation.lat, userLocation.lng, c.lat, c.lng));
      });
    }
    return map;
  }, [userLocation]);

  return (
    <div style={{ height: "100dvh", width: "100vw", overflow: "hidden", background: "var(--bg-primary)" }}>
      <Sidebar
        cafes={cafes}
        selectedCafe={selectedCafe}
        onSelectCafe={(cafe) => {
          setSelectedCafe(cafe);
          if (typeof window !== "undefined" && window.innerWidth < 768) {
            setCollapsed(true);
          }
        }}
        onFilterChange={handleFilterChange}
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        favoriteIds={favoriteIds}
        onToggleFavorite={handleToggleFavorite}
        userLocation={userLocation}
        distances={distances}
        onNearMe={handleNearMe}
        onSurpriseMe={handleSurpriseMe}
        showToast={showToast}
        onMeetUp={() => setShowMeetUp(true)}
      />

      <div className={`map-container ${collapsed ? "" : ""}`}>
        <CafeMap
          cafes={filteredCafes}
          selectedCafe={selectedCafe}
          onSelectCafe={(cafe) => {
            setSelectedCafe(cafe);
            setCollapsed(false);
          }}
        />
      </div>

      {/* Vis badge — darkstores style */}
      <div className="vis-badge">
        <p className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>
          In view <span style={{ fontSize: 16 }}>{filteredCafes.length}</span>
        </p>
        <p className="text-[10px] mt-0.5 flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: "#3b82f6" }} />
          {filteredCafes.filter((c) => c.type === "cafe").length} Cafes
          <span style={{ margin: "0 2px" }}>|</span>
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: "#f59e0b" }} />
          {filteredCafes.filter((c) => c.type === "restaurant").length} Restaurants
        </p>
      </div>

      {/* Meet Up overlay — full screen on mobile, panel on desktop */}
      {showMeetUp && (
        <div className="fixed inset-0 z-40 flex">
          {/* Backdrop — desktop only */}
          <div
            className="absolute inset-0 hidden md:block"
            style={{ background: "rgba(0,0,0,0.5)" }}
            onClick={() => setShowMeetUp(false)}
          />
          <div
            className="relative z-10 w-full md:w-[420px] h-full overflow-hidden"
            style={{ background: "var(--bg-surface)" }}
          >
            <MeetUp
              cafes={cafes}
              onSelectCafe={(cafe) => {
                setSelectedCafe(cafe);
                setShowMeetUp(false);
                setCollapsed(false);
              }}
              onClose={() => setShowMeetUp(false)}
              showToast={showToast}
              initialLocations={meetupInitialLocations || undefined}
            />
          </div>
        </div>
      )}

      <Toast message={toast.message} visible={toast.visible} onDone={() => setToast({ message: "", visible: false })} />
    </div>
  );
}
