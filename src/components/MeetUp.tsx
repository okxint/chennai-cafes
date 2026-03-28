"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { Cafe, areas } from "@/data/cafes";
import { haversineKm } from "@/lib/utils";

interface MeetUpProps {
  cafes: Cafe[];
  onSelectCafe: (cafe: Cafe) => void;
  onClose: () => void;
  showToast: (msg: string) => void;
  initialLocations?: FriendLocation[];
}

interface FriendLocation {
  lat: number;
  lng: number;
  label: string;
}

interface MeetUpResult {
  cafe: Cafe;
  avgDist: number;
  maxDist: number;
  distances: number[];
}

interface SearchSuggestion {
  label: string;
  sublabel: string;
  lat: number;
  lng: number;
  type: "place" | "area";
}

const COLORS = ["#3b82f6", "#f59e0b", "#ef4444", "#22c55e", "#a855f7"];
const FRIEND_LABELS = ["Friend 1", "Friend 2", "Friend 3", "Friend 4", "Friend 5"];

// Build area → avg coordinates map
function buildAreaCoords(cafes: Cafe[]): Map<string, { lat: number; lng: number }> {
  const areaMap = new Map<string, { latSum: number; lngSum: number; count: number }>();
  cafes.forEach((c) => {
    const entry = areaMap.get(c.area) || { latSum: 0, lngSum: 0, count: 0 };
    entry.latSum += c.lat;
    entry.lngSum += c.lng;
    entry.count += 1;
    areaMap.set(c.area, entry);
  });
  const result = new Map<string, { lat: number; lng: number }>();
  areaMap.forEach((v, k) => {
    result.set(k, { lat: v.latSum / v.count, lng: v.lngSum / v.count });
  });
  return result;
}

export default function MeetUp({ cafes, onSelectCafe, onClose, showToast, initialLocations }: MeetUpProps) {
  const [locations, setLocations] = useState<FriendLocation[]>(initialLocations || []);
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const areaCoords = useMemo(() => buildAreaCoords(cafes), [cafes]);

  // Get area-based suggestions (instant, no API)
  const getAreaSuggestions = useCallback(
    (query: string): SearchSuggestion[] => {
      const q = query.toLowerCase();
      return areas
        .filter((a) => a.toLowerCase().includes(q))
        .slice(0, 4)
        .map((a) => ({
          label: a,
          sublabel: `${cafes.filter((c) => c.area === a).length} spots in area`,
          lat: areaCoords.get(a)?.lat || 13.04,
          lng: areaCoords.get(a)?.lng || 80.24,
          type: "area" as const,
        }));
    },
    [areaCoords, cafes]
  );

  // Geocode via Nominatim (free OSM API)
  const searchPlaces = useCallback(async (query: string) => {
    if (query.length < 3) return;
    setSearching(true);
    try {
      const encoded = encodeURIComponent(`${query}, Chennai, India`);
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=5&bounded=1&viewbox=79.9,13.3,80.4,12.5&addressdetails=1`,
        { headers: { "Accept-Language": "en" } }
      );
      const data = await res.json();

      const placeSuggestions: SearchSuggestion[] = data
        .filter((r: any) => {
          const lat = parseFloat(r.lat);
          const lng = parseFloat(r.lon);
          // Only show results within Chennai metro bounds
          return lat >= 12.5 && lat <= 13.35 && lng >= 79.9 && lng <= 80.4;
        })
        .map((r: any) => {
          // Build a clean label
          const parts = r.display_name.split(",").map((s: string) => s.trim());
          const label = parts[0];
          const sublabel = parts.slice(1, 3).join(", ");
          return {
            label,
            sublabel,
            lat: parseFloat(r.lat),
            lng: parseFloat(r.lon),
            type: "place" as const,
          };
        });

      // Merge with area suggestions (areas first, then places, deduplicated)
      const areaSugs = getAreaSuggestions(query);
      const seen = new Set(areaSugs.map((s) => s.label.toLowerCase()));
      const merged = [
        ...areaSugs,
        ...placeSuggestions.filter((p: SearchSuggestion) => !seen.has(p.label.toLowerCase())),
      ].slice(0, 8);

      setSuggestions(merged);
      setShowSuggestions(true);
    } catch {
      // Fallback to area-only suggestions
      setSuggestions(getAreaSuggestions(query));
    } finally {
      setSearching(false);
    }
  }, [getAreaSuggestions]);

  // Debounced search
  const handleInputChange = (value: string) => {
    setInputValue(value);
    setHighlightIdx(-1);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!value.trim()) {
      // Show popular areas when empty
      setSuggestions(
        ["Adyar", "T. Nagar", "Anna Nagar", "Velachery", "Besant Nagar", "Nungambakkam", "Mylapore", "Guindy"]
          .filter((a) => areas.includes(a))
          .map((a) => ({
            label: a,
            sublabel: `${cafes.filter((c) => c.area === a).length} spots`,
            lat: areaCoords.get(a)?.lat || 13.04,
            lng: areaCoords.get(a)?.lng || 80.24,
            type: "area" as const,
          }))
      );
      setShowSuggestions(true);
      return;
    }

    // Instant area matches
    const areaSugs = getAreaSuggestions(value);
    setSuggestions(areaSugs);
    setShowSuggestions(true);

    // Debounced geocode for exact places
    debounceRef.current = setTimeout(() => {
      searchPlaces(value);
    }, 400);
  };

  const addLocation = (suggestion: SearchSuggestion) => {
    if (locations.length >= 5) return;
    setLocations((prev) => [
      ...prev,
      { lat: suggestion.lat, lng: suggestion.lng, label: suggestion.label },
    ]);
    setInputValue("");
    setShowSuggestions(false);
    setHighlightIdx(-1);
    setSuggestions([]);
  };

  const addMyLocation = () => {
    if (!navigator.geolocation) {
      showToast("Geolocation not supported");
      return;
    }
    if (locations.length >= 5) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        let nearestArea = "Your Location";
        let nearestDist = Infinity;
        areaCoords.forEach((coords, name) => {
          const d = haversineKm(pos.coords.latitude, pos.coords.longitude, coords.lat, coords.lng);
          if (d < nearestDist) {
            nearestDist = d;
            nearestArea = name;
          }
        });
        setLocations((prev) => [
          ...prev,
          { lat: pos.coords.latitude, lng: pos.coords.longitude, label: `📍 Near ${nearestArea}` },
        ]);
        showToast(`Added your location (near ${nearestArea})`);
      },
      () => showToast("Could not get location"),
      { enableHighAccuracy: true }
    );
  };

  const removeLocation = (idx: number) => {
    setLocations((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIdx((prev) => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIdx((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightIdx >= 0 && suggestions[highlightIdx]) {
        addLocation(suggestions[highlightIdx]);
      } else if (suggestions.length > 0) {
        addLocation(suggestions[0]);
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Auto-show results when 2+ locations
  const results = useMemo<MeetUpResult[]>(() => {
    if (locations.length < 2) return [];
    const scored = cafes.map((cafe) => {
      const distances = locations.map((loc) =>
        haversineKm(loc.lat, loc.lng, cafe.lat, cafe.lng)
      );
      const avgDist = distances.reduce((s, d) => s + d, 0) / distances.length;
      const maxDist = Math.max(...distances);
      return { cafe, avgDist, maxDist, distances };
    });
    scored.sort((a, b) => {
      const fairDiff = a.maxDist - b.maxDist;
      if (Math.abs(fairDiff) > 0.5) return fairDiff;
      const avgDiff = a.avgDist - b.avgDist;
      if (Math.abs(avgDiff) > 0.3) return avgDiff;
      return b.cafe.rating - a.cafe.rating;
    });
    return scored.slice(0, 10);
  }, [locations, cafes]);

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined" || locations.length < 2) return "";
    const encoded = locations
      .map((l) => `${l.lat.toFixed(4)},${l.lng.toFixed(4)},${encodeURIComponent(l.label)}`)
      .join("|");
    const url = new URL(window.location.href);
    url.search = `?meetup=${encoded}`;
    return url.toString();
  }, [locations]);

  const handleShare = async () => {
    if (!shareUrl) return;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "Meet in the Middle — Chennai Cafes",
          text: `Let's find the best spot to meet! ${locations.map((l) => l.label).join(", ")}`,
          url: shareUrl,
        });
        return;
      } catch { /* cancelled */ }
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      showToast("Link copied!");
    } catch {
      showToast("Could not copy link");
    }
  };

  const handleWhatsApp = () => {
    if (!shareUrl) return;
    const text = `Let's find the best cafe/restaurant to meet! 📍\n${locations.map((l) => `• ${l.label}`).join("\n")}\n\n${shareUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div
      className="absolute inset-0 z-30 overflow-y-auto"
      style={{ background: "rgba(7,8,13,0.98)", backdropFilter: "blur(8px)" }}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={onClose}
            className="flex items-center gap-1 text-sm hover:opacity-80"
            style={{ color: "var(--text-secondary)" }}
          >
            ← Back
          </button>
          {locations.length >= 2 && (
            <div className="flex gap-1.5">
              <button
                onClick={handleShare}
                className="rounded-lg px-2.5 py-1 text-[10px] font-medium hover:opacity-90"
                style={{ background: "var(--bg-hover)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
              >
                🔗 Share
              </button>
              <button
                onClick={handleWhatsApp}
                className="rounded-lg px-2.5 py-1 text-[10px] font-medium hover:opacity-90"
                style={{ background: "rgba(37,211,102,0.15)", border: "1px solid rgba(37,211,102,0.3)", color: "#25d366" }}
              >
                💬 WhatsApp
              </button>
            </div>
          )}
        </div>

        {/* Title */}
        <div className="mb-4">
          <h2 className="text-base font-bold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
            🤝 Meet in the Middle
          </h2>
          <p className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>
            Search any place, address, or landmark in Chennai
          </p>
        </div>

        {/* Added locations */}
        {locations.length > 0 && (
          <div className="space-y-1.5 mb-3">
            {locations.map((loc, i) => (
              <div
                key={i}
                className="flex items-center gap-2 rounded-lg px-3 py-2"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
              >
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full flex-shrink-0"
                  style={{ background: COLORS[i % COLORS.length] }}
                />
                <span className="flex-1 text-xs font-medium truncate" style={{ color: "var(--text-primary)" }}>
                  {loc.label}
                </span>
                <button
                  onClick={() => removeLocation(i)}
                  className="text-xs px-1 hover:opacity-80"
                  style={{ color: "var(--text-muted)" }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Search input with autocomplete */}
        {locations.length < 5 && (
          <div className="mb-4">
            <div className="relative">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onFocus={() => handleInputChange(inputValue)}
                    onKeyDown={handleKeyDown}
                    placeholder={`Search place, address, landmark...`}
                    className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
                    style={{
                      background: "var(--bg-card)",
                      border: "1px solid var(--border)",
                      color: "var(--text-primary)",
                    }}
                    autoComplete="off"
                  />

                  {/* Suggestions dropdown */}
                  {showSuggestions && suggestions.length > 0 && (
                    <div
                      ref={suggestionsRef}
                      className="absolute left-0 right-0 top-full mt-1 rounded-lg overflow-hidden z-50"
                      style={{
                        background: "var(--bg-card)",
                        border: "1px solid var(--border)",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
                        maxHeight: 260,
                        overflowY: "auto",
                      }}
                    >
                      {searching && (
                        <div className="px-3 py-2 text-[10px]" style={{ color: "var(--text-muted)" }}>
                          Searching places...
                        </div>
                      )}
                      {suggestions.map((s, i) => (
                        <button
                          key={`${s.type}-${s.label}-${i}`}
                          onClick={() => addLocation(s)}
                          className="w-full text-left px-3 py-2 flex items-start gap-2 transition-colors"
                          style={{
                            background: highlightIdx === i ? "var(--bg-hover)" : "transparent",
                          }}
                          onMouseEnter={() => setHighlightIdx(i)}
                        >
                          <span className="text-xs mt-0.5 flex-shrink-0" style={{ color: "var(--text-muted)" }}>
                            {s.type === "area" ? "📍" : "🏠"}
                          </span>
                          <div className="min-w-0">
                            <p className="text-sm truncate" style={{ color: "var(--text-primary)" }}>
                              {s.label}
                            </p>
                            <p className="text-[10px] truncate" style={{ color: "var(--text-muted)" }}>
                              {s.sublabel}
                            </p>
                          </div>
                          <span
                            className="ml-auto text-[9px] mt-0.5 rounded px-1 py-px flex-shrink-0"
                            style={{
                              background: s.type === "area" ? "rgba(249,115,22,0.15)" : "rgba(59,130,246,0.15)",
                              color: s.type === "area" ? "var(--accent)" : "#60a5fa",
                            }}
                          >
                            {s.type === "area" ? "AREA" : "PLACE"}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={addMyLocation}
                  className="rounded-lg px-3 py-2.5 text-xs font-medium hover:opacity-90 flex-shrink-0"
                  style={{ background: "var(--bg-hover)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                  title="Use GPS location"
                >
                  📍 GPS
                </button>
              </div>
            </div>

            <p className="text-[10px] mt-1.5 text-center" style={{ color: "var(--text-muted)" }}>
              {locations.length < 2
                ? `Add ${2 - locations.length} more to find middle ground`
                : `${5 - locations.length} more can be added · Try addresses, malls, stations`}
            </p>
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                Best spots to meet
              </h3>
            </div>

            <div className="space-y-1.5">
              {results.map((r, i) => (
                <div
                  key={r.cafe.id}
                  onClick={() => {
                    onSelectCafe(r.cafe);
                    onClose();
                  }}
                  className="cursor-pointer rounded-xl p-2.5 transition-all duration-200 hover:opacity-90"
                  style={{
                    background: i === 0 ? "var(--accent-glow)" : "var(--bg-card)",
                    border: `1px solid ${i === 0 ? "var(--accent)" : "var(--border)"}`,
                  }}
                >
                  <div className="flex gap-2.5">
                    <img
                      src={r.cafe.image}
                      alt={r.cafe.name}
                      className="h-12 w-12 rounded-lg object-cover flex-shrink-0"
                      loading="lazy"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-1">
                        <div className="min-w-0">
                          {i === 0 && (
                            <span
                              className="inline-block rounded px-1.5 py-px text-[8px] font-bold mb-0.5"
                              style={{ background: "var(--accent)", color: "#fff" }}
                            >
                              BEST MATCH
                            </span>
                          )}
                          <h4 className="font-semibold text-[12px] leading-tight truncate" style={{ color: "var(--text-primary)" }}>
                            {r.cafe.name}
                          </h4>
                        </div>
                        <span
                          className="rounded px-1.5 py-0.5 text-[10px] font-semibold flex-shrink-0"
                          style={{ background: "rgba(34,197,94,0.15)", color: "#4ade80" }}
                        >
                          {r.cafe.rating}
                        </span>
                      </div>
                      <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                        {r.cafe.area} · {r.cafe.priceRange} ·{" "}
                        <span style={{ color: r.cafe.type === "cafe" ? "#60a5fa" : "#fbbf24" }}>
                          {r.cafe.type === "cafe" ? "Cafe" : "Restaurant"}
                        </span>
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {r.distances.map((d, j) => (
                          <span
                            key={j}
                            className="rounded px-1 py-px text-[9px] font-medium"
                            style={{
                              background: `${COLORS[j % COLORS.length]}15`,
                              color: COLORS[j % COLORS.length],
                              border: `1px solid ${COLORS[j % COLORS.length]}30`,
                            }}
                          >
                            {locations[j]?.label?.replace("📍 Near ", "").split(",")[0]}: {d < 1 ? `${Math.round(d * 1000)}m` : `${d.toFixed(1)}km`}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
