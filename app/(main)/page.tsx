import { Suspense } from "react";
import Link from "next/link";
import HeroBanner from "@/components/home/HeroBanner";
import DailyGem from "@/components/home/DailyGem";
import SectionBlock from "@/components/movie/SectionBlock";
import MovieCard from "@/components/movie/MovieCard";
import ContinueWatching from "@/components/home/ContinueWatching";
import {
  getFeaturedMovies,
  getDailyGem,
  getTopMovies,
  getNewlyAdded,
  getMovies,
} from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  /* Parallel fetch — biri muvaffaqiyatsiz bo'lsa qolganlar ishlaydi */
  const [featured, dailyGem, topMovies, newlyAdded, serialsResult] = await Promise.allSettled([
    getFeaturedMovies(),
    getDailyGem(),
    getTopMovies(12),
    getNewlyAdded(24),
    getMovies({ type: "serial", limit: 8, sort: "views" }),
  ]);

  const featuredMovies  = featured.status     === "fulfilled" ? featured.value     : [];
  const gemMovie        = dailyGem.status      === "fulfilled" ? dailyGem.value      : null;
  const topList         = topMovies.status     === "fulfilled" ? topMovies.value     : [];
  const newList         = newlyAdded.status    === "fulfilled" ? newlyAdded.value    : [];
  const serialList      = serialsResult.status === "fulfilled" ? (serialsResult.value?.movies ?? []) : [];

  return (
    <div>
      {/* HERO */}
      <HeroBanner movies={featuredMovies} />

      {/* DAVOM ETTIRISH — auth bo'lsa chiqadi */}
      <Suspense fallback={null}>
        <ContinueWatching />
      </Suspense>

      {/* YANGI QO'SHILGANLAR */}
      {newList.length > 0 ? (
        <SectionBlock
          title="Yangi Qo'shilganlar"
          icon="🎬"
          subtitle="Eng so'nggi qo'shilgan filmlar va seriallar"
          movies={newList}
          viewAllHref="/films"
          skeletonCount={6}
        />
      ) : (
        /* Ma'lumot yo'q bo'lsa skeleton ko'rsatamiz */
        <SectionBlock
          title="Yangi Qo'shilganlar"
          icon="🎬"
          movies={[]}
          isLoading={true}
          skeletonCount={6}
        />
      )}

      {/* BUGUNGI TANLANGAN */}
      <DailyGem movie={gemMovie} />

      {/* ENG KO'P KO'RILGANLAR */}
      {topList.length > 0 ? (
        <section className="py-10" style={{ background: "#EAE0C6" }}>
          <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="section-title">
                <span className="mr-2">🔥</span> Eng Ko&apos;p Ko&apos;rilganlar
              </h2>
              <Link
                href="/films"
                className="text-[0.82rem] transition-colors"
                style={{ color: "#764838" }}
              >
                Barchasi →
              </Link>
            </div>
            <div className="movie-grid">
              {topList.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          </div>
        </section>
      ) : (
        <SectionBlock
          title="Eng Ko'p Ko'rilganlar"
          icon="🔥"
          movies={[]}
          isLoading={true}
          className="bg-cinema-900"
          skeletonCount={6}
        />
      )}

      {/* SERIALLAR */}
      {serialList.length > 0 && (
        <SectionBlock
          title="Seriallar"
          icon="📺"
          subtitle="Davom etayotgan va yangi seriallar"
          movies={serialList}
          viewAllHref="/serials"
          skeletonCount={4}
        />
      )}

      {/* KLASSIK FILMLAR SECTION */}
      <ClassicFilmsBanner />
    </div>
  );
}

/* Klassik filmlar dekor banner */
function ClassicFilmsBanner() {
  return (
    <section className="py-16" style={{ background: "#EAE0C6" }}>
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <div
          className="relative overflow-hidden rounded-2xl"
          style={{
            background: "linear-gradient(135deg, #EDE3CC 0%, #E8DCB8 50%, #EDE3CC 100%)",
            border: "1px solid rgba(217,164,65,0.2)",
            padding: "clamp(2rem, 5vw, 4rem)",
          }}
        >
          {/* Dekor — plyonka teshiklari */}
          <div className="absolute top-0 bottom-0 left-0 w-10 flex flex-col justify-between py-4 opacity-15">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="mx-auto w-4 h-3 rounded-sm" style={{ background: "rgba(217,164,65,0.8)" }} />
            ))}
          </div>
          <div className="absolute top-0 bottom-0 right-0 w-10 flex flex-col justify-between py-4 opacity-15">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="mx-auto w-4 h-3 rounded-sm" style={{ background: "rgba(217,164,65,0.8)" }} />
            ))}
          </div>

          {/* Proyektor nuri effekti */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-1/2 opacity-5"
            style={{ background: "conic-gradient(from 180deg at 50% 0%, rgba(217,164,65,0.6) 0deg, transparent 60deg, transparent 300deg, rgba(217,164,65,0.6) 360deg)" }}
          />

          {/* Kontent */}
          <div className="relative text-center max-w-xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, transparent, rgba(217,164,65,0.4))" }} />
              <span className="text-[0.7rem] font-semibold tracking-[0.2em] px-3" style={{ color: "#D9A441" }}>KLASSIK KINO</span>
              <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, rgba(217,164,65,0.4), transparent)" }} />
            </div>

            <h2
              className="font-display font-semibold mb-3"
              style={{
                fontSize: "clamp(1.4rem, 3vw, 2rem)",
                color: "#764838",
                letterSpacing: "0.04em",
              }}
            >
              🎞 Klassik Filmlar Arxivi
            </h2>
            <p className="text-[0.875rem] leading-relaxed mb-6" style={{ color: "#764838" }}>
              O&apos;tgan asrning eng mashhur asarlari — yangilangan sifatda. <br />
              Hammasini bir joyda tomosha qiling.
            </p>
            <a
              href="/klassika"
              className="btn-primary inline-flex"
              style={{ margin: "0 auto" }}
            >
              Arxivni ko&apos;rish
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
