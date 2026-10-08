"use client";

import { Star } from "lucide-react";
import type { Movie } from "@/types";

// Auth olib tashlandi — faqat umumiy reyting ko'rsatiladi
export default function RatingWidget({ movie }: { movie: Movie }) {
  const avg   = movie.rating_avg   ?? 0;
  const count = movie.rating_count ?? 0;

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={16}
            style={{
              color: i < Math.round(avg / 2) ? "#D9A441" : "#764838",
              fill:  i < Math.round(avg / 2) ? "#D9A441" : "none",
            }}
          />
        ))}
      </div>
      <span className="text-vhs text-[0.7rem]" style={{ color: "#D9A441" }}>
        {avg.toFixed(1)}
      </span>
      <span className="text-[0.65rem]" style={{ color: "#764838" }}>
        ({count} ta baho)
      </span>
    </div>
  );
}
