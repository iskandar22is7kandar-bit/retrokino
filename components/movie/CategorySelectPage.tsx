"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Home, Clapperboard, Globe, Tv2, Globe2, Landmark, Plane, Star, Sparkles } from "lucide-react";
import type { ContentType } from "@/types";

/* ─────────────────────────────────────────
   KARTALAR MA'LUMOTLARI
───────────────────────────────────────── */
const FILM_CATS = [
  {
    value:   "national",
    label:   "Milliy Filmlar",
    desc:    "O'zbek va MDH kinosining eng sara asarlari",
    bg:      "#0F1A0A",
    border:  "#2A4A1A",
    accent:  "#6DBE47",
    tag:     "O'ZBEK",
    Icon:    Clapperboard,
    BadgeIcon: Landmark,
  },
  {
    value:   "foreign",
    label:   "Xorijiy Filmlar",
    desc:    "Jahon kinosining eng mashhur asarlari",
    bg:      "#0A0F1A",
    border:  "#1A2A4A",
    accent:  "#4A9FE0",
    tag:     "WORLD",
    Icon:    Globe,
    BadgeIcon: Plane,
  },
];

const SERIAL_CATS = [
  {
    value:   "serial-nat",
    label:   "Milliy Seriallar",
    desc:    "O'zbek va MDH mamlakatlari eng yaxshi seriallar",
    bg:      "#0F1A0A",
    border:  "#2A4A1A",
    accent:  "#6DBE47",
    tag:     "O'ZBEK",
    Icon:    Tv2,
    BadgeIcon: Landmark,
  },
  {
    value:   "serial-for",
    label:   "Xorijiy Seriallar",
    desc:    "Jahon seriallarining eng sara namunalari",
    bg:      "#0A0F1A",
    border:  "#1A2A4A",
    accent:  "#4A9FE0",
    tag:     "WORLD",
    Icon:    Globe2,
    BadgeIcon: Plane,
  },
];

/* Multfilm uchun ALOHIDA — bolalarga mos, rang-barang */
const CARTOON_CATS = [
  {
    value:   "multi-uz",
    label:   "Milliy Multfilmlar",
    desc:    "O'zbek animatsiyasining eng quvnoq va sevimli filmlari",
    bg:      "#0A1A12",
    border:  "#1A4A2A",
    accent:  "#FFD700",
    tag:     "O'ZBEK",
    Icon:    Star,
    deco:    ["🌟", "🌈", "🎠", "🌸", "🎀"],
  },
  {
    value:   "multi-eu",
    label:   "Xorijiy Multfilmlar",
    desc:    "Disney, Pixar, DreamWorks — dunyoning eng yaxshi animatsiyalari",
    bg:      "#0A0E1A",
    border:  "#1A2040",
    accent:  "#00BFFF",
    tag:     "WORLD",
    Icon:    Sparkles,
    deco:    ["🚀", "🌊", "🎡", "🦋", "🎪"],
  },
];

const TYPE_TITLE: Record<ContentType, string> = {
  film:    "Filmlar",
  serial:  "Seriallar",
  cartoon: "Multfilmlar",
};

interface CategorySelectPageProps {
  type: ContentType;
  onSelect: (category: string) => void;
}

export default function CategorySelectPage({ type, onSelect }: CategorySelectPageProps) {
  const isCartoon = type === "cartoon";

  const cats =
    type === "film"    ? FILM_CATS    :
    type === "serial"  ? SERIAL_CATS  :
    CARTOON_CATS;

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{
        paddingTop: "80px",
        background: "radial-gradient(circle at top, rgba(217,164,65,0.08), transparent 25%), radial-gradient(circle at bottom right, rgba(217,164,65,0.06), transparent 30%), #F1E9D2",
      }}
    >
      <div className="pointer-events-none absolute inset-0 opacity-60" style={{ background: "radial-gradient(circle at 15% 20%, rgba(217, 164, 65, 0.08), transparent 18%), radial-gradient(circle at 80% 30%, rgba(217, 164, 65, 0.06), transparent 22%)" }} />
      <div
        className="max-w-[1440px] mx-auto px-6 lg:px-12 w-full flex-1 flex flex-col"
        style={{ paddingBottom: "4rem" }}
      >

        {/* ── BREADCRUMB + BOSH SAHIFAGA QAYTISH ── */}
        <div
          className="flex items-center gap-2 py-5 flex-wrap"
          style={{ borderBottom: "1px solid rgba(0,0,0,0.08)", marginBottom: "2rem" }}
        >
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[0.82rem] font-medium transition-all duration-200"
            style={{
              background: "rgba(217,164,65,0.08)",
              border: "1px solid rgba(217,164,65,0.2)",
              color: "#D9A441",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "rgba(217,164,65,0.15)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "rgba(217,164,65,0.08)";
            }}
          >
            <Home size={13} />
            Bosh sahifa
          </Link>

          <span style={{ color: "#764838" }}>›</span>
          <span className="text-[0.82rem]" style={{ color: "#764838" }}>
            {TYPE_TITLE[type]}
          </span>
        </div>

        {/* ── SARLAVHA ── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-10 relative z-10"
        >
          <div className="flex flex-col items-center justify-center gap-3">
            <h1
              className="font-display text-center"
              style={{
                fontSize: "clamp(1.6rem, 4vw, 2.4rem)",
                color: "#764838", letterSpacing: "0.04em",
              }}
            >
              {TYPE_TITLE[type]}
            </h1>
          </div>
        </motion.div>

        {/* ── KARTALAR ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto w-full">
          {cats.map((cat, i) => {
            const cartoonCat = isCartoon ? (CARTOON_CATS[i] as typeof CARTOON_CATS[0]) : null;

            return (
              <motion.button
                key={cat.value}
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.12 + 0.25, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                onClick={() => onSelect(cat.value)}
                className="group relative overflow-hidden text-left transition-all duration-300"
                style={{
                  background: isCartoon
                    ? `linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04))`
                    : cat.bg,
                  border: `1px solid ${isCartoon ? "rgba(255,255,255,0.16)" : cat.border}`,
                  borderRadius: "28px",
                  padding: "1.65rem",
                  cursor: "pointer",
                  backdropFilter: "blur(16px)",
                  WebkitBackdropFilter: "blur(16px)",
                  boxShadow: isCartoon
                    ? "inset 0 1px 0 rgba(255,255,255,0.18), 0 18px 48px rgba(15, 18, 33, 0.38)"
                    : "none",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.transform = "translateY(-6px) scale(1.01)";
                  el.style.boxShadow = isCartoon
                    ? `inset 0 1px 0 rgba(255,255,255,0.18), 0 26px 56px rgba(96, 107, 255, 0.18), 0 0 0 1px ${cat.accent}44`
                    : `0 20px 48px rgba(0,0,0,0.5), 0 0 0 1px ${cat.accent}44`;
                  el.style.borderColor = `${cat.accent}55`;
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.transform = "translateY(0) scale(1)";
                  el.style.boxShadow = isCartoon
                    ? "inset 0 1px 0 rgba(255,255,255,0.18), 0 18px 48px rgba(15, 18, 33, 0.38)"
                    : "none";
                  el.style.borderColor = isCartoon ? "rgba(255,255,255,0.16)" : cat.border;
                }}
              >
                <div
                  className="absolute inset-0 opacity-70"
                  style={{
                    background: isCartoon
                      ? `radial-gradient(circle at top right, ${cat.accent}33, transparent 32%), linear-gradient(135deg, rgba(255,255,255,0.1), transparent 50%)`
                      : "transparent",
                  }}
                />

                <div
                  className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${cat.accent}, transparent)`,
                  }}
                />

                {isCartoon && cartoonCat && (
                  <div className="absolute top-3 right-3 flex gap-1 opacity-45 group-hover:opacity-80 transition-opacity">
                    {cartoonCat.deco.map((d, j) => (
                      <span key={j} className="text-[0.9rem]">{d}</span>
                    ))}
                  </div>
                )}

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className="text-[0.62rem] font-bold tracking-[0.15em] px-2.5 py-1 rounded-full"
                      style={{
                        background: `${cat.accent}18`,
                        border: `1px solid ${cat.accent}33`,
                        color: cat.accent,
                      }}
                    >
                      {cat.tag}
                    </span>
                    <span
                      className="flex h-11 w-11 items-center justify-center rounded-full border shadow-[0_12px_20px_rgba(0,0,0,0.18)]"
                      style={{
                        background: "rgba(255,255,255,0.08)",
                        borderColor: "rgba(255,255,255,0.16)",
                        boxShadow: `0 10px 25px ${cat.accent}26`,
                        color: cat.accent,
                      }}
                    >
                      {(() => {
                        const BadgeIcon = (cat as typeof FILM_CATS[0]).BadgeIcon;
                        return BadgeIcon ? <BadgeIcon size={18} /> : null;
                      })()}
                    </span>
                  </div>

                  <div
                    className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border transition-transform duration-300 group-hover:scale-110"
                    style={{
                      background: `linear-gradient(135deg, ${cat.accent}30, rgba(255,255,255,0.06))`,
                      borderColor: `${cat.accent}55`,
                      boxShadow: `0 12px 24px ${cat.accent}22`,
                      color: cat.accent,
                    }}
                  >
                    <cat.Icon size={30} strokeWidth={1.5} />
                  </div>

                  <h2
                    className="font-display font-semibold mb-2 leading-tight"
                    style={{ fontSize: "1.1rem", color: "#764838", letterSpacing: "0.02em" }}
                  >
                    {cat.label}
                  </h2>

                  <p className="text-[0.78rem] leading-relaxed mb-4" style={{ color: "rgba(245,245,245,0.72)" }}>
                    {cat.desc}
                  </p>

                  <div
                    className="flex items-center gap-2 text-[0.78rem] font-medium opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-1 group-hover:translate-y-0"
                    style={{ color: cat.accent }}
                  >
                    {isCartoon ? "Ko'rish" : "Ko'rish"}
                    <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                  </div>
                </div>

                <div
                  className="absolute bottom-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-60 transition-opacity rounded-b-2xl"
                  style={{ background: `linear-gradient(90deg, ${cat.accent}, transparent)` }}
                />
              </motion.button>
            );
          })}
        </div>


      </div>
    </div>
  );
}
