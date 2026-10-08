/**
 * movies.json dan filmlarni o'qish va Movie tipiga o'girish
 * Supabase ga import qilinmagan filmlarni to'g'ridan saytda ko'rsatish uchun
 */

import { readFileSync } from "fs";
import { resolve } from "path";
import type { Movie } from "@/types";

// Server side da JSON ni o'qish uchun
let _cache: Movie[] | null = null;

function detectType(genre = ""): "film" | "serial" | "cartoon" {
  const g = genre.toLowerCase();
  if (g.includes("multfilm") || g.includes("cartoon")) return "cartoon";
  if (g.includes("serial")) return "serial";
  return "film";
}

function normalizeQuality(q = ""): ("SD" | "HD" | "FullHD" | "4K")[] {
  const qu = q.toUpperCase();
  if (qu.includes("1080") || qu.includes("FULLHD")) return ["FullHD"];
  if (qu.includes("4K"))  return ["4K"];
  return ["HD"];
}

function createSlug(text = "", id = ""): string {
  const base = text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
    .slice(0, 60);
  return base || `json-${id.slice(0, 8)}`;
}

function getDecade(year = 2000): "1960s" | "1970s" | "1980s" | "1990s" | "2000s" | "2010s" {
  if (year >= 2010) return "2010s";
  if (year >= 2000) return "2000s";
  if (year >= 1990) return "1990s";
  if (year >= 1980) return "1980s";
  if (year >= 1970) return "1970s";
  return "1960s";
}

export function getJsonMovies(): Movie[] {
  if (_cache) return _cache;

  try {
    // fs orqali o'qish — webpack require() muammosini hal qiladi
    const jsonPath = resolve(process.cwd(), "../movies.json");
    const raw = JSON.parse(readFileSync(jsonPath, "utf-8")) as any[];

    _cache = raw.map((m) => {
      const year = Number(m.year) || 2024;
      const type = detectType(m.genre);

      return {
        id:             `json-${m.id}`,
        slug:           `json-${createSlug(m.title, m.id)}`,
        title_uz:       m.title || "",
        title_ru:       m.title || "",
        title_en:       m.title || "",
        description_uz: m.description || "",
        description_ru: m.description || "",
        description_en: "",
        poster_url:     m.poster || m.posterImage || m.thumbnail || "",
        backdrop_url:   m.headerImage || m.heroPoster || "",
        trailer_url:    "",
        year,
        decade:         getDecade(year),
        duration:       undefined,
        country:        "",
        director:       "",
        actors:         [],
        type,
        category_id:    "",
        quality:        normalizeQuality(m.quality),
        language:       ["uz"] as any,
        rating_avg:     Math.min(10, Number(m.rating) || 0),
        rating_count:   0,
        views:          m.likes || 0,
        is_featured:    m.heroFeatured || m.showInHeader || false,
        is_daily_gem:   false,
        is_published:   true,
        created_at:     m.createdTime || new Date().toISOString(),
        updated_at:     m.modifiedTime || new Date().toISOString(),
        // Video manba
        video_sources: m.cdnUrl ? [{
          id:          `json-vs-${m.id}`,
          movie_id:    `json-${m.id}`,
          quality:     normalizeQuality(m.quality)[0],
          language:    "uz" as any,
          url:         m.cdnUrl,
          source_type: "external" as any,
        }] : [],
      } as Movie;
    });

    return _cache;
  } catch {
    return [];
  }
}

// Slug bo'yicha bitta film
export function getJsonMovieBySlug(slug: string): Movie | null {
  return getJsonMovies().find((m) => m.slug === slug) || null;
}

// Tur bo'yicha filter
export function getJsonMoviesByType(type: "film" | "serial" | "cartoon"): Movie[] {
  return getJsonMovies().filter((m) => m.type === type);
}

// Qidiruv
export function searchJsonMovies(query: string): Movie[] {
  const q = query.toLowerCase();
  return getJsonMovies().filter(
    (m) =>
      m.title_uz?.toLowerCase().includes(q) ||
      m.title_ru?.toLowerCase().includes(q) ||
      m.description_uz?.toLowerCase().includes(q)
  );
}
