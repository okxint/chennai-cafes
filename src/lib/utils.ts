/** Parse time string like "7:00 AM" to minutes since midnight */
function parseTime(str: string): number {
  const match = str.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return -1;
  let hours = parseInt(match[1]);
  const minutes = parseInt(match[2]);
  const period = match[3].toUpperCase();
  if (period === "AM" && hours === 12) hours = 0;
  if (period === "PM" && hours !== 12) hours += 12;
  return hours * 60 + minutes;
}

/** Check if a cafe is currently open based on its hours string */
export function isOpenNow(hours: string): boolean {
  if (!hours) return false;
  const h = hours.trim().toLowerCase();
  if (h === "24 hours" || h === "24/7" || h === "open 24 hours") return true;

  // Match pattern like "7:00 AM – 10:30 PM" or "7:00 AM - 10:30 PM"
  const match = hours.match(/(.+?)\s*[–\-]\s*(.+)/);
  if (!match) return false;

  const open = parseTime(match[1]);
  const close = parseTime(match[2]);
  if (open === -1 || close === -1) return false;

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Handle past-midnight closing (e.g., 6:00 PM – 2:00 AM)
  if (close < open) {
    return currentMinutes >= open || currentMinutes <= close;
  }
  return currentMinutes >= open && currentMinutes <= close;
}

/** Haversine distance in km between two lat/lng points */
export function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const FAVORITES_KEY = "chennai-cafes-favorites";

export function getFavorites(): number[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]");
  } catch {
    return [];
  }
}

export function toggleFavorite(id: number): number[] {
  const favs = getFavorites();
  const idx = favs.indexOf(id);
  if (idx >= 0) favs.splice(idx, 1);
  else favs.push(id);
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
  return [...favs];
}

export function isFavorite(id: number): boolean {
  return getFavorites().includes(id);
}
