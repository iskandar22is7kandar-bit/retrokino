"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Hls from "hls.js";
import {
  Play, Pause, Volume2, VolumeX, Maximize, Minimize,
  SkipBack, SkipForward, Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { storage } from "@/lib/utils";
import type { VideoSource, Quality, Language } from "@/types";

interface VideoPlayerProps {
  sources:         VideoSource[];
  movieId:         string;
  episodeId?:      string;
  poster?:         string;
  onProgress?:     (seconds: number) => void;
  initialProgress?: number;
}

// ── URL turini aniqlash ──────────────────────────────────────
function detectUrlType(url: string): "youtube" | "vk" | "hls" | "mp4" {
  if (!url) return "mp4";
  if (/youtube\.com|youtu\.be/.test(url))  return "youtube";
  if (/vk\.com|vkvideo\.ru/.test(url))     return "vk";
  if (url.includes(".m3u8"))               return "hls";
  return "mp4";
}

// YouTube URL → embed URL
function toYoutubeEmbed(url: string): string {
  // youtu.be/ID
  const short = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (short) return `https://www.youtube.com/embed/${short[1]}?autoplay=1&rel=0&modestbranding=1`;
  // youtube.com/watch?v=ID
  const watch = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (watch) return `https://www.youtube.com/embed/${watch[1]}?autoplay=1&rel=0&modestbranding=1`;
  // youtube.com/embed/ID — allaqachon embed
  if (url.includes("/embed/")) return url.includes("autoplay") ? url : url + "?autoplay=1";
  return url;
}

// VK URL → embed URL
function toVkEmbed(url: string): string {
  // video_ext.php — allaqachon embed
  if (url.includes("video_ext.php")) return url;

  // vkvideo.ru/video-OID_ID  yoki  vk.com/video-OID_ID
  const match = url.match(/video(-?\d+)_(\d+)/);
  if (match) {
    return `https://vk.com/video_ext.php?oid=${match[1]}&id=${match[2]}&hd=2&js_api=1`;
  }

  // vkvideo.ru/video?z=video-OID_ID
  const zMatch = url.match(/z=video(-?\d+)_(\d+)/);
  if (zMatch) {
    return `https://vk.com/video_ext.php?oid=${zMatch[1]}&id=${zMatch[2]}&hd=2&js_api=1`;
  }

  return url;
}

// ── Iframe Player (YouTube / VK) ─────────────────────────────
function IframePlayer({ url, poster, type }: { url: string; poster?: string; type: "youtube" | "vk" }) {
  const [started, setStarted] = useState(false);
  const embedUrl = type === "youtube" ? toYoutubeEmbed(url) : toVkEmbed(url);

  if (!started) {
    return (
      <div
        className="relative w-full aspect-video bg-[#0a0a0a] cursor-pointer group"
        style={{ border: "1px solid rgba(118,72,56,0.3)" }}
        onClick={() => setStarted(true)}
      >
        {/* Poster */}
        {poster && (
          <img
            src={poster}
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-60"
          />
        )}

        {/* VHS scanlines */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.15) 3px, rgba(0,0,0,0.15) 4px)",
            opacity: 0.4,
          }}
        />

        {/* Overlay gradient */}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to top, rgba(10,10,10,0.7) 0%, transparent 60%)" }}
        />

        {/* Play tugmasi */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 group-hover:scale-110"
            style={{
              background: "rgba(217,164,65,0.15)",
              border: "2px solid rgba(217,164,65,0.6)",
              boxShadow: "0 0 40px rgba(217,164,65,0.2)",
            }}
          >
            <Play size={32} style={{ color: "#D9A441", marginLeft: 4 }} fill="#D9A441" />
          </div>
          <div className="flex items-center gap-2">
            <div
              className="px-3 py-1 text-vhs text-[0.55rem] tracking-widest"
              style={{
                background: "rgba(0,0,0,0.6)",
                border: "1px solid rgba(118,72,56,0.3)",
                color: "#764838",
              }}
            >
              {type === "youtube" ? "▶ YOUTUBE" : "▶ VK VIDEO"}
            </div>
          </div>
        </div>

        {/* VHS indikator */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ background: "#D9A441" }}
          />
          <span className="text-vhs text-[0.48rem] tracking-widest" style={{ color: "#764838" }}>
            TOMOSHA QILISH UCHUN BOSING
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative w-full aspect-video bg-[#0a0a0a]"
      style={{ border: "1px solid rgba(118,72,56,0.3)" }}
    >
      <iframe
        src={embedUrl}
        className="absolute inset-0 w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        title="Video player"
      />
      {/* VHS scanlines overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.06) 3px, rgba(0,0,0,0.06) 4px)",
        }}
      />
    </div>
  );
}

// ── Native Player (HLS / MP4) ────────────────────────────────
export default function VideoPlayer({
  sources,
  movieId,
  episodeId,
  poster,
  onProgress,
  initialProgress = 0,
}: VideoPlayerProps) {

  // Birinchi manbani aniqlash
  const firstSource = sources[0];
  const firstType   = firstSource ? detectUrlType(firstSource.url) : "mp4";

  // YouTube yoki VK bo'lsa — IframePlayer
  if (firstType === "youtube" || firstType === "vk") {
    return (
      <IframePlayer
        url={firstSource.url}
        poster={poster}
        type={firstType}
      />
    );
  }

  // Bir nechta manba bo'lsa, YouTube/VK ni topib ko'rish
  const ytSource = sources.find((s) => detectUrlType(s.url) === "youtube");
  const vkSource = sources.find((s) => detectUrlType(s.url) === "vk");

  if (ytSource) return <IframePlayer url={ytSource.url} poster={poster} type="youtube" />;
  if (vkSource) return <IframePlayer url={vkSource.url} poster={poster} type="vk" />;

  // HLS / MP4 uchun native player
  return (
    <NativePlayer
      sources={sources}
      movieId={movieId}
      episodeId={episodeId}
      poster={poster}
      onProgress={onProgress}
      initialProgress={initialProgress}
    />
  );
}

// ── Native HLS/MP4 Player ────────────────────────────────────
function NativePlayer({
  sources,
  movieId,
  episodeId,
  poster,
  onProgress,
  initialProgress = 0,
}: VideoPlayerProps) {
  const videoRef     = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef       = useRef<Hls | null>(null);
  const progressRef  = useRef<HTMLDivElement>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const [isPlaying,    setIsPlaying]    = useState(false);
  const [isMuted,      setIsMuted]      = useState(false);
  const [volume,       setVolume]       = useState(0.8);
  const [currentTime,  setCurrentTime]  = useState(0);
  const [duration,     setDuration]     = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading,    setIsLoading]    = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [isBuffering,  setIsBuffering]  = useState(false);
  const [activeQuality, setActiveQuality] = useState<Quality>("HD");
  const [activeLang,    setActiveLang]    = useState<Language>("uz");

  const qualities = [...new Set(sources.map((s) => s.quality))];
  const langs     = [...new Set(sources.map((s) => s.language))];

  const getCurrentSource = useCallback(() => {
    return (
      sources.find((s) => s.quality === activeQuality && s.language === activeLang) ||
      sources.find((s) => s.quality === activeQuality) ||
      sources.find((s) => s.language === activeLang) ||
      sources[0]
    );
  }, [sources, activeQuality, activeLang]);

  const loadVideo = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const source = getCurrentSource();
    if (!source) return;

    // Avval to'xtatib, keyin yangi source yuklaymiz
    video.pause();

    if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }

    if (source.source_type === "hls" || source.url.includes(".m3u8")) {
      if (Hls.isSupported()) {
        const hls = new Hls({ startLevel: -1, autoStartLoad: true });
        hls.loadSource(source.url);
        hls.attachMedia(video);
        hlsRef.current = hls;
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setIsLoading(false);
          if (initialProgress > 0) video.currentTime = initialProgress;
        });
        hls.on(Hls.Events.ERROR, (_, data) => { if (data.fatal) setIsLoading(false); });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source.url;
        setIsLoading(false);
      }
    } else {
      video.src = source.url;
      video.load();
      setIsLoading(false);
      if (initialProgress > 0) video.currentTime = initialProgress;
    }
  }, [getCurrentSource, initialProgress]);

  useEffect(() => {
    loadVideo();
    return () => {
      // Cleanup: video to'xtatib, HLS destroy
      const video = videoRef.current;
      if (video) {
        video.pause();
        video.src = "";
        video.load();
      }
      hlsRef.current?.destroy();
      hlsRef.current = null;
    };
  }, [loadVideo]);

  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    clearTimeout(hideTimerRef.current);
    if (isPlaying) {
      hideTimerRef.current = setTimeout(() => setShowControls(false), 3000);
    }
  }, [isPlaying]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onPlay    = () => setIsPlaying(true);
    const onPause   = () => { setIsPlaying(false); setShowControls(true); };
    const onEnded   = () => { setIsPlaying(false); setShowControls(true); };
    const onTime    = () => {
      setCurrentTime(video.currentTime);
      if (Math.floor(video.currentTime) % 5 === 0) {
        storage.set(`progress_${movieId}${episodeId ? `_${episodeId}` : ""}`, video.currentTime);
        onProgress?.(video.currentTime);
      }
    };
    const onDur     = () => setDuration(video.duration);
    const onWait    = () => setIsBuffering(true);
    const onCan     = () => setIsBuffering(false);
    const onVol     = () => { setVolume(video.volume); setIsMuted(video.muted); };

    video.addEventListener("play",           onPlay);
    video.addEventListener("pause",          onPause);
    video.addEventListener("ended",          onEnded);
    video.addEventListener("timeupdate",     onTime);
    video.addEventListener("durationchange", onDur);
    video.addEventListener("waiting",        onWait);
    video.addEventListener("canplay",        onCan);
    video.addEventListener("volumechange",   onVol);
    return () => {
      video.removeEventListener("play",           onPlay);
      video.removeEventListener("pause",          onPause);
      video.removeEventListener("ended",          onEnded);
      video.removeEventListener("timeupdate",     onTime);
      video.removeEventListener("durationchange", onDur);
      video.removeEventListener("waiting",        onWait);
      video.removeEventListener("canplay",        onCan);
      video.removeEventListener("volumechange",   onVol);
    };
  }, [movieId, episodeId, onProgress]);

  useEffect(() => {
    const onFs = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const video = videoRef.current;
      if (!video) return;
      switch (e.key) {
        case " ": case "k": e.preventDefault(); togglePlay(); break;
        case "f":           toggleFullscreen(); break;
        case "m":           toggleMute(); break;
        case "ArrowLeft":   e.preventDefault(); video.currentTime -= 10; break;
        case "ArrowRight":  e.preventDefault(); video.currentTime += 10; break;
        case "ArrowUp":     e.preventDefault(); video.volume = Math.min(1, video.volume + 0.1); break;
        case "ArrowDown":   e.preventDefault(); video.volume = Math.max(0, video.volume - 0.1); break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      const promise = v.play();
      if (promise !== undefined) {
        promise.catch((err) => {
          // "play() interrupted" — media removed yoki autoplay bloklangan, ignore
          if (err?.name !== "AbortError") console.warn("play() error:", err);
        });
      }
    } else {
      v.pause();
    }
    resetHideTimer();
  }, [resetHideTimer]);
  const toggleMute = useCallback(() => {
    const v = videoRef.current;
    if (v) v.muted = !v.muted;
  }, []);

  const toggleFullscreen = useCallback(() => {
    const c = containerRef.current;
    if (!c) return;
    !document.fullscreenElement ? c.requestFullscreen() : document.exitFullscreen();
  }, []);
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const v = videoRef.current;
    const b = progressRef.current;
    if (!v || !b) return;
    const r = b.getBoundingClientRect();
    v.currentTime = ((e.clientX - r.left) / r.width) * duration;
  };
  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const pct = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative bg-[#0a0a0a] overflow-hidden select-none",
        isFullscreen ? "w-screen h-screen" : "w-full aspect-video"
      )}
      style={{ border: "1px solid rgba(118,72,56,0.3)" }}
      onMouseMove={resetHideTimer}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      onClick={togglePlay}
      tabIndex={0}
    >
      <video
        ref={videoRef}
        poster={poster}
        className="w-full h-full object-contain"
        preload="metadata"
        playsInline
      />

      {/* VHS scanlines */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          background: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.2) 3px, rgba(0,0,0,0.2) 4px)",
        }}
      />

      {/* Loading */}
      {(isLoading || isBuffering) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a0a0a]/80 z-20 pointer-events-none">
          <div
            className="w-10 h-10 rounded-full border-2 animate-spin mb-3"
            style={{ borderColor: "rgba(118,72,56,0.3)", borderTopColor: "#D9A441" }}
          />
          <p className="text-vhs text-[0.55rem] tracking-widest" style={{ color: "#764838" }}>
            {isLoading ? "YUKLANMOQDA..." : "BUFERLANMOQDA..."}
          </p>
        </div>
      )}

      {/* Markaziy play */}
      {!isPlaying && !isLoading && (
        <div
          className="absolute inset-0 flex items-center justify-center z-10"
          style={{ pointerEvents: "auto" }}
        >
          <div
            className="w-18 h-18 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
            style={{
              width: 72, height: 72,
              background: "rgba(217,164,65,0.12)",
              border: "2px solid rgba(217,164,65,0.5)",
            }}
          >
            <Play size={28} style={{ color: "#D9A441", marginLeft: 3 }} fill="#D9A441" />
          </div>
        </div>
      )}

      {/* Boshqaruv paneli */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 z-30 transition-opacity duration-300 px-4 pb-3 pt-10",
          showControls ? "opacity-100" : "opacity-0"
        )}
        style={{
          background: "linear-gradient(to top, rgba(10,10,10,0.95) 0%, transparent 100%)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress */}
        <div
          ref={progressRef}
          className="relative h-1 mb-3 cursor-pointer group/pb rounded-full"
          style={{ background: "rgba(255,255,255,0.12)" }}
          onClick={handleProgressClick}
        >
          <div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{ width: `${pct}%`, background: "linear-gradient(90deg, #D9A441, #F0C56A)" }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full opacity-0 group-hover/pb:opacity-100 transition-opacity"
            style={{
              left: `${pct}%`,
              transform: "translate(-50%, -50%)",
              background: "#D9A441",
              boxShadow: "0 0 6px rgba(217,164,65,0.8)",
            }}
          />
        </div>

        {/* Controls qatori */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">

            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className="p-1.5 rounded transition-colors"
              style={{ color: "#D9A441" }}
              aria-label={isPlaying ? "Pauza" : "O'yna"}
            >
              {isPlaying
                ? <Pause size={16} fill="#D9A441" />
                : <Play  size={16} fill="#D9A441" />
              }
            </button>

            {/* -10s */}
            <button
              onClick={() => { if (videoRef.current) videoRef.current.currentTime -= 10; }}
              className="p-1.5 rounded transition-colors"
              style={{ color: "#764838" }}
              aria-label="10 soniya orqaga"
            >
              <SkipBack size={14} />
            </button>

            {/* +10s */}
            <button
              onClick={() => { if (videoRef.current) videoRef.current.currentTime += 10; }}
              className="p-1.5 rounded transition-colors"
              style={{ color: "#764838" }}
              aria-label="10 soniya oldinga"
            >
              <SkipForward size={14} />
            </button>

            {/* Ovoz */}
            <div className="flex items-center gap-1 group/vol">
              <button
                onClick={toggleMute}
                className="p-1.5 rounded transition-colors"
                style={{ color: "#764838" }}
              >
                {isMuted || volume === 0 ? <VolumeX size={14} /> : <Volume2 size={14} />}
              </button>
              <input
                type="range" min="0" max="1" step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  if (videoRef.current) { videoRef.current.volume = v; videoRef.current.muted = v === 0; }
                }}
                className="w-0 group-hover/vol:w-16 transition-all overflow-hidden opacity-0 group-hover/vol:opacity-100"
                style={{ accentColor: "#D9A441" }}
              />
            </div>

            {/* Vaqt */}
            <span className="text-vhs text-[0.52rem] tracking-wider" style={{ color: "#764838" }}>
              {fmt(currentTime)} / {fmt(duration)}
            </span>
          </div>

          <div className="flex items-center gap-1.5 relative">
            {/* Sozlamalar */}
            {(qualities.length > 1 || langs.length > 1) && (
              <div className="relative">
                <button
                  onClick={(e) => { e.stopPropagation(); setShowSettings(!showSettings); }}
                  className="p-1.5 rounded transition-colors"
                  style={{ color: "#764838" }}
                >
                  <Settings size={14} />
                </button>
                {showSettings && (
                  <div
                    className="absolute bottom-full right-0 mb-2 py-2 min-w-[150px] z-50"
                    style={{ background: "#EDE3CC", border: "1px solid rgba(0,0,0,0.12)" }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {qualities.length > 1 && (
                      <div className="px-3 pb-2">
                        <p className="text-vhs text-[0.52rem] tracking-widest mb-1.5" style={{ color: "#764838" }}>SIFAT</p>
                        <div className="flex flex-wrap gap-1">
                          {qualities.map((q) => (
                            <button
                              key={q}
                              onClick={() => { setActiveQuality(q); setShowSettings(false); loadVideo(); }}
                              className={cn("badge-retro text-[0.5rem] cursor-pointer", q === activeQuality && "active")}
                            >
                              {q}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    {langs.length > 1 && (
                      <div className="px-3 pt-2" style={{ borderTop: "1px solid rgba(0,0,0,0.08)" }}>
                        <p className="text-vhs text-[0.52rem] tracking-widest mb-1.5" style={{ color: "#764838" }}>TIL</p>
                        <div className="flex flex-wrap gap-1">
                          {langs.map((l) => (
                            <button
                              key={l}
                              onClick={() => { setActiveLang(l); setShowSettings(false); loadVideo(); }}
                              className={cn("badge-retro text-[0.5rem] cursor-pointer uppercase", l === activeLang && "active")}
                            >
                              {l}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded transition-colors"
              style={{ color: "#764838" }}
            >
              {isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
            </button>
          </div>
        </div>
      </div>

      {/* VHS indikator */}
      <div
        className={cn(
          "absolute top-3 left-3 right-3 flex items-center justify-between z-20 pointer-events-none transition-opacity duration-300",
          showControls ? "opacity-100" : "opacity-0"
        )}
      >
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#D9A441" }} />
          <span className="text-vhs text-[0.48rem] tracking-widest" style={{ color: "#764838" }}>
            {isPlaying ? "▶ PLAY" : "⏸ PAUSE"}
          </span>
        </div>
        <span className="text-vhs text-[0.48rem] tracking-widest" style={{ color: "#764838" }}>
          {activeQuality} · {activeLang.toUpperCase()}
        </span>
      </div>
    </div>
  );
}
