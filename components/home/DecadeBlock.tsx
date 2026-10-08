"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn, getDecadeLabel } from "@/lib/utils";
import MovieCard from "@/components/movie/MovieCard";
import type { Movie, Decade } from "@/types";

interface DecadeMovies {
  decade: Decade;
  movies: Movie[];
}
interface DecadeBlockProps {
  decadeData: DecadeMovies[];
}

const DECADES: Decade[] = ["1960s", "1970s", "1980s", "1990s", "2000s", "2010s"];

const DECADE_COLORS: Record<Decade, { active: string; glow: string }> = {
  "1960s": { active: "#a07c1e", glow: "rgba(160,124,30,0.35)" },
  "1970s": { active: "#b8922a", glow: "rgba(184,146,42,0.35)" },
  "1980s": { active: "#d4a82a", glow: "rgba(212,168,42,0.4)"  },
  "1990s": { active: "#e8341c", glow: "rgba(232,52,28,0.35)"  },
  "2000s": { active: "#8a9ab8", glow: "rgba(138,154,184,0.3)" },
  "2010s": { active: "#6aa5ff", glow: "rgba(106,165,255,0.3)" },
};

export default function DecadeBlock({ decadeData }: DecadeBlockProps) {
  const [activeDecade, setActiveDecade] = useState<Decade>("1980s");

  const currentMovies =
    decadeData.find((d) => d.decade === activeDecade)?.movies || [];

  return (
    <section className="py-12" style={{ background: "#EAE0C6" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* SARLAVHA */}
        <div className="mb-2">
          <div className="flex items-center gap-3 mb-1">
            <span
              className="text-vhs text-[0.5rem] tracking-widest px-2 py-1"
              style={{ color: "#764838", border: "1px solid rgba(0,0,0,0.12)", background: "#DDD0A5" }}
            >
              NOSTALJI
            </span>
            <h2 className="text-vhs tracking-wider" style={{ color: "#764838" }}>
              O&apos;SHA YILLARNI ESLAYSIZMI?
            </h2>
          </div>
          <p className="text-[0.75rem]" style={{ color: "#764838", fontFamily: "var(--font-body)" }}>
            O&apos;n yillik bo&apos;yicha retro va klassik filmlar
          </p>
        </div>

        {/* Sarlavha chiziq */}
        <div className="mb-7" style={{
          height: "1px",
          background: "linear-gradient(90deg, #e8341c, #d4a82a 40%, transparent)",
        }} />

        {/* DECADE TABLAR */}
        <div className="flex items-stretch gap-0 mb-8 overflow-x-auto pb-1">
          {DECADES.map((decade, idx) => {
            const isActive  = activeDecade === decade;
            const hasMovies = decadeData.some((d) => d.decade === decade && d.movies.length > 0);
            const colors    = DECADE_COLORS[decade];

            return (
              <button
                key={decade}
                onClick={() => hasMovies && setActiveDecade(decade)}
                disabled={!hasMovies}
                aria-pressed={isActive}
                className="relative flex-shrink-0 px-5 py-3 text-vhs text-[0.62rem] tracking-widest uppercase transition-all duration-200"
                style={{
                  background:   isActive ? colors.active : "#DDD0A5",
                  color:        isActive ? "#F1E9D2"     : hasMovies ? "#764838" : "#764838",
                  border:       "1px solid",
                  borderColor:  isActive ? colors.active : "rgba(0,0,0,0.12)",
                  borderRight:  idx < DECADES.length - 1 ? "none" : "1px solid",
                  borderRightColor: isActive ? colors.active : "rgba(0,0,0,0.12)",
                  cursor:       hasMovies ? "pointer" : "not-allowed",
                  boxShadow:    isActive ? `0 0 18px ${colors.glow}` : "none",
                  opacity:      !hasMovies ? 0.35 : 1,
                }}
              >
                {getDecadeLabel(decade)}
                {isActive && (
                  <span
                    className="absolute bottom-0 left-0 right-0 h-[2px]"
                    style={{ background: "rgba(255,255,255,0.25)" }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* FILMLAR */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeDecade}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
          >
            {currentMovies.length > 0 ? (
              <div className="movie-grid">
                {currentMovies.map((movie, i) => (
                  <motion.div
                    key={movie.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.3 }}
                  >
                    <MovieCard movie={movie} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div
                className="text-center py-14"
                style={{ background: "#EDE3CC", border: "1px solid rgba(0,0,0,0.08)" }}
              >
                <p className="text-vhs text-[0.6rem] tracking-widest" style={{ color: "#764838" }}>
                  {getDecadeLabel(activeDecade).toUpperCase()} — KONTENT YO&apos;Q
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

      </div>
    </section>
  );
}
