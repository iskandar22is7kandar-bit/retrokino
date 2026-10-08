"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SlidersHorizontal, X, ChevronLeft, Home } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import MovieCard, { MovieCardSkeleton } from "@/components/movie/MovieCard";
import CategorySelectPage from "@/components/movie/CategorySelectPage";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import type { Movie, FilterParams } from "@/types";

const SORT_OPTIONS = [
  { value: "views",     label: "Ko'rishlar" },
  { value: "rating",    label: "Reyting" },
  { value: "year",      label: "Yil" },
  { value: "alpha",     label: "Alifbo" },
  { value: "forgotten", label: "Eng unutilgan" },
];

const GENRES = [
  { value: "",           label: "Barchasi" },
  { value: "boevik",     label: "Boevik" },
  { value: "drama",      label: "Drama" },
  { value: "komediya",   label: "Komediya" },
  { value: "fantastika", label: "Fantastika" },
  { value: "uzhastik",   label: "Uzhastik" },
  { value: "multfilm",   label: "Multfilm" },
  { value: "melodrama",  label: "Melodrama" },
  { value: "tarixiy",    label: "Tarixiy" },
];

const CATEGORY_LABELS: Record<string, string> = {
  national:     "Milliy",
  foreign:      "Xorijiy",
  "serial-nat": "Milliy",
  "serial-for": "Xorijiy",
  "multi-uz":   "Milliy",
  "multi-eu":   "Xorijiy",
  "retro-uz":   "Milliy retro",
  "retro-eu":   "Yevropa retro",
  "":           "Barchasi",
};

const PAGE_SIZE = 24;

export default function FilmsPageClient({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) {
  const router = useRouter();

  // Agar URL da category bo'lsa — to'g'ridan to'g'ri grid, aks holda tanlash ekrani
  const initialCategory = searchParams.category ?? null;

  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory);
  const [movies,     setMovies]     = useState<Movie[]>([]);
  const [total,      setTotal]      = useState(0);
  const [isLoading,  setIsLoading]  = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [page,       setPage]       = useState(1);

  const [filters, setFilters] = useState<FilterParams>({
    type:     "film",
    category: searchParams.category || "",
    genre:    searchParams.genre    || "",
    sort:     (searchParams.sort as FilterParams["sort"]) || "views",
    page:     1,
    limit:    PAGE_SIZE,
  });

  const supabase = useMemo(() => createClient(), []);

  const fetchMovies = useCallback(async (f: FilterParams, p: number) => {
    setIsLoading(true);
    try {
      let query = supabase
        .from("movies")
        .select(
          `id, slug, title_uz, title_ru, title_en,
           poster_url, year, decade, duration, type,
           rating_avg, rating_count, views, quality, language,
           country, director, actors, is_published,
           description_uz, description_ru, description_en,
           backdrop_url, trailer_url, is_featured, is_daily_gem,
           category_id, created_at, updated_at`,
          { count: "exact" }
        )
        .eq("is_published", true)
        .eq("type", "film");

      if (f.category) {
        const { data: cat } = await supabase
          .from("categories")
          .select("id")
          .eq("slug", f.category)
          .maybeSingle();

        if (cat?.id) {
          query = query.eq("category_id", cat.id);
        } else {
          const { data: catLike } = await supabase
            .from("categories")
            .select("id")
            .ilike("slug", `%${f.category}%`)
            .eq("type", "film")
            .maybeSingle();
          if (catLike?.id) query = query.eq("category_id", catLike.id);
        }
      }

      if (f.genre) {
        const { data: genreRow } = await supabase
          .from("genres")
          .select("id")
          .eq("slug", f.genre)
          .maybeSingle();
        if (genreRow?.id) {
          const { data: links } = await supabase
            .from("movie_genres")
            .select("movie_id")
            .eq("genre_id", genreRow.id);
          const ids = (links || []).map((l) => l.movie_id);
          if (ids.length === 0) { setMovies([]); setTotal(0); setIsLoading(false); return; }
          query = query.in("id", ids);
        }
      }

      switch (f.sort) {
        case "rating":    query = query.order("rating_avg",  { ascending: false }); break;
        case "year":      query = query.order("year",        { ascending: false }); break;
        case "alpha":     query = query.order("title_uz",    { ascending: true  }); break;
        case "forgotten": query = query.order("views",       { ascending: true  }); break;
        default:          query = query.order("views",       { ascending: false }); break;
      }

      const from = (p - 1) * PAGE_SIZE;
      query = query.range(from, from + PAGE_SIZE - 1);

      const { data, count, error } = await query;
      if (!error) {
        setMovies((data as unknown as Movie[]) || []);
        setTotal(count || 0);
      }
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  // Kategoriya tanlangandan keyin fetch
  useEffect(() => {
    if (selectedCategory !== null) {
      fetchMovies(filters, page);
    }
  }, [filters, page, selectedCategory, fetchMovies]);

  // URL sync
  useEffect(() => {
    if (selectedCategory === null) return;
    const params = new URLSearchParams();
    if (filters.category) params.set("category", filters.category);
    if (filters.genre)    params.set("genre",    filters.genre);
    if (filters.sort && filters.sort !== "views") params.set("sort", filters.sort);
    const qs = params.toString();
    router.replace(qs ? `/films?${qs}` : "/films", { scroll: false });
  }, [filters, selectedCategory, router]);

  const updateFilter = (key: keyof FilterParams, value: string | undefined) => {
    setFilters((prev) => ({ ...prev, [key]: value || undefined }));
    setPage(1);
  };

  // Kategoriya tanlash
  const handleSelectCategory = (cat: string) => {
    setSelectedCategory(cat);
    setFilters((prev) => ({ ...prev, category: cat }));
    setPage(1);
  };

  // Orqaga qaytish
  const handleBack = () => {
    setSelectedCategory(null);
    setMovies([]);
    setTotal(0);
    setFilters((prev) => ({ ...prev, category: "", genre: "" }));
    setPage(1);
    router.replace("/films", { scroll: false });
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  // ── TANLASH EKRANI ──
  if (selectedCategory === null) {
    return <CategorySelectPage type="film" onSelect={handleSelectCategory} />;
  }

  // ── FILMLAR GRID ──
  return (
    <div className="min-h-screen pt-20">

      {/* Sarlavha paneli */}
      <div style={{ background: "#1a1a1a", borderBottom: "1px solid #764838" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">

            {/* Chap: breadcrumb */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* Orqaga — kategoriya tanlashga */}
              <button
                onClick={handleBack}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[0.78rem] font-medium transition-all"
                style={{
                  background: "rgba(217,164,65,0.08)",
                  border: "1px solid rgba(217,164,65,0.2)",
                  color: "#D9A441",
                }}
              >
                <ChevronLeft size={13} />
                Kategoriyalar
              </button>

              <span style={{ color: "#764838", opacity: 0.3 }}>/</span>

              <Link href="/" className="flex items-center gap-1.5 text-[0.78rem]" style={{ color: "#764838" }}>
                <Home size={13} /> Bosh sahifa
              </Link>

              <span style={{ color: "#764838", opacity: 0.3 }}>/</span>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-display font-semibold" style={{ fontSize: "1.1rem", color: "#764838" }}>
                    Filmlar
                  </h1>
                  {filters.category && (
                    <span
                      className="text-vhs text-[0.55rem] tracking-wider px-2 py-0.5"
                      style={{
                        background: filters.category === "national"
                          ? "rgba(212,168,42,0.12)"
                          : "rgba(232,52,28,0.12)",
                        border: `1px solid ${filters.category === "national" ? "rgba(212,168,42,0.3)" : "rgba(232,52,28,0.3)"}`,
                        color: filters.category === "national" ? "#d4a82a" : "#e8341c",
                      }}
                    >
                      {CATEGORY_LABELS[filters.category] || filters.category}
                    </span>
                  )}
                </div>
                <p className="text-[0.72rem] mt-0.5" style={{ color: "#764838", fontFamily: "var(--font-body)" }}>
                  {total > 0 ? `${total} ta film topildi` : "Yuklanmoqda..."}
                </p>
              </div>
            </div>

            {/* O'ng: Filtr tugmasi */}
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className={cn("btn-retro flex items-center gap-2 text-[0.6rem]", filterOpen && "btn-retro-filled")}
            >
              <SlidersHorizontal size={12} />
              Filtr
            </button>
          </div>
        </div>
      </div>

      {/* Filtr paneli */}
      <AnimatePresence>
        {filterOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ background: "#1e1e1e", borderBottom: "1px solid #764838", overflow: "hidden" }}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* Janr */}
                <div>
                  <p className="text-vhs text-[0.52rem] tracking-widest mb-3" style={{ color: "#764838" }}>
                    JANR
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {GENRES.map((g) => (
                      <button
                        key={g.value}
                        onClick={() => updateFilter("genre", g.value)}
                        className="badge-retro cursor-pointer transition-all"
                        style={
                          (filters.genre || "") === g.value
                            ? { background: "#d4a82a", color: "#764838", borderColor: "#d4a82a" }
                            : {}
                        }
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Saralash */}
                <div>
                  <p className="text-vhs text-[0.52rem] tracking-widest mb-3" style={{ color: "#764838" }}>
                    SARALASH
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {SORT_OPTIONS.map((s) => (
                      <button
                        key={s.value}
                        onClick={() => updateFilter("sort", s.value)}
                        className="badge-retro cursor-pointer transition-all"
                        style={
                          filters.sort === s.value
                            ? { background: "#d4a82a", color: "#764838", borderColor: "#d4a82a" }
                            : {}
                        }
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reset */}
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setFilters((prev) => ({ ...prev, genre: "", sort: "views" }));
                      setPage(1);
                    }}
                    className="btn-retro flex items-center gap-1.5 text-[0.58rem]"
                  >
                    <X size={10} /> Tozalash
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Film grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {isLoading ? (
          <div className="movie-grid">
            {Array.from({ length: 12 }).map((_, i) => <MovieCardSkeleton key={i} />)}
          </div>
        ) : movies.length === 0 ? (
          <div
            className="text-center py-20"
            style={{ background: "#1e1e1e", border: "1px solid #764838" }}
          >
            <p className="text-vhs text-[0.62rem] tracking-widest" style={{ color: "#764838" }}>
              FILTR NATIJASI BO&apos;SH
            </p>
            <p className="text-[0.75rem] mt-2" style={{ color: "#764838", fontFamily: "var(--font-body)" }}>
              Boshqa filtr parametrlarini sinab ko&apos;ring
            </p>
          </div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.04 } }, hidden: {} }}
            className="movie-grid"
          >
            {movies.map((movie) => (
              <motion.div
                key={movie.id}
                variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35 } } }}
              >
                <MovieCard movie={movie} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn-retro text-[0.58rem] py-1.5 px-3 disabled:opacity-30"
            >
              ← Oldingi
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className="w-8 h-8 text-vhs text-[0.58rem] transition-all"
                    style={{
                      background:   p === page ? "#d4a82a" : "transparent",
                      color:        p === page ? "#764838" : "#764838",
                      border:       `1px solid ${p === page ? "#d4a82a" : "#764838"}`,
                    }}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="btn-retro text-[0.58rem] py-1.5 px-3 disabled:opacity-30"
            >
              Keyingi →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
