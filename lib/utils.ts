import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { type Language, type Movie } from "@/types";

// Tailwind class birlashtiruvchi
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Til bo'yicha film nomini olish
export function getMovieTitle(movie: Movie, lang: Language): string {
  switch (lang) {
    case "uz": return movie.title_uz || movie.title_ru || movie.title_en;
    case "ru": return movie.title_ru || movie.title_uz || movie.title_en;
    case "en": return movie.title_en || movie.title_ru || movie.title_uz;
    default:   return movie.title_uz;
  }
}

// Til bo'yicha tavsif olish
export function getMovieDesc(movie: Movie, lang: Language): string {
  switch (lang) {
    case "uz": return movie.description_uz || movie.description_ru;
    case "ru": return movie.description_ru || movie.description_uz;
    case "en": return movie.description_en || movie.description_ru;
    default:   return movie.description_uz;
  }
}

// Davomiylikni formatlash: 125 => "2s 5d"
export function formatDuration(minutes: number): string {
  if (!minutes) return "";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} daq`;
  return `${h}s ${m}d`;
}

// Ko'rishlar sonini formatlash: 1500 => "1.5K"
export function formatViews(views: number): string {
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M`;
  if (views >= 1_000)     return `${(views / 1_000).toFixed(1)}K`;
  return views.toString();
}

// Yulduzcha reytingi (10 dan 5 ga o'tkazish)
export function normalizeRating(rating: number): number {
  return Math.round((rating / 10) * 5 * 10) / 10;
}

// O'n yillik label
export function getDecadeLabel(decade: string): string {
  const labels: Record<string, string> = {
    "1960s": "60-yillar",
    "1970s": "70-yillar",
    "1980s": "80-yillar",
    "1990s": "90-yillar",
    "2000s": "2000-yillar",
    "2010s": "2010-yillar",
  };
  return labels[decade] || decade;
}

// Sana formatlash
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("uz-UZ", {
    year:  "numeric",
    month: "long",
    day:   "numeric",
  });
}

// Slug yaratish
export function createSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

// LocalStorage yordamchilari
export const storage = {
  get: <T>(key: string): T | null => {
    if (typeof window === "undefined") return null;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },
  set: <T>(key: string, value: T): void => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore
    }
  },
  remove: (key: string): void => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(key);
  },
};
