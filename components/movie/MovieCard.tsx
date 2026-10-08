"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Star, Play, Eye, Clock } from "lucide-react";
import { cn, formatDuration, formatViews, normalizeRating } from "@/lib/utils";
import type { Movie } from "@/types";

interface MovieCardProps {
  movie: Movie;
  lang?: "uz" | "ru" | "en";
  className?: string;
  showType?: boolean;
}

const TYPE_LABELS: Record<string, string> = { film: "Film", serial: "Serial", cartoon: "Multfilm" };

export default function MovieCard({ movie, lang = "uz", className, showType = false }: MovieCardProps) {
  const [imgError,  setImgError]  = useState(false);
  const [hovered,   setHovered]   = useState(false);

  const title = lang === "ru" ? movie.title_ru : lang === "en" ? (movie.title_en || movie.title_uz) : movie.title_uz;
  const href  = `/${movie.type === "film" ? "films" : movie.type === "serial" ? "serials" : "cartoons"}/${movie.slug}`;
  const rating = normalizeRating(movie.rating_avg);

  return (
    <Link
      href={href}
      className={cn("block group", className)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label={title}
    >
      <div
        className="relative overflow-hidden rounded-lg transition-all duration-300"
        style={{
          background: "#f1e9d2",
          border: `1px solid ${hovered ? "rgba(217,164,65,0.3)" : "rgba(0,0,0,0.08)"}`,
          transform: hovered ? "translateY(-6px) scale(1.015)" : "translateY(0) scale(1)",
          boxShadow: hovered
            ? "0 20px 48px rgba(0,0,0,0.15), 0 0 0 1px rgba(217,164,65,0.2)"
            : "0 4px 16px rgba(0,0,0,0.08)",
        }}
      >
        {/* POSTER */}
        <div className="relative overflow-hidden" style={{ aspectRatio: "2/3" }}>
          {!imgError && movie.poster_url ? (
            <Image
              src={movie.poster_url}
              alt={title}
              fill
              sizes="(max-width: 640px) 45vw, (max-width: 1024px) 22vw, 210px"
              className="object-cover transition-transform duration-500"
              style={{ transform: hovered ? "scale(1.08)" : "scale(1)" }}
              onError={() => setImgError(true)}
            />
          ) : (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center gap-3"
              style={{ background: "linear-gradient(135deg, #e8ddb8 0%, #f1e9d2 100%)" }}
            >
              <svg width="44" height="32" viewBox="0 0 44 32" fill="none" className="opacity-20">
                <rect x="1" y="1" width="42" height="30" rx="3" stroke="#D9A441" strokeWidth="1.5"/>
                <circle cx="13" cy="16" r="5" stroke="#D9A441" strokeWidth="1.2"/>
                <circle cx="31" cy="16" r="5" stroke="#D9A441" strokeWidth="1.2"/>
                <line x1="18" y1="16" x2="26" y2="16" stroke="#D9A441" strokeWidth="1.2"/>
              </svg>
              <p className="text-[0.62rem] text-center px-3 leading-snug" style={{ color: "#764838" }}>
                {title}
              </p>
            </div>
          )}

          {/* Qorong'i overlay — hover */}
          <div
            className="absolute inset-0 transition-opacity duration-300"
            style={{
              background: "linear-gradient(to top, rgba(26,18,8,0.9) 0%, rgba(26,18,8,0.35) 40%, transparent 70%)",
              opacity: hovered ? 1 : 0.4,
            }}
          />

          {/* Play tugmasi */}
          <div
            className="absolute inset-0 flex items-center justify-center transition-all duration-300"
            style={{ opacity: hovered ? 1 : 0 }}
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center transition-transform duration-300"
              style={{
                background: "rgba(217,164,65,0.9)",
                boxShadow: "0 0 24px rgba(217,164,65,0.4)",
                transform: hovered ? "scale(1)" : "scale(0.6)",
              }}
            >
              <Play size={18} fill="#F1E9D2" style={{ color: "#F1E9D2", marginLeft: 2 }} />
            </div>
          </div>

          {/* Badges — yuqori */}
          <div className="absolute top-2.5 left-2.5 right-2.5 flex items-start justify-between">
            {/* Yil */}
            <span
              className="text-[0.62rem] font-medium px-1.5 py-0.5 rounded"
              style={{
                background: "rgba(26,18,8,0.7)",
                color: "#764838",
                backdropFilter: "blur(4px)",
              }}
            >
              {movie.year}
            </span>
            {/* Tur */}
            {showType && (
              <span
                className="text-[0.58rem] font-semibold px-1.5 py-0.5 rounded tracking-wide"
                style={{
                  background: "rgba(217,164,65,0.15)",
                  color: "#D9A441",
                  border: "1px solid rgba(217,164,65,0.3)",
                  backdropFilter: "blur(4px)",
                }}
              >
                {TYPE_LABELS[movie.type]}
              </span>
            )}
          </div>

          {/* Reyting — pastki o'ng */}
          {rating > 0 && (
            <div
              className="absolute bottom-2.5 right-2.5 flex items-center gap-1 px-2 py-1 rounded"
              style={{
                background: "rgba(26,18,8,0.75)",
                backdropFilter: "blur(4px)",
              }}
            >
              <Star size={10} fill="#D9A441" style={{ color: "#D9A441" }} />
              <span className="text-[0.65rem] font-semibold" style={{ color: "#D9A441" }}>
                {rating.toFixed(1)}
              </span>
            </div>
          )}

          {/* Hover chiziq — pastda */}
          <div
            className="absolute bottom-0 left-0 right-0 h-[2px] transition-all duration-300"
            style={{
              background: "linear-gradient(90deg, #D9A441, #F0C56A)",
              transform: hovered ? "scaleX(1)" : "scaleX(0)",
              transformOrigin: "left",
            }}
          />
        </div>

        {/* INFO */}
        <div className="px-3 pt-2.5 pb-3">
          <h3
            className="text-[0.82rem] font-medium leading-snug mb-1.5 transition-colors duration-200"
            style={{
              color: hovered ? "#D9A441" : "#764838",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            } as React.CSSProperties}
          >
            {title}
          </h3>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {movie.duration && (
                <span className="flex items-center gap-1 text-[0.7rem]" style={{ color: "#764838" }}>
                  <Clock size={10} />
                  {formatDuration(movie.duration)}
                </span>
              )}
              {movie.type === "serial" && (
                <span className="text-[0.62rem] font-medium px-1.5 py-0.5 rounded" style={{ background: "rgba(0,0,0,0.06)", color: "#764838" }}>
                Serial
              </span>
              )}
            </div>
            {movie.views > 0 && (
              <span className="flex items-center gap-1 text-[0.68rem]" style={{ color: "#764838" }}>
                <Eye size={10} />
                {formatViews(movie.views)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ── SKELETON ── */
export function MovieCardSkeleton() {
  return (
    <div className="rounded-lg overflow-hidden" style={{ border: "1px solid rgba(0,0,0,0.08)" }}>
      <div className="shimmer" style={{ aspectRatio: "2/3" }} />
      <div className="px-3 pt-2.5 pb-3 space-y-2" style={{ background: "#f1e9d2" }}>
        <div className="shimmer h-3 w-full rounded" />
        <div className="shimmer h-2.5 w-2/3 rounded" />
      </div>
    </div>
  );
}
