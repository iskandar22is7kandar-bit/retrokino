"use client";

import { Heart, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

// Auth olib tashlandi — tugmalar faqat vizual, funksional emas
export default function FavoriteButton({ movieId }: { movieId?: string }) {
  return (
    <div className="flex gap-2">
      <button
        className={cn("btn-retro flex items-center justify-center gap-2 flex-1 text-[0.6rem]")}
        aria-label="Sevimlilarga qo'shish"
      >
        <Heart size={13} fill="none" />
        Sevimli
      </button>
      <button
        className={cn("btn-retro flex items-center justify-center gap-2 flex-1 text-[0.6rem]")}
        aria-label="Ko'rish ro'yxatiga qo'shish"
      >
        <Clock size={13} />
        Keyinroq
      </button>
    </div>
  );
}
