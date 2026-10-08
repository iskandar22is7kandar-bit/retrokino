"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import MovieCard, { MovieCardSkeleton } from "./MovieCard";
import type { Movie } from "@/types";

interface SectionBlockProps {
  title: string;
  icon?: string;
  subtitle?: string;
  movies: Movie[];
  viewAllHref?: string;
  isLoading?: boolean;
  className?: string;
  tapeLabel?: string;
  accent?: "gold" | "red";
  skeletonCount?: number;
}

export default function SectionBlock({
  title,
  icon,
  subtitle,
  movies,
  viewAllHref,
  isLoading = false,
  className,
  skeletonCount = 6,
}: SectionBlockProps) {

  const showSkeletons = isLoading;
  const hasContent    = !isLoading && movies.length > 0;
  const isEmpty       = !isLoading && movies.length === 0;

  return (
    <section className={cn("py-10", className)}>
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">

        {/* SARLAVHA */}
        <div className="flex items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-3">
            {icon && <span className="text-xl">{icon}</span>}
            <div>
              <h2 className="section-title">{title}</h2>
              {subtitle && (
                <p className="text-[0.8rem] mt-1" style={{ color: "#764838" }}>{subtitle}</p>
              )}
            </div>
          </div>

          {viewAllHref && hasContent && (
            <Link
              href={viewAllHref}
              className="flex items-center gap-1.5 text-[0.82rem] font-medium transition-all duration-200 group flex-shrink-0"
              style={{ color: "#764838" }}
              onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = "#D9A441"}
              onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = "#764838"}
            >
              Barchasi
              <ChevronRight size={14} className="transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          )}
        </div>

        {/* GRID */}
        {showSkeletons && (
          <div className="movie-grid">
            {Array.from({ length: skeletonCount }).map((_, i) => (
              <MovieCardSkeleton key={i} />
            ))}
          </div>
        )}

        {hasContent && (
          <div className="movie-grid">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}

        {isEmpty && null /* Katta bo'sh blok ko'rsatmaymiz */}
      </div>
    </section>
  );
}
