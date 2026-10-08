"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export const GENRES = [
  { slug: "",           label: "Barchasi",  icon: "🎬" },
  { slug: "drama",      label: "Drama",     icon: "🎭" },
  { slug: "komediya",   label: "Komediya",  icon: "😄" },
  { slug: "boevik",     label: "Jangari",   icon: "💥" },
  { slug: "fantastika", label: "Fantastika",icon: "🚀" },
  { slug: "uzhastik",   label: "Qo'rqinch", icon: "👻" },
  { slug: "melodrama",  label: "Romantika", icon: "❤️" },
  { slug: "tarixiy",    label: "Tarixiy",   icon: "⚔️" },
  { slug: "klassika",   label: "Klassika",  icon: "🎞️" },
];

export default function GenreGrid() {
  const [active, setActive] = useState("");
  const router = useRouter();

  const handleSelect = (slug: string) => {
    setActive(slug);
    router.push(slug ? `/films?genre=${slug}` : "/films");
  };

  return (
    <section className="py-10">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">

        {/* Sarlavha */}
        <div className="flex items-center gap-3 mb-6">
          <h2 className="section-title">Janrlar bo&apos;yicha</h2>
        </div>

        {/* Pill tugmalar — horizontal scroll mobilda */}
        <div
          className="flex items-center gap-2 overflow-x-auto pb-2"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {GENRES.map((genre) => {
            const isActive = active === genre.slug;
            return (
              <button
                key={genre.slug}
                onClick={() => handleSelect(genre.slug)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full text-[0.82rem] font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0"
                style={{
                  background: isActive
                    ? "rgba(217,164,65,0.15)"
                    : "rgba(0,0,0,0.04)",
                  border: isActive
                    ? "1px solid rgba(217,164,65,0.4)"
                    : "1px solid rgba(0,0,0,0.1)",
                  color: isActive ? "#D9A441" : "#764838",
                  transform: isActive ? "translateY(-1px)" : "none",
                  boxShadow: isActive ? "0 4px 16px rgba(217,164,65,0.15)" : "none",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    const el = e.currentTarget as HTMLElement;
                    el.style.background = "rgba(0,0,0,0.07)";
                    el.style.color = "#764838";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    const el = e.currentTarget as HTMLElement;
                    el.style.background = "rgba(0,0,0,0.04)";
                    el.style.color = "#764838";
                  }
                }}
              >
                <span className="text-base leading-none" style={{ filter: isActive ? "none" : "grayscale(0.5)" }}>
                  {genre.icon}
                </span>
                {genre.label}
              </button>
            );
          })}
        </div>

        {/* Chiziq */}
        <div className="mt-6 divider-gold" />
      </div>
    </section>
  );
}
