"use client";

import { Share2, Link as LinkIcon, Send } from "lucide-react";
import toast from "react-hot-toast";
import type { Movie } from "@/types";

export default function ShareButtons({ movie }: { movie: Movie }) {
  const url   = typeof window !== "undefined" ? window.location.href : "";
  const title = movie.title_uz || movie.title_ru;

  const copyLink = async () => {
    await navigator.clipboard.writeText(url);
    toast.success("Havola nusxalandi");
  };

  const shareToTelegram = () => {
    const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(`🎬 ${title} — RetroKino`)}`;
    window.open(tgUrl, "_blank", "noopener");
  };

  const nativeShare = async () => {
    if (navigator.share) {
      await navigator.share({ title, url });
    } else {
      copyLink();
    }
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={copyLink}
        className="btn-retro flex items-center justify-center gap-1.5 flex-1 text-[0.6rem]"
        aria-label="Havolani nusxalash"
      >
        <LinkIcon size={11} /> Nusxalash
      </button>
      <button
        onClick={shareToTelegram}
        className="btn-retro flex items-center justify-center gap-1.5 flex-1 text-[0.6rem]"
        aria-label="Telegram orqali ulashish"
      >
        <Send size={11} /> Telegram
      </button>
    </div>
  );
}
