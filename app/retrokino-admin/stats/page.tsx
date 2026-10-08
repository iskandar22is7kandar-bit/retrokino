import { createClient } from "@/lib/supabase/server";
import { Film, Eye, MessageSquare, Star, Tv, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StatsPage() {
  const supabase = await createClient();

  const [moviesRes, commentsRes, ratingsRes, top10Res] = await Promise.all([
    supabase.from("movies").select("id, type, views, is_published, rating_avg", { count: "exact" }),
    supabase.from("comments").select("id", { count: "exact" }),
    supabase.from("ratings").select("id", { count: "exact" }),
    supabase
      .from("movies")
      .select("id, title_uz, title_ru, views, rating_avg, type")
      .order("views", { ascending: false })
      .limit(10),
  ]);

  const movies     = moviesRes.data || [];
  const films      = movies.filter((m) => m.type === "film").length;
  const serials    = movies.filter((m) => m.type === "serial").length;
  const cartoons   = movies.filter((m) => m.type === "cartoon").length;
  const totalViews = movies.reduce((s, m) => s + (m.views || 0), 0);
  const avgRating  = movies.length
    ? (movies.reduce((s, m) => s + (m.rating_avg || 0), 0) / movies.length).toFixed(1)
    : "0.0";

  const stats = [
    { label: "Jami kontent",  value: moviesRes.count || 0,          icon: Film,          color: "#D9A441" },
    { label: "Jami ko'rish",  value: totalViews.toLocaleString(),   icon: Eye,           color: "#764838" },
    { label: "Izohlar",       value: commentsRes.count || 0,        icon: MessageSquare, color: "#A07830" },
    { label: "Baholashlar",   value: ratingsRes.count || 0,         icon: Star,          color: "#D9A441" },
    { label: "Filmlar",       value: films,                         icon: Film,          color: "#764838" },
    { label: "Seriallar",     value: serials,                       icon: Tv,            color: "#764838" },
    { label: "Multfilmlar",   value: cartoons,                      icon: Sparkles,      color: "#764838" },
    { label: "O'rtacha baho", value: avgRating,                     icon: Star,          color: "#D9A441" },
  ];

  const top10 = top10Res.data || [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-vhs text-xl tracking-widest" style={{ color: "#764838" }}>STATISTIKA</h1>
      </div>

      {/* Statistika kartalar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="p-4"
            style={{ background: "#EDE3CC", border: "1px solid rgba(0,0,0,0.1)" }}
          >
            <div className="flex items-start justify-between mb-2">
              <Icon size={16} style={{ color }} />
              <span className="text-vhs text-lg font-bold" style={{ color: "#764838" }}>{value}</span>
            </div>
            <p className="text-vhs text-[0.55rem] tracking-wider uppercase" style={{ color: "#764838", opacity: 0.7 }}>
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* TOP 10 */}
      <div>
        <p className="text-vhs text-[0.6rem] tracking-widest mb-4" style={{ color: "#764838" }}>
          ENG KO&apos;P KO&apos;RILGAN 10 TA
        </p>
        <div style={{ border: "1px solid rgba(0,0,0,0.08)" }}>
          {top10.map((movie, idx) => (
            <div
              key={movie.id}
              className="flex items-center gap-4 px-4 py-3"
              style={{
                background: idx % 2 === 0 ? "#EDE3CC" : "#EAE0C6",
                borderBottom: idx < top10.length - 1 ? "1px solid rgba(0,0,0,0.05)" : "none",
              }}
            >
              <span
                className="text-vhs text-[0.6rem] w-6 flex-shrink-0 text-center"
                style={{ color: idx < 3 ? "#D9A441" : "#764838" }}
              >
                {idx + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[0.8rem] truncate" style={{ color: "#764838" }}>
                  {(movie as any).title_uz || (movie as any).title_ru}
                </p>
                <p className="text-[0.62rem] mt-0.5" style={{ color: "#764838", opacity: 0.5 }}>
                  {(movie as any).type}
                </p>
              </div>
              <div className="flex items-center gap-4 flex-shrink-0">
                <span className="flex items-center gap-1 text-[0.7rem]" style={{ color: "#764838" }}>
                  <Eye size={11} /> {((movie as any).views || 0).toLocaleString()}
                </span>
                <span className="text-[0.7rem]" style={{ color: "#D9A441" }}>
                  ★ {((movie as any).rating_avg || 0).toFixed(1)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
