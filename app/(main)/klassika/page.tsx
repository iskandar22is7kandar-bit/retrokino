import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import MovieCard from "@/components/movie/MovieCard";
import type { Movie } from "@/types";

export const metadata: Metadata = {
  title: "Klassika Arxivi",
  description: "Kino tarixining unutilmas durdonalari — klassik filmlar to'plami",
};

export const revalidate = 3600;

export default async function KlassikaPage() {
  const supabase = await createClient();

  // Klassika arxivi — past views, yuqori reyting
  const { data } = await supabase
    .from("movies")
    .select(`
      id, slug, title_uz, title_ru, title_en, poster_url,
      year, decade, duration, type, rating_avg, views,
      quality, language, country, director, actors, is_published,
      is_featured, is_daily_gem, description_uz, description_ru,
      description_en, backdrop_url, trailer_url, category_id,
      created_at, updated_at, rating_count
    `)
    .eq("is_published", true)
    .gte("year", 1950)
    .lte("year", 2000)
    .order("rating_avg", { ascending: false })
    .limit(48);

  const movies = (data as unknown as Movie[]) || [];

  return (
    <div className="min-h-screen pt-20">
      {/* Header */}
      <div className="bg-[#1a1a1a] border-b border-[#764838] py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-px h-8 bg-[#764838]/20" />
            <div>
              <h1 className="text-vhs text-[#764838] tracking-widest text-2xl">KLASSIKA ARXIVI</h1>
              <p className="text-[0.75rem] text-[#764838] mt-1">
                Kino tarixidagi muhim, ammo bugungi kunda kam eslanadigan asarlar to'plami
              </p>
            </div>
          </div>

          {/* Dekor */}
        </div>
      </div>

      {/* Filmlar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="movie-grid">
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} showType />
          ))}
        </div>

        {movies.length === 0 && (
          <div className="text-center py-20">
            <p className="text-vhs text-[0.65rem] text-[#764838] tracking-widest">
              KLASSIKA ARXIVI TO'LDIRILMOQDA...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
