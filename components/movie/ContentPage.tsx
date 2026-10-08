"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SlidersHorizontal, X, ChevronLeft, Home } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import MovieCard, { MovieCardSkeleton } from "./MovieCard";
import CategorySelectPage from "./CategorySelectPage";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import type { Movie, ContentType } from "@/types";

const SORT_OPTIONS = [
  { value: "views",     label: "Ko'rishlar" },
  { value: "rating",    label: "Reyting" },
  { value: "year",      label: "Yil" },
  { value: "forgotten", label: "Eng unutilgan" },
];

const CATEGORY_LABELS: Record<string, string> = {
  national:   "Milliy",
  foreign:    "Xorijiy",
  "serial-nat": "Milliy",
  "serial-for": "Xorijiy",
  "multi-uz": "Milliy",
  "multi-eu": "Xorijiy",
  "retro-uz": "Milliy retro",
  "retro-eu": "Yevropa retro",
  "":         "Barchasi",
};

const PAGE_SIZE = 24;

interface ContentPageProps {
  type: ContentType;
  title: string;
  searchParams: Record<string, string>;
}

export default function ContentPage({ type, title, searchParams }: ContentPageProps) {
  const router = useRouter();

  const initialCategory = searchParams.category ?? null;

  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory);
  const [movies,     setMovies]     = useState<Movie[]>([]);
  const [total,      setTotal]      = useState(0);
  const [isLoading,  setIsLoading]  = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [category,   setCategory]   = useState(searchParams.category || "");
  const [sort,       setSort]       = useState(searchParams.sort || "views");
  const [page,       setPage]       = useState(1);

  const supabase = useMemo(() => createClient(), []);

  const fetchMovies = useCallback(async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from("movies")
        .select(
          `id, slug, title_uz, title_ru, title_en, poster_url,
           year, decade, duration, type, rating_avg, views, quality,
           language, country, director, actors, is_published,
           is_featured, is_daily_gem, description_uz, description_ru,
           description_en, backdrop_url, trailer_url, category_id,
           created_at, updated_at, rating_count`,
          { count: "exact" }
        )
        .eq("is_published", true)
        .eq("type", type);

      if (category) {
        // Avval aniq slug bilan qidirish
        const { data: cat } = await supabase
          .from("categories")
          .select("id")
          .eq("slug", category)
          .maybeSingle();

        if (cat?.id) {
          query = query.eq("category_id", cat.id);
        }
        // Agar kategoriya topilmasa — type bo'yicha barcha filmlar ko'rsatiladi
      }

      switch (sort) {
        case "rating":    query = query.order("rating_avg", { ascending: false }); break;
        case "year":      query = query.order("year",       { ascending: false }); break;
        case "forgotten": query = query.order("views",      { ascending: true  }); break;
        default:          query = query.order("views",      { ascending: false }); break;
      }

      const from = (page - 1) * PAGE_SIZE;
      query = query.range(from, from + PAGE_SIZE - 1);

      const { data, count, error } = await query;
      if (!error) {
        setMovies((data as unknown as Movie[]) || []);
        setTotal(count || 0);
      }
    } finally {
      setIsLoading(false);
    }
  }, [type, category, sort, page, supabase]);

  useEffect(() => {
    if (selectedCategory !== null) {
      fetchMovies();
    }
  }, [selectedCategory, fetchMovies]);

  const handleSelectCategory = (cat: string) => {
    setSelectedCategory(cat);
    setCategory(cat);
    setPage(1);
    const basePath = type === "serial" ? "/serials" : type === "cartoon" ? "/cartoons" : "/films";
    router.replace(cat ? `${basePath}?category=${cat}` : basePath, { scroll: false });
  };

  const handleBack = () => {
    setSelectedCategory(null);
    setMovies([]);
    setTotal(0);
    setCategory("");
    setPage(1);
    const basePath = type === "serial" ? "/serials" : type === "cartoon" ? "/cartoons" : "/films";
    router.replace(basePath, { scroll: false });
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  // ── TANLASH EKRANI ──
  if (selectedCategory === null) {
    return <CategorySelectPage type={type} onSelect={handleSelectCategory} />;
  }

  // ── KONTENT GRID ──
  return (
    <div className="min-h-screen pt-20">

      {/* Sarlavha */}
      <div style={{ background: "#EAE0C6", borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">

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
                    {title}
                  </h1>
                  {category && (
                    <span
                      className="text-[0.65rem] font-semibold px-2 py-0.5 rounded"
                      style={{
                        background: category === "national"
                          ? "rgba(217,164,65,0.12)"
                          : "rgba(107,159,224,0.12)",
                        border: `1px solid ${category === "national"
                          ? "rgba(217,164,65,0.3)"
                          : "rgba(107,159,224,0.3)"}`,
                        color: category === "national" ? "#D9A441" : "#6B9FE0",
                      }}
                    >
                      {CATEGORY_LABELS[category] || category}
                    </span>
                  )}
                </div>
                <p className="text-[0.72rem] mt-0.5" style={{ color: "#764838", fontFamily: "var(--font-body)" }}>
                  {total > 0 ? `${total} ta kontent topildi` : "Yuklanmoqda..."}
                </p>
              </div>
            </div>

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

      {/* Filtr */}
      <AnimatePresence>
        {filterOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ background: "#E6DAC0", borderBottom: "1px solid rgba(0,0,0,0.08)", overflow: "hidden" }}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
              <div className="flex flex-wrap gap-8">
                <div>
                  <p className="text-vhs text-[0.52rem] tracking-widest mb-3" style={{ color: "#764838" }}>
                    SARALASH
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {SORT_OPTIONS.map((s) => (
                      <button
                        key={s.value}
                        onClick={() => { setSort(s.value); setPage(1); }}
                        className="badge-retro cursor-pointer transition-all"
                        style={
                          sort === s.value
                            ? { background: "#D9A441", color: "#F1E9D2", borderColor: "#D9A441" }
                            : {}
                        }
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => { setSort("views"); setPage(1); }}
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

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {isLoading ? (
          <div className="movie-grid">
            {Array.from({ length: 12 }).map((_, i) => <MovieCardSkeleton key={i} />)}
          </div>
        ) : movies.length === 0 ? (
          <div
            className="text-center py-20"
            style={{ background: "#EDE3CC", border: "1px solid rgba(0,0,0,0.08)" }}
          >
            <p className="text-vhs text-[0.62rem] tracking-widest" style={{ color: "#764838" }}>
              HOZIRCHA KONTENT YO&apos;Q
            </p>
            <p
              className="text-[0.75rem] mt-2"
              style={{ color: "#764838", fontFamily: "var(--font-body)" }}
            >
              Boshqa kategoriyani sinab ko&apos;ring
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
                variants={{
                  hidden:  { opacity: 0, y: 16 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
                }}
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
                      background:  p === page ? "#D9A441" : "transparent",
                      color:       p === page ? "#F1E9D2" : "#764838",
                      border:      `1px solid ${p === page ? "#D9A441" : "rgba(0,0,0,0.12)"}`,
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
