"use client";

import { useState } from "react";
import { ChevronDown, Play } from "lucide-react";
import { cn, formatDuration } from "@/lib/utils";
import VideoPlayer from "@/components/player/VideoPlayer";
import type { Season } from "@/types";

interface EpisodeListProps {
  seasons: Season[];
  movieId: string;
}

export default function EpisodeList({ seasons, movieId }: EpisodeListProps) {
  const [activeSeason,  setActiveSeason]  = useState(seasons[0]?.id || "");
  const [activeEpisode, setActiveEpisode] = useState<string | null>(null);

  const currentSeason = seasons.find((s) => s.id === activeSeason);

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <span className="text-vhs text-[0.55rem] tracking-widest px-2 py-1" style={{ color: "#764838", border: "1px solid rgba(0,0,0,0.12)" }}>
          SERIAL
        </span>
        <h2 className="text-vhs tracking-wider text-sm" style={{ color: "#764838" }}>FASLLAR VA EPIZODLAR</h2>
      </div>

      {/* Fasl tanlash */}
      {seasons.length > 1 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {seasons.map((season) => (
            <button
              key={season.id}
              onClick={() => { setActiveSeason(season.id); setActiveEpisode(null); }}
              className={cn(
                "btn-retro text-[0.6rem] py-1.5",
                activeSeason === season.id && "btn-retro-filled"
              )}
            >
              {season.title_uz || `${season.season_number}-fasl`}
            </button>
          ))}
        </div>
      )}

      {/* Aktiv pleer */}
      {activeEpisode && (
        <div className="mb-4">
          {(() => {
            const ep = currentSeason?.episodes.find((e) => e.id === activeEpisode);
            if (!ep) return null;
            return (
              <VideoPlayer
                sources={ep.video_sources}
                movieId={movieId}
                episodeId={ep.id}
              />
            );
          })()}
        </div>
      )}

      {/* Epizodlar ro'yxati */}
      <div className="space-y-1">
        {currentSeason?.episodes.map((episode) => (
          <div
            key={episode.id}
            className="flex items-center gap-3 p-3 border transition-all cursor-pointer"
            style={{
              background: activeEpisode === episode.id ? "#DDD0A5" : "#EDE3CC",
              borderColor: activeEpisode === episode.id ? "rgba(217,164,65,0.4)" : "rgba(0,0,0,0.1)",
            }}
            onClick={() => setActiveEpisode(
              activeEpisode === episode.id ? null : episode.id
            )}
          >
            <div className="w-8 h-8 flex items-center justify-center flex-shrink-0" style={{ border: "1px solid rgba(0,0,0,0.15)" }}>
              {activeEpisode === episode.id ? (
                <ChevronDown size={14} style={{ color: "#D9A441" }} />
              ) : (
                <Play size={14} style={{ color: "#764838" }} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-vhs text-[0.6rem] tracking-wider" style={{ color: "#764838" }}>
                {episode.title_uz || `${episode.episode_number}-epizod`}
              </p>
            </div>
            {episode.duration && (
              <span className="text-[0.65rem] flex-shrink-0" style={{ color: "#764838" }}>
                {formatDuration(episode.duration)}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
