"use client";

import { useState, useMemo } from "react";
import { Upload, Check, X, AlertCircle, Play } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

interface JsonMovie {
  id: string;
  title: string;
  description?: string;
  year?: number;
  genre?: string;
  rating?: number;
  quality?: string;
  poster?: string;
  posterImage?: string;
  thumbnail?: string;
  headerImage?: string;
  heroPoster?: string;
  heroFeatured?: boolean;
  showInHeader?: boolean;
  likes?: number;
  cdnUrl?: string;
}

interface ImportResult {
  title: string;
  status: "success" | "error" | "skip";
  message?: string;
}

function detectType(genre = ""): "film" | "serial" | "cartoon" {
  const g = genre.toLowerCase();
  if (g.includes("multfilm") || g.includes("cartoon")) return "cartoon";
  if (g.includes("serial")) return "serial";
  return "film";
}

function detectNational(genre = "", title = ""): boolean {
  const g = genre.toLowerCase();
  return g.includes("o'zbek") || g.includes("uzbek");
}

function normalizeQuality(q = ""): string[] {
  const qu = q.toUpperCase();
  if (qu.includes("1080") || qu.includes("FULLHD")) return ["FullHD"];
  if (qu.includes("4K")) return ["4K"];
  return ["HD"];
}

function createSlug(text = ""): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
    .slice(0, 80) || `movie-${Date.now()}`;
}

function getDecade(year = 2000): string {
  if (year >= 2010) return "2010s";
  if (year >= 2000) return "2000s";
  if (year >= 1990) return "1990s";
  if (year >= 1980) return "1980s";
  if (year >= 1970) return "1970s";
  return "1960s";
}

export default function ImportPage() {
  const [movies,    setMovies]    = useState<JsonMovie[]>([]);
  const [results,   setResults]   = useState<ImportResult[]>([]);
  const [importing, setImporting] = useState(false);
  const [progress,  setProgress]  = useState(0);
  const [fileName,  setFileName]  = useState("");

  const supabase = useMemo(() => createClient(), []);

  // JSON fayl yuklash
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        setMovies(Array.isArray(data) ? data : [data]);
        toast.success(`${Array.isArray(data) ? data.length : 1} ta film yuklandi`);
      } catch {
        toast.error("JSON fayl noto'g'ri format");
      }
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (movies.length === 0) { toast.error("Avval JSON fayl tanlang"); return; }

    setImporting(true);
    setResults([]);
    setProgress(0);

    // Kategoriyalar yuklash
    const { data: cats } = await supabase.from("categories").select("*");
    // Mavjud sluglar
    const { data: existingSlugs } = await supabase.from("movies").select("slug");
    const slugSet = new Set((existingSlugs || []).map((m: any) => m.slug));

    const newResults: ImportResult[] = [];

    for (let i = 0; i < movies.length; i++) {
      const m = movies[i];
      setProgress(Math.round(((i + 1) / movies.length) * 100));

      const type       = detectType(m.genre);
      const isNational = detectNational(m.genre, m.title);

      // Slug yaratish
      const baseSlug = createSlug(m.title);
      let slug = baseSlug;
      let suffix = 1;
      while (slugSet.has(slug)) slug = `${baseSlug}-${suffix++}`;
      slugSet.add(slug);

      // Kategoriya topish
      let categoryId = null;
      if (cats) {
        if (type === "cartoon") {
          const cat = cats.find((c: any) => c.type === "cartoon" && (isNational ? c.slug === "multi-uz" : c.slug === "multi-eu"));
          categoryId = cat?.id || cats.find((c: any) => c.type === "cartoon")?.id;
        } else if (type === "serial") {
          const cat = cats.find((c: any) => c.type === "serial" && (isNational ? c.slug === "serial-nat" : c.slug === "serial-for"));
          categoryId = cat?.id || cats.find((c: any) => c.type === "serial")?.id;
        } else {
          const cat = cats.find((c: any) => c.type === "film" && (isNational ? c.slug === "national" : c.slug === "foreign"));
          categoryId = cat?.id || cats.find((c: any) => c.type === "film")?.id;
        }
      }

      const year = Number(m.year) || 2024;

      const { data: saved, error } = await supabase.from("movies").insert({
        slug,
        title_uz:       m.title || "",
        title_ru:       m.title || "",
        title_en:       m.title || "",
        description_uz: m.description || "",
        description_ru: m.description || "",
        description_en: "",
        poster_url:     m.poster || m.posterImage || m.thumbnail || "",
        backdrop_url:   m.headerImage || m.heroPoster || null,
        year,
        decade:         getDecade(year),
        duration:       null,
        country:        isNational ? "O'zbekiston" : "",
        director:       "",
        actors:         [],
        type,
        category_id:    categoryId || null,
        quality:        normalizeQuality(m.quality),
        language:       ["uz"],
        rating_avg:     Math.min(10, Number(m.rating) || 0),
        rating_count:   0,
        views:          m.likes || 0,
        is_featured:    m.heroFeatured || m.showInHeader || false,
        is_daily_gem:   false,
        is_published:   true,
      }).select("id").single();

      if (error) {
        newResults.push({ title: m.title, status: "error", message: error.message });
      } else {
        // Video manba
        if (m.cdnUrl && saved) {
          await supabase.from("video_sources").insert({
            movie_id:    saved.id,
            quality:     normalizeQuality(m.quality)[0],
            language:    "uz",
            url:         m.cdnUrl,
            source_type: "external",
          });
        }
        newResults.push({ title: m.title, status: "success" });
      }

      // Har 5 ta da update
      if (i % 5 === 0) setResults([...newResults]);
    }

    setResults(newResults);
    setImporting(false);

    const ok  = newResults.filter((r) => r.status === "success").length;
    const err = newResults.filter((r) => r.status === "error").length;
    toast.success(`✅ ${ok} ta qo'shildi, ${err} ta xato`);
  };

  const successCount = results.filter((r) => r.status === "success").length;
  const errorCount   = results.filter((r) => r.status === "error").length;

  return (
    <div>
      {/* Sarlavha */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-vhs text-xl tracking-widest" style={{ color: "#764838" }}>
            JSON IMPORT
          </h1>
          <p className="text-[0.7rem] mt-1" style={{ color: "#764838", opacity: 0.6 }}>
            movies.json faylini Supabase ga yuklash
          </p>
        </div>
      </div>

      {/* Fayl yuklash */}
      <div
        className="p-6 mb-6"
        style={{ background: "#EDE3CC", border: "1px solid rgba(0,0,0,0.1)" }}
      >
        <p className="text-vhs text-[0.6rem] tracking-widest mb-4" style={{ color: "#D9A441" }}>
          1. JSON FAYL TANLANG
        </p>
        <label
          className="flex items-center gap-3 px-5 py-4 cursor-pointer transition-all w-fit"
          style={{
            border: "2px dashed rgba(0,0,0,0.2)",
            background: "#EAE0C6",
          }}
          onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.borderColor = "rgba(217,164,65,0.5)"}
          onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,0,0,0.2)"}
        >
          <Upload size={18} style={{ color: "#764838" }} />
          <div>
            <p className="text-vhs text-[0.62rem] tracking-wider" style={{ color: "#764838" }}>
              {fileName || "movies.json faylni tanlang"}
            </p>
            {movies.length > 0 && (
              <p className="text-[0.65rem] mt-0.5" style={{ color: "#D9A441" }}>
                {movies.length} ta film tayyor
              </p>
            )}
          </div>
          <input type="file" accept=".json" onChange={handleFile} className="hidden" />
        </label>
      </div>

      {/* Preview */}
      {movies.length > 0 && results.length === 0 && (
        <div
          className="p-5 mb-6"
          style={{ background: "#EDE3CC", border: "1px solid rgba(0,0,0,0.1)" }}
        >
          <p className="text-vhs text-[0.6rem] tracking-widest mb-4" style={{ color: "#D9A441" }}>
            2. KO'RIB CHIQING ({movies.length} ta film)
          </p>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {movies.slice(0, 20).map((m, i) => (
              <div key={i} className="flex items-center gap-3 py-1.5 px-3" style={{ background: "#EAE0C6" }}>
                {m.poster && (
                  <img src={m.poster || m.posterImage} alt="" className="w-6 h-8 object-cover flex-shrink-0" />
                )}
                <span className="text-[0.78rem] flex-1 truncate" style={{ color: "#764838" }}>{m.title}</span>
                <span className="text-[0.65rem]" style={{ color: "#764838", opacity: 0.5 }}>{m.year}</span>
                <span className="text-[0.6rem] px-1.5 py-0.5" style={{ background: "rgba(0,0,0,0.06)", color: "#764838" }}>
                  {detectType(m.genre)}
                </span>
              </div>
            ))}
            {movies.length > 20 && (
              <p className="text-center text-[0.65rem] py-2" style={{ color: "#764838", opacity: 0.5 }}>
                ... va yana {movies.length - 20} ta film
              </p>
            )}
          </div>

          <div className="mt-4">
            <button
              onClick={handleImport}
              disabled={importing}
              className="btn-retro btn-retro-filled flex items-center gap-2"
            >
              <Play size={13} />
              {importing ? `Import qilinmoqda... ${progress}%` : `${movies.length} ta filmni import qilish`}
            </button>
          </div>
        </div>
      )}

      {/* Progress */}
      {importing && (
        <div className="mb-6">
          <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.08)" }}>
            <div
              className="h-full transition-all duration-300 rounded-full"
              style={{
                width: `${progress}%`,
                background: "linear-gradient(90deg, #D9A441, #F0C56A)",
              }}
            />
          </div>
          <p className="text-[0.7rem] mt-2 text-center" style={{ color: "#764838" }}>
            {progress}% — {results.length} ta qayta ishlandi
          </p>
        </div>
      )}

      {/* Natijalar */}
      {results.length > 0 && !importing && (
        <div
          className="p-5"
          style={{ background: "#EDE3CC", border: "1px solid rgba(0,0,0,0.1)" }}
        >
          <div className="flex items-center gap-4 mb-4">
            <p className="text-vhs text-[0.6rem] tracking-widest" style={{ color: "#D9A441" }}>
              NATIJA
            </p>
            <span className="flex items-center gap-1 text-[0.7rem]" style={{ color: "#2a9d2a" }}>
              <Check size={12} /> {successCount} ta muvaffaqiyatli
            </span>
            {errorCount > 0 && (
              <span className="flex items-center gap-1 text-[0.7rem]" style={{ color: "#E8341C" }}>
                <X size={12} /> {errorCount} ta xato
              </span>
            )}
          </div>

          <div className="space-y-1 max-h-64 overflow-y-auto">
            {results.map((r, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-3 py-1.5"
                style={{
                  background: r.status === "success" ? "rgba(42,157,42,0.06)" : "rgba(232,52,28,0.06)",
                }}
              >
                {r.status === "success"
                  ? <Check size={12} style={{ color: "#2a9d2a", flexShrink: 0 }} />
                  : <X     size={12} style={{ color: "#E8341C", flexShrink: 0 }} />
                }
                <span className="text-[0.75rem] truncate" style={{ color: "#764838" }}>{r.title}</span>
                {r.message && (
                  <span className="text-[0.62rem] ml-auto" style={{ color: "#E8341C" }}>{r.message}</span>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={() => { setMovies([]); setResults([]); setFileName(""); setProgress(0); }}
            className="btn-retro mt-4 text-[0.6rem]"
          >
            Yangi import
          </button>
        </div>
      )}
    </div>
  );
}
