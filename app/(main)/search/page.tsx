"use client";

import { Suspense, useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, Home, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import MovieCard, { MovieCardSkeleton } from "@/components/movie/MovieCard";
import type { Movie } from "@/types";

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-20" />}>
      <SearchPageClient />
    </Suspense>
  );
}

function SearchPageClient() {
  const sp           = useSearchParams();
  const router       = useRouter();
  const initialQuery = sp.get("q") || "";

  const [query,     setQuery]     = useState(initialQuery);
  const [results,   setResults]   = useState<Movie[]>([]);
  const [total,     setTotal]     = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const supabase    = createClient();

  useEffect(() => {
    if (initialQuery) doSearch(initialQuery);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); setTotal(0); return; }
    setIsLoading(true);
    const { data, count } = await supabase
      .from("movies")
      .select(`
        id, slug, title_uz, title_ru, title_en,
        poster_url, year, decade, duration, type,
        rating_avg, views, quality, language, country,
        director, actors, is_published, is_featured, is_daily_gem,
        description_uz, description_ru, description_en,
        backdrop_url, trailer_url, category_id, created_at, updated_at,
        rating_count
      `, { count: "exact" })
      .eq("is_published", true)
      .or(`title_uz.ilike.%${q}%,title_ru.ilike.%${q}%,title_en.ilike.%${q}%,director.ilike.%${q}%`)
      .order("views", { ascending: false })
      .limit(48);
    setResults((data as unknown as Movie[]) || []);
    setTotal(count || 0);
    setIsLoading(false);
  }, [supabase]);

  const handleQueryChange = (val: string) => {
    setQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      doSearch(val);
      if (val.trim()) {
        router.replace(`/search?q=${encodeURIComponent(val.trim())}`, { scroll: false });
      }
    }, 400);
  };

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6">
          <Link
            href="/"
            className="breadcrumb-btn flex items-center gap-2 px-4 py-2 text-[0.82rem] font-medium"
            style={{
              background: "rgba(217,164,65,0.08)",
              border: "1px solid rgba(217,164,65,0.25)",
              borderRadius: "10px",
              color: "#D9A441",
            }}
          >
            <Home size={14} /> Bosh sahifa
          </Link>
          <ChevronRight size={14} style={{ color: "#764838", opacity: 0.4 }} />
          <span className="text-[0.82rem]" style={{ color: "#764838", opacity: 0.6 }}>
            Qidiruv
          </span>
        </div>

        {/* Natija soni */}
        {query && (
          <div className="mb-6">
            <span className="text-vhs text-[0.6rem] text-[#764838] tracking-wider">
              &ldquo;{query}&rdquo; — {isLoading ? "qidirilmoqda..." : `${total} ta natija`}
            </span>
          </div>
        )}

        {/* Bo'sh holat */}
        {!query && (
          <div className="text-center py-20">
            <Search size={32} className="mx-auto mb-4" style={{ color: "#764838" }} />
            <p className="text-vhs text-[0.7rem] text-[#764838] tracking-widest">
              QIDIRUV SO&apos;ZINI KIRITING
            </p>
          </div>
        )}

        {/* Yuklanmoqda */}
        {isLoading ? (
          <div className="movie-grid">
            {Array.from({ length: 12 }).map((_, i) => <MovieCardSkeleton key={i} />)}
          </div>
        ) : results.length > 0 ? (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.04 } }, hidden: {} }}
            className="movie-grid"
          >
            {results.map((movie) => (
              <motion.div
                key={movie.id}
                variants={{ hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1 } }}
              >
                <MovieCard movie={movie} showType />
              </motion.div>
            ))}
          </motion.div>
        ) : query && !isLoading ? (
          <div className="text-center py-20">
            <p className="text-vhs text-[0.65rem] text-[#764838] tracking-widest mb-2">
              NATIJA TOPILMADI
            </p>
            <p className="text-[0.75rem] text-[#764838]">
              Boshqa kalit so&apos;z bilan qidiring
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
