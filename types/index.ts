// ============================================================
// RetroKino — Asosiy Type Definitsiyalar
// ============================================================

export type Language = "uz" | "ru" | "en";
export type Quality = "SD" | "HD" | "FullHD" | "4K";
export type ContentType = "film" | "serial" | "cartoon";
export type Decade = "1960s" | "1970s" | "1980s" | "1990s" | "2000s" | "2010s";

// --- Kategoriya ---
export interface Category {
  id: string;
  slug: string;
  name_uz: string;
  name_ru: string;
  name_en: string;
  type: ContentType;
  parent_id?: string | null;
  created_at: string;
}

// --- Janr ---
export interface Genre {
  id: string;
  slug: string;
  name_uz: string;
  name_ru: string;
  name_en: string;
}

// --- Film/Serial/Multfilm ---
export interface Movie {
  id: string;
  slug: string;
  title_uz: string;
  title_ru: string;
  title_en: string;
  description_uz: string;
  description_ru: string;
  description_en: string;
  poster_url: string;
  backdrop_url?: string;
  trailer_url?: string;
  year: number;
  decade: Decade;
  duration?: number;           // daqiqalarda (filmlar uchun)
  country: string;
  director: string;
  actors: string[];
  type: ContentType;
  category_id: string;
  category?: Category;
  genres?: Genre[];
  quality: Quality[];
  language: Language[];
  rating_avg: number;
  rating_count: number;
  views: number;
  is_featured: boolean;        // banner uchun
  is_daily_gem: boolean;       // "bugungi unutilgan film"
  is_published: boolean;
  seasons?: Season[];
  created_at: string;
  updated_at: string;
}

// --- Fasl (seriallar uchun) ---
export interface Season {
  id: string;
  movie_id: string;
  season_number: number;
  title_uz?: string;
  title_ru?: string;
  episodes: Episode[];
}

// --- Epizod ---
export interface Episode {
  id: string;
  season_id: string;
  episode_number: number;
  title_uz?: string;
  title_ru?: string;
  duration?: number;
  video_sources: VideoSource[];
}

// --- Video manba ---
export interface VideoSource {
  id: string;
  movie_id?: string;
  episode_id?: string;
  quality: Quality;
  language: Language;
  url: string;
  source_type: "supabase" | "external" | "hls";
}

// --- Foydalanuvchi ---
export interface UserProfile {
  id: string;
  email: string;
  username?: string;
  avatar_url?: string;
  role: "user" | "moderator" | "admin";
  created_at: string;
}

// --- Reyting ---
export interface Rating {
  id: string;
  user_id: string;
  movie_id: string;
  score: number; // 1-10
  created_at: string;
}

// --- Izoh ---
export interface Comment {
  id: string;
  user_id: string;
  movie_id: string;
  parent_id?: string | null;
  content: string;
  is_approved: boolean;
  user?: UserProfile;
  replies?: Comment[];
  created_at: string;
  updated_at: string;
}

// --- Sevimlilar ---
export interface Favorite {
  id: string;
  user_id: string;
  movie_id: string;
  movie?: Movie;
  created_at: string;
}

// --- Keyinroq ko'raman ---
export interface Watchlist {
  id: string;
  user_id: string;
  movie_id: string;
  movie?: Movie;
  created_at: string;
}

// --- Ko'rish tarixi ---
export interface WatchHistory {
  id: string;
  user_id: string;
  movie_id: string;
  episode_id?: string;
  progress: number;  // sekundlarda
  duration: number;  // sekundlarda
  movie?: Movie;
  watched_at: string;
}

// --- Filtr parametrlari ---
export interface FilterParams {
  type?: ContentType;
  category?: string;
  genre?: string;
  decade?: Decade;
  year?: number;
  country?: string;
  quality?: Quality;
  language?: Language;
  sort?: "rating" | "year" | "views" | "alpha" | "forgotten";
  page?: number;
  limit?: number;
}

// --- Qidiruv ---
export interface SearchResult {
  movies: Movie[];
  total: number;
  query: string;
}

// --- Admin statistika ---
export interface AdminStats {
  total_movies: number;
  total_serials: number;
  total_cartoons: number;
  total_users: number;
  total_views: number;
  today_views: number;
  new_users_week: number;
  popular_movies: Movie[];
}
