import { createClient } from "@/lib/supabase/server";
import type { FilterParams, Movie, SearchResult } from "@/types";

// Asosiy film query builderi — sodda, tez
function movieSelect() {
  return `
    id, slug, title_uz, title_ru, title_en,
    description_uz, description_ru, description_en,
    poster_url, backdrop_url, trailer_url,
    year, decade, duration, country, director, actors,
    type, category_id, quality, language,
    rating_avg, rating_count, views,
    is_featured, is_daily_gem, is_published,
    created_at, updated_at
  `;
}

// Barcha filmlarni filtr bilan olish
export async function getMovies(params: FilterParams = {}) {
  const supabase = await createClient();
  const {
    type, category, genre, decade, year, country,
    quality, language, sort = "views",
    page = 1, limit = 24,
  } = params;

  let query = supabase
    .from("movies")
    .select(movieSelect(), { count: "exact" })
    .eq("is_published", true);

  if (type)     query = query.eq("type", type);
  if (category) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", category)
      .maybeSingle();
    query = query.eq("category_id", cat?.id || category);
  }
  if (decade)   query = query.eq("decade", decade);
  if (year)     query = query.eq("year", year);
  if (country)  query = query.ilike("country", `%${country}%`);
  if (quality)  query = query.contains("quality", [quality]);
  if (language) query = query.contains("language", [language]);

  if (genre) {
    const { data: genreRow } = await supabase
      .from("genres")
      .select("id")
      .eq("slug", genre)
      .maybeSingle();
    if (genreRow?.id) {
      const { data: links } = await supabase
        .from("movie_genres")
        .select("movie_id")
        .eq("genre_id", genreRow.id);
      const ids = (links || []).map((l) => l.movie_id);
      if (ids.length === 0) return { movies: [], total: 0 };
      query = query.in("id", ids);
    }
  }

  switch (sort) {
    case "rating":    query = query.order("rating_avg", { ascending: false }); break;
    case "year":      query = query.order("year", { ascending: false }); break;
    case "alpha":     query = query.order("title_uz", { ascending: true }); break;
    case "forgotten": query = query.order("views", { ascending: true }); break;
    default:          query = query.order("views", { ascending: false }); break;
  }

  const from = (page - 1) * limit;
  query = query.range(from, from + limit - 1);

  const { data, error, count } = await query;
  if (error) throw error;

  return {
    movies: (data as unknown as Movie[]) || [],
    total: count || 0,
  };
}

// Bitta film slug bo'yicha — detail sahifa uchun to'liq ma'lumot
export async function getMovieBySlug(slug: string): Promise<Movie | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("movies")
    .select(`
      id, slug, title_uz, title_ru, title_en,
      description_uz, description_ru, description_en,
      poster_url, backdrop_url, trailer_url,
      year, decade, duration, country, director, actors,
      type, category_id, quality, language,
      rating_avg, rating_count, views,
      is_featured, is_daily_gem, is_published,
      created_at, updated_at,
      category:categories(id, slug, name_uz, name_ru, name_en, type),
      movie_genres(genre:genres(id, slug, name_uz, name_ru, name_en)),
      seasons(
        id, season_number, title_uz, title_ru,
        episodes(id, episode_number, title_uz, title_ru, duration,
          video_sources(id, quality, language, url, source_type)
        )
      ),
      video_sources(id, quality, language, url, source_type)
    `)
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (error || !data) return null;
  return data as unknown as Movie;
}

// Bugungi "unutilgan durdona"
export async function getDailyGem(): Promise<Movie | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("movies")
    .select(movieSelect())
    .eq("is_daily_gem", true)
    .eq("is_published", true)
    .order("updated_at", { ascending: false })
    .limit(1)
    .single();
  return data as unknown as Movie | null;
}

// Banner uchun featured filmlar
export async function getFeaturedMovies(): Promise<Movie[]> {
  const supabase = await createClient();
  // Avval is_featured=true filmlarni qidirish
  const { data: featured } = await supabase
    .from("movies")
    .select(movieSelect())
    .eq("is_featured", true)
    .eq("is_published", true)
    .not("poster_url", "is", null)
    .neq("poster_url", "")
    .order("created_at", { ascending: false })
    .limit(6);

  if (featured && featured.length >= 3) {
    return featured as unknown as Movie[];
  }

  // Yetarli bo'lmasa — eng yangi va posteri bor filmlar
  const { data: newest } = await supabase
    .from("movies")
    .select(movieSelect())
    .eq("is_published", true)
    .not("poster_url", "is", null)
    .neq("poster_url", "")
    .order("created_at", { ascending: false })
    .limit(6);

  return (newest as unknown as Movie[]) || [];
}

// O'n yillik bo'yicha filmlar
export async function getMoviesByDecade(decade: string, limit = 12): Promise<Movie[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("movies")
    .select(movieSelect())
    .eq("decade", decade)
    .eq("is_published", true)
    .order("views", { ascending: false })
    .limit(limit);
  return (data as unknown as Movie[]) || [];
}

// Eng ko'p ko'rilganlar
export async function getTopMovies(limit = 10): Promise<Movie[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("movies")
    .select(movieSelect())
    .eq("is_published", true)
    .order("views", { ascending: false })
    .limit(limit);
  return (data as unknown as Movie[]) || [];
}

// Yangi qo'shilganlar
export async function getNewlyAdded(limit = 12): Promise<Movie[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("movies")
    .select(movieSelect())
    .eq("is_published", true)
    .not("poster_url", "is", null)
    .neq("poster_url", "")
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data as unknown as Movie[]) || [];
}

// O'xshash filmlar
export async function getSimilarMovies(movieId: string, genreIds: string[], limit = 6): Promise<Movie[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("movies")
    .select(movieSelect())
    .eq("is_published", true)
    .neq("id", movieId)
    .limit(limit);
  return (data as unknown as Movie[]) || [];
}

// Qidiruv
export async function searchMovies(query: string, limit = 20): Promise<SearchResult> {
  const supabase = await createClient();
  const { data, count } = await supabase
    .from("movies")
    .select(movieSelect(), { count: "exact" })
    .eq("is_published", true)
    .or(
      `title_uz.ilike.%${query}%,title_ru.ilike.%${query}%,title_en.ilike.%${query}%,director.ilike.%${query}%,actors.cs.{${query}}`
    )
    .limit(limit);

  const supabaseMovies = (data as unknown as Movie[]) || [];

  return {
    movies: supabaseMovies,
    total:  count || 0,
    query,
  };
}
export async function incrementViews(movieId: string) {
  const supabase = await createClient();
  await supabase.rpc("increment_views", { movie_id: movieId });
}
