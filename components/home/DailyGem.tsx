"use client";

import Image from "next/image";
import Link from "next/link";
import { Play, Star, Clock, Calendar, Globe, Award } from "lucide-react";
import { motion } from "framer-motion";
import { formatDuration } from "@/lib/utils";
import type { Movie } from "@/types";

interface DailyGemProps {
  movie: Movie | null;
}

export default function DailyGem({ movie }: DailyGemProps) {
  if (!movie) return null;

  const href    = `/${movie.type === "film" ? "films" : movie.type === "serial" ? "serials" : "cartoons"}/${movie.slug}`;
  const title   = movie.title_uz || movie.title_ru;
  const desc    = movie.description_uz || movie.description_ru || "";
  const stars   = Math.round((movie.rating_avg || 0) / 2);

  return (
    <section className="py-10">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">

        {/* Sarlavha */}
        <div className="flex items-center gap-3 mb-6">
          <Award size={18} style={{ color: "#D9A441" }} />
          <h2 className="section-title" style={{ ["--tw-before-bg" as string]: "#D9A441" }}>
            Bugungi Tanlangan Film
          </h2>
          <span
            className="text-[0.65rem] font-semibold px-2 py-1 rounded tracking-wider"
            style={{
              background: "rgba(217,164,65,0.1)",
              border: "1px solid rgba(217,164,65,0.25)",
              color: "#D9A441",
            }}
          >
            EDITOR&apos;S PICK
          </span>
        </div>

        {/* KARD */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 overflow-hidden rounded-xl"
          style={{
            background: "#F1E9D2",
            border: "1px solid rgba(0,0,0,0.1)",
            boxShadow: "0 8px 48px rgba(0,0,0,0.1), 0 0 0 1px rgba(217,164,65,0.08)",
          }}
        >
          {/* POSTER */}
          <div className="relative overflow-hidden" style={{ minHeight: "320px" }}>
            {movie.poster_url ? (
              <Image
                src={movie.poster_url}
                alt={title}
                fill
                className="object-cover"
                style={{ filter: "brightness(0.9)" }}
                sizes="(max-width: 768px) 100vw, 25vw"
              />
            ) : (
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #EAE0C6, #F1E9D2)" }}
              >
                <svg width="48" height="36" viewBox="0 0 48 36" fill="none" className="opacity-15">
                  <rect x="1" y="1" width="46" height="34" rx="3" stroke="#D9A441" strokeWidth="1.5"/>
                  <circle cx="14" cy="18" r="6" stroke="#D9A441" strokeWidth="1.2"/>
                  <circle cx="34" cy="18" r="6" stroke="#D9A441" strokeWidth="1.2"/>
                  <line x1="20" y1="18" x2="28" y2="18" stroke="#D9A441" strokeWidth="1.2"/>
                </svg>
              </div>
            )}
            {/* Sag'ri gradient */}
            <div
              className="absolute inset-0 hidden md:block"
              style={{ background: "linear-gradient(90deg, transparent 60%, #F1E9D2 100%)" }}
            />
            {/* Pastki gradient (mobil) */}
            <div
              className="absolute inset-0 md:hidden"
              style={{ background: "linear-gradient(0deg, #F1E9D2 0%, transparent 50%)" }}
            />
            {/* Spotlight badge */}
            <div
              className="absolute top-4 left-4 flex items-center gap-1.5 px-2.5 py-1.5 rounded"
              style={{
                background: "rgba(217,164,65,0.9)",
                backdropFilter: "blur(4px)",
              }}
            >
              <Star size={10} fill="#F1E9D2" style={{ color: "#F1E9D2" }} />
              <span className="text-[0.65rem] font-bold tracking-wider" style={{ color: "#F1E9D2" }}>
                SPOTLIGHT
              </span>
            </div>
          </div>

          {/* MA'LUMOTLAR */}
          <div
            className="md:col-span-2 lg:col-span-3 p-6 md:p-8 lg:p-10 flex flex-col justify-between"
            style={{ background: "#F1E9D2" }}
          >
            <div>
              {/* Meta teglar */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {movie.year && (
                  <span className="flex items-center gap-1.5 text-[0.75rem]" style={{ color: "#764838" }}>
                    <Calendar size={11} /> {movie.year}
                  </span>
                )}
                {movie.duration && (
                  <>
                    <span style={{ color: "#764838" }}>•</span>
                    <span className="flex items-center gap-1.5 text-[0.75rem]" style={{ color: "#764838" }}>
                      <Clock size={11} /> {formatDuration(movie.duration)}
                    </span>
                  </>
                )}
                {movie.country && (
                  <>
                    <span style={{ color: "#764838" }}>•</span>
                    <span className="flex items-center gap-1.5 text-[0.75rem]" style={{ color: "#764838" }}>
                      <Globe size={11} /> {movie.country}
                    </span>
                  </>
                )}
              </div>

              {/* Sarlavha */}
              <h3
                className="font-display font-semibold leading-tight mb-4"
                style={{
                  fontSize: "clamp(1.3rem, 3vw, 2rem)",
                  color: "#764838",
                  letterSpacing: "0.02em",
                }}
              >
                {title}
              </h3>

              {/* Yulduzlar */}
              {movie.rating_avg > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        style={{
                          color: i < stars ? "#D9A441" : "#764838",
                          fill:  i < stars ? "#D9A441" : "none",
                          filter: i < stars ? "drop-shadow(0 0 3px rgba(217,164,65,0.4))" : "none",
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-[0.78rem] font-medium" style={{ color: "#764838" }}>
                    {movie.rating_avg.toFixed(1)}<span style={{ color: "#764838" }}>/10</span>
                  </span>
                </div>
              )}

              {/* Tavsif */}
              <p
                className="text-[0.875rem] leading-relaxed mb-6"
                style={{
                  color: "#764838",
                  display: "-webkit-box",
                  WebkitLineClamp: 4,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                } as React.CSSProperties}
              >
                {desc}
              </p>

              {/* Rejissyor */}
              {movie.director && (
                <div
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-md mb-2"
                  style={{
                    background: "rgba(217,164,65,0.06)",
                    borderLeft: "2px solid rgba(217,164,65,0.4)",
                  }}
                >
                  <span className="text-[0.72rem]" style={{ color: "#764838" }}>Rejissyor:</span>
                  <span className="text-[0.78rem] font-medium" style={{ color: "#764838" }}>{movie.director}</span>
                </div>
              )}
            </div>

            {/* Tugmalar */}
            <div className="flex items-center gap-3 mt-6 flex-wrap">
              <Link href={href} className="btn-primary">
                <Play size={14} fill="currentColor" /> Hoziroq ko&apos;rish
              </Link>
              <Link href={href} className="btn-outline">
                Batafsil ma&apos;lumot
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
