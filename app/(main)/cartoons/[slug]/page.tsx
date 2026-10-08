import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Film, Eye, Globe, Home, ChevronRight } from "lucide-react";
import { getMovieBySlug, getSimilarMovies, incrementViews } from "@/lib/queries";
import { formatViews, getDecadeLabel } from "@/lib/utils";
import VideoPlayer from "@/components/player/VideoPlayer";
import CommentsSection from "@/components/movie/CommentsSection";
import SectionBlock from "@/components/movie/SectionBlock";
import FavoriteButton from "@/components/movie/FavoriteButton";
import RatingWidget from "@/components/movie/RatingWidget";
import ShareButtons from "@/components/movie/ShareButtons";
import type { VideoSource } from "@/types";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const movie = await getMovieBySlug(slug);
  if (!movie) return { title: "Multfilm topilmadi" };
  return {
    title: movie.title_uz || movie.title_ru,
    description: movie.description_uz?.slice(0, 160),
  };
}

export default async function CartoonDetailPage({ params }: Props) {
  const { slug } = await params;
  const movie = await getMovieBySlug(slug);
  if (!movie) notFound();

  incrementViews(movie.id).catch(() => {});

  const similar = await getSimilarMovies(movie.id, movie.genres?.map((g) => g.id) || [], 6);
  const videoSources: VideoSource[] = (movie as any).video_sources || [];

  return (
    <div className="min-h-screen pt-16">
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
            href="/cartoons"
            className="breadcrumb-btn flex items-center gap-2 px-4 py-2 text-[0.82rem] font-medium"
            style={{
              background: "rgba(217,164,65,0.08)",
              border: "1px solid rgba(217,164,65,0.25)",
              borderRadius: "10px",
              color: "#D9A441",
            }}
          >
            Multfilmlar
          </Link>
          <ChevronRight size={14} style={{ color: "#764838", opacity: 0.4 }} />
          <span className="text-[0.82rem] truncate max-w-[200px]" style={{ color: "#764838", opacity: 0.6 }}>
            {movie.title_uz}
          </span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 mb-10">
          <div className="flex-shrink-0">
            <div className="relative aspect-[2/3] w-full max-w-[280px] mx-auto lg:mx-0 border border-[#764838] overflow-hidden">
              {movie.poster_url ? (
                <Image src={movie.poster_url} alt={movie.title_uz} fill className="object-cover" priority sizes="280px" />
              ) : (
                <div className="absolute inset-0 bg-[#2b2b2b] flex items-center justify-center">
                  <Film size={48} className="text-[#764838]" />
                </div>
              )}
              <div className="absolute inset-0 pointer-events-none opacity-20" style={{ background: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.2) 3px, rgba(0,0,0,0.2) 4px)" }} />
            </div>
            <div className="mt-4 space-y-2 max-w-[280px] mx-auto lg:mx-0">
              <FavoriteButton movieId={movie.id} />
              <ShareButtons movie={movie} />
            </div>
          </div>

          <div>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {movie.genres?.map((g) => (
                <Link key={g.id} href={`/cartoons?genre=${g.slug}`} className="badge-retro text-[0.55rem]">{g.name_uz}</Link>
              ))}
              {movie.decade && <span className="badge-retro text-[0.55rem]">{getDecadeLabel(movie.decade)}</span>}
            </div>
            <h1 className="text-vhs text-[#764838] leading-tight mb-2 vhs-glow" style={{ fontSize: "clamp(1.2rem, 3vw, 2rem)" }}>
              {movie.title_uz}
            </h1>
            <RatingWidget movie={movie} />
            <div className="grid grid-cols-2 gap-3 mt-5 mb-5">
              {[
                { icon: <Globe size={12} />, label: "Mamlakat", value: movie.country || "—" },
                { icon: <Film size={12} />, label: "Yil", value: String(movie.year) },
                { icon: <Eye size={12} />, label: "Ko'rishlar", value: formatViews(movie.views) },
              ].map(({ icon, label, value }) => (
                <div key={label} className="flex items-start gap-2 text-[0.75rem]">
                  <span className="text-[#764838] mt-0.5">{icon}</span>
                  <div>
                    <p className="text-[#764838] text-[0.6rem] font-mono uppercase tracking-wider">{label}</p>
                    <p className="text-[#764838]">{value}</p>
                  </div>
                </div>
              ))}
            </div>
            <div>
              <p className="text-vhs text-[0.55rem] text-[#764838] tracking-widest mb-2">HAQIDA</p>
              <p className="text-[0.82rem] text-[#764838] leading-relaxed">{movie.description_uz || movie.description_ru}</p>
            </div>
          </div>
        </div>

        {videoSources.length > 0 && (
          <div className="mb-10">
            <div className="max-w-4xl">
              <VideoPlayer sources={videoSources} movieId={movie.id} poster={movie.poster_url} />
            </div>
          </div>
        )}

        <div className="section-divider" />
        <div className="mb-10"><CommentsSection movieId={movie.id} /></div>
        {similar.length > 0 && <SectionBlock title="O'XSHASH MULTFILMLAR" movies={similar} tapeLabel="RELATED" />}
      </div>
    </div>
  );
}
