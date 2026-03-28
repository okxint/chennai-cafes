"use client";

import { useState, useMemo } from "react";
import { Cafe } from "@/data/cafes";
import { haversineKm } from "@/lib/utils";

interface MeetUpProps {
  cafes: Cafe[];
  onSelectCafe: (cafe: Cafe) => void;
  onClose: () => void;
  showToast: (msg: string) => void;
  initialLocations?: { lat: number; lng: number; label: string }[];
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

const COLORS = ["#3b82f6", "#f59e0b", "#ef4444", "#22c55e", "#a855f7"];

export default function MeetUp({ cafes, onSelectCafe, onClose, showToast, initialLocations }: MeetUpProps) {
  const [locations, setLocations] = useState<FriendLocation[]>(initialLocations || []);
  const [areaInput, setAreaInput] = useState("");
  const [pickingOnMap, setPickingOnMap] = useState(false);
  const [showResults, setShowResults] = useState(!!initialLocations?.length && initialLocations.length >= 2);

  const addMyLocation = () => {
    if (!navigator.geolocation) {
      showToast("Geolocation not supported");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocations((prev) => [
          ...prev,
          { lat: pos.coords.latitude, lng: pos.coords.longitude, label: `You (${(prev.length + 1)})` },
        ]);
        showToast("Location added!");
      },
      () => showToast("Could not get location"),
      { enableHighAccuracy: true }
    );
  };

  const addAreaLocation = () => {
    if (!areaInput.trim()) return;
    // Try to find a cafe in that area to get approximate coordinates
    const areaCafe = cafes.find(
      (c) => c.area.toLowerCase() === areaInput.trim().toLowerCase()
    );
    if (areaCafe) {
      setLocations((prev) => [
        ...prev,
        { lat: areaCafe.lat, lng: areaCafe.lng, label: areaInput.trim() },
      ]);
      setAreaInput("");
      showToast(`Added ${areaInput.trim()}`);
    } else {
      // Fuzzy match
      const match = cafes.find(
        (c) => c.area.toLowerCase().includes(areaInput.trim().toLowerCase())
      );
      if (match) {
        setLocations((prev) => [
          ...prev,
          { lat: match.lat, lng: match.lng, label: match.area },
        ]);
        setAreaInput("");
        showToast(`Added ${match.area}`);
      } else {
        showToast("Area not found — try a Chennai area name");
      }
    }
  };

  const removeLocation = (idx: number) => {
    setLocations((prev) => prev.filter((_, i) => i !== idx));
    setShowResults(false);
  };

  // Calculate midpoint and find best spots
  const results = useMemo<MeetUpResult[]>(() => {
    if (locations.length < 2) return [];

    // Geographic midpoint
    const midLat = locations.reduce((s, l) => s + l.lat, 0) / locations.length;
    const midLng = locations.reduce((s, l) => s + l.lng, 0) / locations.length;

    // Score each cafe
    const scored = cafes.map((cafe) => {
      const distances = locations.map((loc) =>
        haversineKm(loc.lat, loc.lng, cafe.lat, cafe.lng)
      );
      const avgDist = distances.reduce((s, d) => s + d, 0) / distances.length;
      const maxDist = Math.max(...distances);
      return { cafe, avgDist, maxDist, distances };
    });

    // Sort by fairness: minimize the maximum distance anyone has to travel,
    // then by average distance, then by rating
    scored.sort((a, b) => {
      const fairDiff = a.maxDist - b.maxDist;
      if (Math.abs(fairDiff) > 0.5) return fairDiff;
      const avgDiff = a.avgDist - b.avgDist;
      if (Math.abs(avgDiff) > 0.3) return avgDiff;
      return b.cafe.rating - a.cafe.rating;
    });

    return scored.slice(0, 8);
  }, [locations, cafes]);

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined" || locations.length < 2) return "";
    const encoded = locations.map((l) => `${l.lat.toFixed(4)},${l.lng.toFixed(4)},${encodeURIComponent(l.label)}`).join("|");
    const url = new URL(window.location.href);
    url.search = `?meetup=${encoded}`;
    return url.toString();
  }, [locations]);

  const handleShare = async () => {
    if (!shareUrl) return;
    if (navigator.share) {
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
      style={{ background: "rgba(7,8,13,0.97)", backdropFilter: "blur(8px)" }}
    >
      <div className="p-4 max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onClose}
            className="flex items-center gap-1 text-sm transition-colors hover:opacity-80"
            style={{ color: "var(--text-secondary)" }}
          >
            ← Back
          </button>
        </div>

        <div className="text-center mb-5">
          <span className="text-3xl">📍</span>
          <h2 className="text-lg font-bold mt-1" style={{ color: "var(--text-primary)" }}>
            Meet in the Middle
          </h2>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
            Add everyone's location — we'll find the fairest spot
          </p>
        </div>

        {/* Location list */}
        <div className="space-y-2 mb-3">
          {locations.map((loc, i) => (
            <div
              key={i}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
            >
              <span
                className="inline-block h-3 w-3 rounded-full flex-shrink-0"
                style={{ background: COLORS[i % COLORS.length] }}
              />
              <span className="flex-1 text-sm truncate" style={{ color: "var(--text-primary)" }}>
                {loc.label}
              </span>
              <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                {loc.lat.toFixed(3)}, {loc.lng.toFixed(3)}
              </span>
              <button
                onClick={() => removeLocation(i)}
                className="text-xs hover:opacity-80"
                style={{ color: "var(--text-muted)" }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* Add location controls */}
        {locations.length < 5 && (
          <div className="space-y-2 mb-4">
            {/* Area input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={areaInput}
                onChange={(e) => setAreaInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addAreaLocation()}
                placeholder="Type area name (e.g., Adyar, T. Nagar)..."
                className="flex-1 rounded-lg px-3 py-2 text-sm outline-none"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                }}
              />
              <button
                onClick={addAreaLocation}
                className="rounded-lg px-3 py-2 text-xs font-medium transition-opacity hover:opacity-90"
                style={{ background: "var(--accent)", color: "#fff" }}
              >
                Add
              </button>
            </div>

            {/* Quick buttons */}
            <div className="flex gap-2">
              <button
                onClick={addMyLocation}
                className="flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-opacity hover:opacity-90"
                style={{ background: "var(--bg-hover)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
              >
                📍 Use My Location
              </button>
            </div>

            <p className="text-[10px] text-center" style={{ color: "var(--text-muted)" }}>
              {5 - locations.length} more location{5 - locations.length !== 1 ? "s" : ""} can be added
            </p>
          </div>
        )}

        {/* Find spots button */}
        {locations.length >= 2 && !showResults && (
          <button
            onClick={() => setShowResults(true)}
            className="w-full rounded-xl px-4 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 mb-4"
            style={{ background: "var(--accent)" }}
          >
            Find Best Spots for {locations.length} People
          </button>
        )}

        {/* Results */}
        {showResults && results.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                Best spots to meet
              </h3>
              <div className="flex gap-1.5">
                <button
                  onClick={handleShare}
                  className="rounded-lg px-2.5 py-1 text-[10px] font-medium transition-opacity hover:opacity-90"
                  style={{ background: "var(--bg-hover)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                >
                  🔗 Share
                </button>
                <button
                  onClick={handleWhatsApp}
                  className="rounded-lg px-2.5 py-1 text-[10px] font-medium transition-opacity hover:opacity-90"
                  style={{ background: "rgba(37,211,102,0.15)", border: "1px solid rgba(37,211,102,0.3)", color: "#25d366" }}
                >
                  💬 WhatsApp
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {results.map((r, i) => (
                <div
                  key={r.cafe.id}
                  onClick={() => {
                    onSelectCafe(r.cafe);
                    onClose();
                  }}
                  className="cursor-pointer rounded-xl p-3 transition-all duration-200 hover:opacity-90"
                  style={{
                    background: i === 0 ? "var(--accent-glow)" : "var(--bg-card)",
                    border: `1px solid ${i === 0 ? "var(--accent)" : "var(--border)"}`,
                  }}
                >
                  <div className="flex gap-2.5">
                    <img
                      src={r.cafe.image}
                      alt={r.cafe.name}
                      className="h-14 w-14 rounded-lg object-cover flex-shrink-0"
                      loading="lazy"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-1">
                        <div>
                          {i === 0 && (
                            <span
                              className="inline-block rounded px-1.5 py-0.5 text-[9px] font-bold mb-0.5"
                              style={{ background: "var(--accent)", color: "#fff" }}
                            >
                              BEST MATCH
                            </span>
                          )}
                          <h4 className="font-semibold text-[13px] leading-tight" style={{ color: "var(--text-primary)" }}>
                            {r.cafe.name}
                          </h4>
                        </div>
                        <span
                          className="rounded-md px-1.5 py-0.5 text-[10px] font-semibold flex-shrink-0"
                          style={{ background: "rgba(34,197,94,0.15)", color: "#4ade80" }}
                        >
                          {r.cafe.rating}
                        </span>
                      </div>
                      <p className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                        {r.cafe.area} · {r.cafe.priceRange} ·{" "}
                        <span style={{ color: r.cafe.type === "cafe" ? "#60a5fa" : "#fbbf24" }}>
                          {r.cafe.type === "cafe" ? "Cafe" : "Restaurant"}
                        </span>
                      </p>
                      {/* Distance per person */}
                      <div className="flex flex-wrap gap-1 mt-1">
                        {r.distances.map((d, j) => (
                          <span
                            key={j}
                            className="rounded px-1.5 py-0.5 text-[9px] font-medium"
                            style={{
                              background: `${COLORS[j % COLORS.length]}20`,
                              color: COLORS[j % COLORS.length],
                              border: `1px solid ${COLORS[j % COLORS.length]}40`,
                            }}
                          >
                            {locations[j]?.label?.split(" ")[0]}: {d < 1 ? `${Math.round(d * 1000)}m` : `${d.toFixed(1)}km`}
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
