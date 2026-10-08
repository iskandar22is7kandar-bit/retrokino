import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Clock, Globe, Film, Eye, Home, ChevronRight } from "lucide-react";
import { getMovieBySlug, getSimilarMovies, incrementViews } from "@/lib/queries";
import { formatDuration, formatViews, getDecadeLabel } from "@/lib/utils";
import VideoPlayer from "@/components/player/VideoPlayer";
import CommentsSection from "@/components/movie/CommentsSection";
import SectionBlock from "@/components/movie/SectionBlock";
import FavoriteButton from "@/components/movie/FavoriteButton";
import RatingWidget from "@/components/movie/RatingWidget";
import ShareButtons from "@/components/movie/ShareButtons";
import EpisodeList from "@/components/movie/EpisodeList";
import type { VideoSource } from "@/types";

// Next.js 15: params is a Promise
interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const movie = await getMovieBySlug(slug);
  if (!movie) return { title: "Film topilmadi" };
  return {
    title: movie.title_uz || movie.title_ru,
    description: movie.description_uz?.slice(0, 160),
    openGraph: {
      title: movie.title_uz,
      description: movie.description_uz?.slice(0, 160),
      images: movie.poster_url ? [{ url: movie.poster_url }] : [],
    },
  };
}

export default async function MovieDetailPage({ params }: Props) {
  const { slug } = await params;
  const movie = await getMovieBySlug(slug);
  if (!movie) notFound();

  // Ko'rishlar sonini oshirish (fire and forget)
  incrementViews(movie.id).catch(() => {});

  // O'xshash filmlar
  const similar = await getSimilarMovies(
    movie.id,
    movie.genres?.map((g) => g.id) || [],
    6
  );

  // Video manbalari
  const videoSources: VideoSource[] = (movie as any).video_sources || [];

  return (
    <div className="min-h-screen pt-16">

      {/* Backdrop fon */}
      {movie.backdrop_url && (
        <div className="fixed inset-0 -z-10 opacity-5 pointer-events-none">
          <Image src={movie.backdrop_url} alt="" fill className="object-cover" priority />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6">
          <Link
            href="/"
            className="breadcrumb-btn flex items-center gap-2 px-4 py-2 text-[0.82rem] font-medium"
            style={{
              background: "rgba(217,164,65,0.08)",
              border: "1px solid rgba(217,164,65,0.25)",
              borderRadius: "10px",
              color: "#D9A441",
            }}
          >
            <Home size={14} /> Bosh sahifa
          </Link>
          <ChevronRight size={14} style={{ color: "#764838", opacity: 0.4 }} />
          <Link
            href="/films"
            className="breadcrumb-btn flex items-center gap-2 px-4 py-2 text-[0.82rem] font-medium"
            style={{
              background: "rgba(217,164,65,0.08)",
              border: "1px solid rgba(217,164,65,0.25)",
              borderRadius: "10px",
              color: "#D9A441",
            }}
          >
            Filmlar
          </Link>
          <ChevronRight size={14} style={{ color: "#764838", opacity: 0.4 }} />
          <span className="text-[0.82rem] truncate max-w-[200px]" style={{ color: "#764838", opacity: 0.6 }}>
            {movie.title_uz}
          </span>
        </div>

        {/* Yuqori qism: Poster + Ma'lumot */}
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 mb-10">

          {/* Poster */}
          <div className="flex-shrink-0">
            <div className="relative aspect-[2/3] w-full max-w-[280px] mx-auto lg:mx-0 overflow-hidden" style={{ border: "1px solid rgba(0,0,0,0.12)" }}>
              {movie.poster_url ? (
                <Image
                  src={movie.poster_url}
                  alt={movie.title_uz}
                  fill
                  className="object-cover"
                  priority
                  sizes="280px"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center" style={{ background: "#EDE3CC" }}>
                  <Film size={48} style={{ color: "#764838" }} />
                </div>
              )}
              {/* Scanlines */}
              <div
                className="absolute inset-0 pointer-events-none opacity-20"
                style={{
                  background:
                    "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.2) 3px, rgba(0,0,0,0.2) 4px)",
                }}
              />
            </div>

            {/* Tugmalar */}
            <div className="mt-4 space-y-2 max-w-[280px] mx-auto lg:mx-0">
              <FavoriteButton movieId={movie.id} />
              <ShareButtons movie={movie} />
            </div>
          </div>

          {/* Ma'lumot */}
          <div>
            {/* Janrlar */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {movie.genres?.map((g) => (
                <Link
                  key={g.id}
                  href={`/films?genre=${g.slug}`}
                  className="badge-retro hover:active transition-all text-[0.55rem]"
                >
                  {g.name_uz}
                </Link>
              ))}
              {movie.decade && (
                <span className="badge-retro text-[0.55rem]">
                  {getDecadeLabel(movie.decade)}
                </span>
              )}
            </div>

            {/* Sarlavha */}
            <h1
              className="text-vhs leading-tight mb-2"
              style={{ fontSize: "clamp(1.2rem, 3vw, 2rem)", color: "#764838" }}
            >
              {movie.title_uz}
            </h1>
            {movie.title_ru && movie.title_ru !== movie.title_uz && (
              <p className="text-[0.8rem] mb-4 italic" style={{ color: "#764838" }}>{movie.title_ru}</p>
            )}

            {/* Reyting */}
            <RatingWidget movie={movie} />

            {/* Meta jadval */}
            <div className="grid grid-cols-2 gap-3 mt-5 mb-5">
              {[
                {
                  icon: <Clock size={12} />,
                  label: "Davomiyligi",
                  value: movie.duration ? formatDuration(movie.duration) : "—",
                },
                { icon: <Globe size={12} />, label: "Mamlakat", value: movie.country || "—" },
                { icon: <Film size={12} />, label: "Yil", value: String(movie.year) },
                {
                  icon: <Eye size={12} />,
                  label: "Ko'rishlar",
                  value: formatViews(movie.views),
                },
              ].map(({ icon, label, value }) => (
                <div key={label} className="flex items-start gap-2 text-[0.75rem]">
                  <span className="mt-0.5" style={{ color: "#764838" }}>{icon}</span>
                  <div>
                    <p className="text-[0.6rem] font-mono uppercase tracking-wider" style={{ color: "#764838" }}>
                      {label}
                    </p>
                    <p style={{ color: "#764838" }}>{value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Rejissyor */}
            {movie.director && (
              <div className="mb-3">
                <p className="text-vhs text-[0.55rem] tracking-widest mb-1" style={{ color: "#764838" }}>REJISSYOR
                </p>
                <p className="text-[0.8rem]" style={{ color: "#764838" }}>{movie.director}</p>
              </div>
            )}

            {/* Aktyorlar */}
            {movie.actors?.length > 0 && (
              <div className="mb-4">
                <p className="text-vhs text-[0.55rem] tracking-widest mb-1" style={{ color: "#764838" }}>AKTYORLAR
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {movie.actors.slice(0, 8).map((actor) => (
                    <span
                      key={actor}
                      className="text-[0.72rem] px-2 py-0.5" style={{ color: "#764838", border: "1px solid rgba(0,0,0,0.12)" }}
                    >
                      {actor}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Tavsif */}
            <div>
              <p className="text-vhs text-[0.55rem] tracking-widest mb-2" style={{ color: "#764838" }}>HAQIDA
              </p>
              <p className="text-[0.82rem] leading-relaxed" style={{ color: "#764838" }}>
                {movie.description_uz || movie.description_ru}
              </p>
            </div>
          </div>
        </div>

        {/* Video pleer */}
        {videoSources.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-vhs text-[0.55rem] tracking-widest px-2 py-1" style={{ color: "#764838", border: "1px solid rgba(0,0,0,0.12)" }}>▶ PLAY
              </span>
              <h2 className="text-vhs tracking-wider text-sm" style={{ color: "#764838" }}>TOMOSHA QILISH
              </h2>
            </div>
            <div className="max-w-4xl">
              <VideoPlayer
                sources={videoSources}
                movieId={movie.id}
                poster={movie.poster_url}
              />
            </div>
          </div>
        )}

        {/* Epizodlar ro'yxati (serial bo'lsa) */}
        {movie.type === "serial" && movie.seasons && movie.seasons.length > 0 && (
          <div className="mb-10">
            <EpisodeList seasons={movie.seasons} movieId={movie.id} />
          </div>
        )}

        <div className="section-divider" />

        {/* Izohlar */}
        <div className="mb-10">
          <CommentsSection movieId={movie.id} />
        </div>

        {/* O'xshash filmlar */}
        {similar.length > 0 && (
          <SectionBlock title="O'XSHASH FILMLAR" movies={similar} tapeLabel="RELATED" />
        )}
      </div>
    </div>
  );
}
