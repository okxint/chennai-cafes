"use client";

import { Cafe } from "@/data/cafes";

interface CafeDetailProps {
  cafe: Cafe;
  onClose: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: (id: number) => void;
  showToast?: (msg: string) => void;
}

export default function CafeDetail({
  cafe,
  onClose,
  isFavorite = false,
  onToggleFavorite,
  showToast,
}: CafeDetailProps) {
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${cafe.lat},${cafe.lng}`;

  const getShareUrl = () => {
    if (typeof window === "undefined") return "";
    const url = new URL(window.location.href);
    url.search = `?cafe=${cafe.id}`;
    return url.toString();
  };

  const getShareText = () => {
    const cuisineStr = cafe.cuisine.slice(0, 2).join(", ");
    return `Check out ${cafe.name} in ${cafe.area} — ${cafe.rating}⭐ ${cuisineStr}`;
  };

  const handleShare = async () => {
    const url = getShareUrl();
    const text = getShareText();

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: cafe.name, text, url });
        return;
      } catch {
        // User cancelled or not supported, fall through to clipboard
      }
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(`${text} — ${url}`);
      showToast?.("Link copied!");
    } catch {
      showToast?.("Could not copy link");
    }
  };

  const handleWhatsApp = () => {
    const url = getShareUrl();
    const text = `${getShareText()} — ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div
      className="absolute inset-0 z-20 overflow-y-auto"
      style={{ background: "rgba(7,8,13,0.97)", backdropFilter: "blur(8px)" }}
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={onClose}
            className="flex items-center gap-1 text-sm transition-colors hover:opacity-80"
            style={{ color: "var(--text-secondary)" }}
          >
            ← Back
          </button>
          {onToggleFavorite && (
            <button
              onClick={() => onToggleFavorite(cafe.id)}
              className="text-xl transition-transform hover:scale-110"
              style={{ color: isFavorite ? "#ef4444" : "var(--text-muted)" }}
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              {isFavorite ? "♥" : "♡"}
            </button>
          )}
        </div>

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

            {cafe.bestFor && cafe.bestFor.length > 0 && (
              <DetailRow label="Best For">
                <div className="flex flex-wrap gap-1.5">
                  {cafe.bestFor.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full px-2.5 py-1 text-xs"
                      style={{ background: "rgba(249,115,22,0.12)", color: "var(--accent)" }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </DetailRow>
            )}

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

          {/* Action buttons */}
          <div className="mt-5 flex gap-2">
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: "var(--accent)" }}
            >
              📍 Google Maps
            </a>
            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-1.5 rounded-xl px-4 py-3 text-sm font-semibold transition-opacity hover:opacity-90"
              style={{ background: "var(--bg-hover)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
            >
              🔗 Share
            </button>
            <button
              onClick={handleWhatsApp}
              className="flex items-center justify-center rounded-xl px-3 py-3 text-sm font-semibold transition-opacity hover:opacity-90"
              style={{ background: "rgba(37,211,102,0.15)", border: "1px solid rgba(37,211,102,0.3)", color: "#25d366" }}
              aria-label="Share on WhatsApp"
            >
              💬
            </button>
          </div>
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
