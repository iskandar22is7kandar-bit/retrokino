"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, Info, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDuration } from "@/lib/utils";
import type { Movie } from "@/types";

/* Demo ma'lumotlar — real kontent yo'q bo'lganda */
const DEMO_SLIDES = [
  {
    title: "RetroKino Kolleksiyasi",
    subtitle: "Eng sara filmlar va seriallar",
    desc: "Milliy va xorijiy kinosanʼatining eng yaxshi asarlari bir joyda. HD sifatda tomosha qiling.",
    year: "2024", genre: "Barcha janrlar", rating: 9.1, duration: "2h 30min",
    bg: "linear-gradient(135deg, #0B1520 0%, #162030 40%, #0B1118 100%)",
  },
];

interface HeroBannerProps {
  movies: Movie[];
}

export default function HeroBanner({ movies }: HeroBannerProps) {
  const [current,   setCurrent]   = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused,  setIsPaused]  = useState(false);
  const [loaded,    setLoaded]    = useState(false);

  const slides = movies.length > 0 ? movies : [];
  const total  = slides.length;

  useEffect(() => { setLoaded(true); }, []);

  const goNext = useCallback(() => {
    setDirection(1);
    setCurrent((c) => (c + 1) % Math.max(total, 1));
  }, [total]);
  const goPrev = useCallback(() => {
    setDirection(-1);
    setCurrent((c) => (c - 1 + Math.max(total, 1)) % Math.max(total, 1));
  }, [total]);

  useEffect(() => {
    if (isPaused || total <= 1) return;
    const t = setInterval(goNext, 7000);
    return () => clearInterval(t);
  }, [goNext, isPaused, total]);

  const movie   = slides[current] ?? null;
  const title   = movie ? (movie.title_uz || movie.title_ru) : "RetroKino";
  const desc    = movie ? (movie.description_uz || movie.description_ru || "") : "Milliy va xorijiy kinosanʼatining eng yaxshi asarlari bir joyda.";
  const href    = movie
    ? `/${movie.type === "film" ? "films" : movie.type === "serial" ? "serials" : "cartoons"}/${movie.slug}`
    : "/films";
  const bgImage = movie?.backdrop_url || movie?.poster_url || null;

  const variants = {
    enter: (d: number) => ({ opacity: 0, x: d > 0 ? 60 : -60, filter: "blur(8px)" }),
    center: { opacity: 1, x: 0, filter: "blur(0px)", transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
    exit:   (d: number) => ({ opacity: 0, x: d > 0 ? -40 : 40, filter: "blur(4px)", transition: { duration: 0.4 } }),
  };

  const contentVariants = {
    hidden:  {},
    visible: { transition: { staggerChildren: 0.1 } },
  };
  const itemVariants = {
    hidden:  { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
  };

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ height: "clamp(520px, 72vh, 760px)", background: "#f1e9d2" }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <AnimatePresence custom={direction} mode="sync">
        <motion.div
          key={current}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          className="absolute inset-0"
        >
          {/* Fon rasmi */}
          {bgImage ? (
            <>
              <Image
                src={bgImage}
                alt={title}
                fill
                priority
                className="object-cover"
                style={{ filter: "brightness(0.65) saturate(1.1)" }}
                sizes="100vw"
              />
              {/* Vignette */}
              <div className="absolute inset-0" style={{
                background: "radial-gradient(ellipse at center, transparent 40%, rgba(241,233,210,0.25) 100%)",
              }} />
            </>
          ) : (
            /* Demo fon — rasm yo'q bo'lganda */
            <div className="absolute inset-0">
              {/* Kino proyektor effekti */}
              <div className="absolute inset-0" style={{
                background: "radial-gradient(ellipse 80% 60% at 65% 40%, rgba(241,233,210,0.8) 0%, rgba(241,233,210,1) 70%)",
              }} />
              {/* Plyonka dekor chiziqlar */}
              <div className="absolute top-0 bottom-0 left-[60%] w-px opacity-5"
                style={{ background: "linear-gradient(to bottom, transparent, rgba(217,164,65,0.8), transparent)" }} />
              <div className="absolute top-0 bottom-0 left-[62%] w-px opacity-3"
                style={{ background: "linear-gradient(to bottom, transparent, rgba(217,164,65,0.4), transparent)" }} />
              {/* Proyektor nuri */}
              <div className="absolute top-0 right-0 w-[55%] h-full" style={{
                background: "conic-gradient(from 200deg at 120% -20%, rgba(217,164,65,0.04) 0deg, transparent 40deg)",
              }} />
            </div>
          )}

          {/* Gradient overlay — chap */}
          <div className="absolute inset-0" style={{
            background: "linear-gradient(90deg, rgba(241,233,210,0.92) 0%, rgba(241,233,210,0.55) 40%, rgba(241,233,210,0.1) 65%, transparent 100%)",
          }} />
          {/* Gradient overlay — pastki */}
          <div className="absolute inset-0" style={{
            background: "linear-gradient(0deg, rgba(241,233,210,0.95) 0%, rgba(241,233,210,0.3) 15%, transparent 40%)",
          }} />

          {/* KONTENT */}
          <div className="absolute inset-0 flex items-center">
            <div className="max-w-[1440px] mx-auto px-6 lg:px-12 w-full" style={{ paddingTop: "68px" }}>
              <div className="max-w-[580px]">
                <motion.div
                  variants={contentVariants}
                  initial="hidden"
                  animate="visible"
                  key={`content-${current}`}
                >
                  {/* Badge */}
                  <motion.div variants={itemVariants} className="flex items-center gap-3 mb-5">
                    <span
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-[0.7rem] font-semibold tracking-wider"
                      style={{
                        background: "rgba(217,164,65,0.12)",
                        border: "1px solid rgba(217,164,65,0.3)",
                        color: "#F0C56A",
                      }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D9A441] animate-pulse" />
                      {movie ? (movie.type === "film" ? "FILM" : movie.type === "serial" ? "SERIAL" : "MULTFILM") : "KINO PLATFORMASI"}
                    </span>
                    {movie?.year && (
                      <span className="text-[0.75rem]" style={{ color: "#764838" }}>{movie.year}</span>
                    )}
                  </motion.div>

                  {/* Sarlavha */}
                  <motion.h1
                    variants={itemVariants}
                    className="font-display font-semibold leading-tight mb-4"
                    style={{
                      fontSize: "clamp(1.8rem, 4.5vw, 3.2rem)",
                      color: "#764838",
                      letterSpacing: "0.02em",
                      textShadow: "0 2px 12px rgba(241,233,210,0.8)",
                    }}
                  >
                    {title}
                  </motion.h1>

                  {/* Meta */}
                  {movie && (
                    <motion.div variants={itemVariants} className="flex items-center gap-3 mb-4 flex-wrap">
                      {movie.duration && (
                        <span className="text-[0.8rem]" style={{ color: "#764838" }}>
                          {formatDuration(movie.duration)}
                        </span>
                      )}
                      {movie.country && (
                        <>
                          <span style={{ color: "#764838" }}>•</span>
                          <span className="text-[0.8rem]" style={{ color: "#764838" }}>{movie.country}</span>
                        </>
                      )}
                      {movie.rating_avg > 0 && (
                        <>
                          <span style={{ color: "#764838" }}>•</span>
                          <span className="flex items-center gap-1 text-[0.8rem]" style={{ color: "#D9A441" }}>
                            <Star size={12} fill="#D9A441" />
                            {movie.rating_avg.toFixed(1)}
                          </span>
                        </>
                      )}
                    </motion.div>
                  )}

                  {/* Tavsif */}
                  <motion.p
                    variants={itemVariants}
                    className="text-[0.875rem] leading-relaxed mb-7"
                    style={{
                      color: "#764838",
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    } as React.CSSProperties}
                  >
                    {desc}
                  </motion.p>

                  {/* Tugmalar */}
                  <motion.div variants={itemVariants} className="flex items-center gap-3 flex-wrap">
                    <Link href={href} className="btn-primary">
                      <Play size={16} fill="currentColor" /> Ko&apos;rishni boshlash
                    </Link>
                    {movie && (
                      <Link href={href} className="btn-outline">
                        <Info size={15} /> Batafsil
                      </Link>
                    )}
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Nav tugmalari */}
      {total > 1 && (
        <>
          {[
            { fn: goPrev, Icon: ChevronLeft, side: "left-4" },
            { fn: goNext, Icon: ChevronRight, side: "right-4" },
          ].map(({ fn, Icon, side }, i) => (
            <button
              key={i}
              onClick={fn}
              className={`absolute ${side} top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center z-10 transition-all duration-200 group`}
              style={{
                background: "rgba(5,8,13,0.6)",
                border: "1px solid rgba(255,255,255,0.1)",
                backdropFilter: "blur(8px)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "rgba(5,8,13,0.9)";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(217,164,65,0.4)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "rgba(5,8,13,0.6)";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.1)";
              }}
            >
              <Icon size={18} style={{ color: "#764838" }} className="group-hover:text-white transition-colors" />
            </button>
          ))}
        </>
      )}

      {/* Indikatorlar */}
      {total > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i); }}
              aria-label={`Slayd ${i + 1}`}
              className="rounded-full transition-all duration-300"
              style={{
                width:   i === current ? "24px" : "6px",
                height:  "6px",
                background: i === current ? "#D9A441" : "rgba(255,255,255,0.2)",
                border: "none",
                cursor: "pointer",
              }}
            />
          ))}
        </div>
      )}

      {/* Pastki chiziq */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(217,164,65,0.3), transparent)" }}
      />
    </div>
  );
}
