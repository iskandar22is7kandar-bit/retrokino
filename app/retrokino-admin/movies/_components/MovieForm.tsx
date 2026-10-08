"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Upload, Plus, X, Check, Link as LinkIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { createSlug } from "@/lib/utils";
import toast from "react-hot-toast";
import type { Category } from "@/types";

interface MovieFormProps {
  movieId?:     string;
  defaultType?: string;
  defaultCat?:  string;
}

const DECADES   = ["1960s", "1970s", "1980s", "1990s", "2000s", "2010s"];
const QUALITIES = ["SD", "HD", "FullHD", "4K"];
const LANGUAGES = ["uz", "ru", "en"];

// Kichik yorliq komponenti
function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="text-vhs text-[0.52rem] tracking-widest block mb-1.5 uppercase" style={{ color: "#764838" }}>
      {children}{required && <span style={{ color: "#E8341C" }}> *</span>}
    </label>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="p-5" style={{ background: "#EDE3CC", border: "1px solid rgba(0,0,0,0.1)" }}>
      <p className="text-vhs text-[0.6rem] tracking-widest mb-5" style={{ color: "#D9A441" }}>
        {title}
      </p>
      {children}
    </div>
  );
}

export default function MovieForm({ movieId, defaultType = "film", defaultCat = "" }: MovieFormProps) {
  const router   = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [categories,    setCategories]    = useState<Category[]>([]);
  const [isSaving,      setIsSaving]      = useState(false);
  const [posterFile,    setPosterFile]    = useState<File | null>(null);
  const [posterPreview, setPosterPreview] = useState("");

  const [form, setForm] = useState({
    title_uz: "", title_ru: "", title_en: "",
    description_uz: "", description_ru: "",
    year:       new Date().getFullYear(),
    decade:     "1980s",
    duration_hours:   "",
    duration_minutes: "",
    country:    "",
    director:   "",
    actors_raw: "",
    type:       defaultType,
    category_id:"",
    quality:    ["HD"] as string[],
    language:   ["uz"] as string[],
    // Video manba
    video_url:      "",
    video_quality:  "HD",
    video_language: "uz",
    // Sozlamalar
    is_featured:  false,
    is_daily_gem: false,
    is_published: true,
  });

  // Kategoriyalar va mavjud film ma'lumotlarini yuklash
  useEffect(() => {
    supabase.from("categories").select("*").order("type").order("name_uz").then(({ data }) => {
      const cats = (data as Category[]) || [];
      setCategories(cats);

      // Default kategoriya — cat slug bo'yicha (ko'proq variantni sinab ko'rish)
      if (defaultCat && cats.length > 0) {
        // 1. To'liq mos slug
        let found = cats.find((c) => c.slug === defaultCat && c.type === defaultType);
        // 2. Slug ichida mavjud
        if (!found) found = cats.find((c) => c.slug.includes(defaultCat) && c.type === defaultType);
        // 3. Faqat type bo'yicha birinchi
        if (!found) found = cats.find((c) => c.type === defaultType);

        if (found) setForm((p) => ({ ...p, category_id: found!.id }));
      }
    });

    if (movieId) {
      supabase.from("movies").select("*").eq("id", movieId).single().then(({ data }) => {
        if (data) {
          setForm((p) => ({
            ...p,
            ...data,
            actors_raw: (data.actors || []).join(", "),
            quality:    data.quality   || ["HD"],
            language:   data.language  || ["uz"],
            duration_hours:   data.duration ? String(Math.floor(data.duration / 60)) : "",
            duration_minutes: data.duration ? String(data.duration % 60) : "",
          }));
          if (data.poster_url) setPosterPreview(data.poster_url);
        }
      });
    }
  }, [movieId]);

  // type o'zgarganda kategoriya category_id ni tozalash
  const handleTypeChange = (newType: string) => {
    setForm((p) => ({ ...p, type: newType, category_id: "" }));
  };

  const handlePosterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPosterFile(file);
    setPosterPreview(URL.createObjectURL(file));
  };

  const toggleArray = (key: "quality" | "language", value: string) => {
    setForm((p) => ({
      ...p,
      [key]: p[key].includes(value)
        ? p[key].filter((v) => v !== value)
        : [...p[key], value],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title_uz.trim()) { toast.error("O'zbek tilidagi nom kerak"); return; }

    setIsSaving(true);

    let poster_url = posterPreview;

    // Poster yuklash
    if (posterFile) {
      const ext  = posterFile.name.split(".").pop();
      const path = `posters/${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from("movies")
        .upload(path, posterFile, { cacheControl: "3600", upsert: true });

      if (uploadErr) {
        toast.error("Poster yuklanmadi: " + uploadErr.message);
        setIsSaving(false);
        return;
      }
      const { data: { publicUrl } } = supabase.storage.from("movies").getPublicUrl(path);
      poster_url = publicUrl;
    }

    const slug = movieId
      ? undefined  // Tahrirlashda slug o'zgartirmaymiz
      : createSlug(form.title_uz || form.title_ru || "film");
    const actors = form.actors_raw.split(",").map((a) => a.trim()).filter(Boolean);

    // Yildan decade avtomatik hisoblash
    const year = Number(form.year);
    const decade = year >= 2010 ? "2010s"
                 : year >= 2000 ? "2000s"
                 : year >= 1990 ? "1990s"
                 : year >= 1980 ? "1980s"
                 : year >= 1970 ? "1970s"
                 : "1960s";

    const payload = {
      ...(slug ? { slug } : {}),  // Tahrirlashda slug yubormaymiz
      title_uz:       form.title_uz.trim(),
      title_ru:       form.title_ru.trim(),
      title_en:       form.title_en.trim(),
      description_uz: form.description_uz.trim(),
      description_ru: form.description_ru.trim(),
      description_en: "",
      year:           Number(form.year),
      decade:         decade,
      duration:       (Number(form.duration_hours || 0) * 60 + Number(form.duration_minutes || 0)) || null,
      country:        form.country.trim(),
      director:       form.director.trim(),
      actors,
      type:           form.type,
      category_id:    form.category_id || null,
      quality:        form.quality,
      language:       form.language,
      poster_url,
      backdrop_url:   null,
      trailer_url:    null,
      is_featured:    form.is_featured,
      is_daily_gem:   form.is_daily_gem,
      is_published:   form.is_published,
    };

    const { data: saved, error } = movieId
      ? await supabase.from("movies").update(payload).eq("id", movieId).select("id").single()
      : await supabase.from("movies").insert(payload).select("id").single();

    if (error) {
      toast.error("Xatolik: " + error.message);
      setIsSaving(false);
      return;
    }

    // Video manba qo'shish
    if (form.video_url.trim() && saved) {
      const url = form.video_url.trim();
      const source_type =
        /youtube\.com|youtu\.be/.test(url) ? "external" :
        /vk\.com/.test(url)                ? "external" :
        url.includes(".m3u8")              ? "hls"      : "external";

      const { error: vidErr } = await supabase.from("video_sources").insert({
        movie_id:    saved.id,
        quality:     form.video_quality,
        language:    form.video_language,
        url,
        source_type,
      });
      if (vidErr) toast.error("Video manba saqlanmadi: " + vidErr.message);
    }

    toast.success(movieId ? "Muvaffaqiyatli yangilandi!" : "Film muvaffaqiyatli qo'shildi!");
    router.push("/retrokino-admin/movies");
    router.refresh();
  };

  // Joriy type ga mos kategoriyalar
  const filteredCategories = categories.filter((c) => c.type === form.type);

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-4xl">

      {/* ── NOMLAR ── */}
      <Section title="NOMLAR">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <FieldLabel required>O'zbek nomi</FieldLabel>
            <input
              type="text"
              value={form.title_uz}
              onChange={(e) => setForm({ ...form, title_uz: e.target.value })}
              className="input-retro"
              placeholder="O'zbek tilida"
              required
            />
          </div>
          <div>
            <FieldLabel>Rus nomi</FieldLabel>
            <input
              type="text"
              value={form.title_ru}
              onChange={(e) => setForm({ ...form, title_ru: e.target.value })}
              className="input-retro"
              placeholder="Ruscha nomi"
            />
          </div>
          <div>
            <FieldLabel>Ingliz nomi</FieldLabel>
            <input
              type="text"
              value={form.title_en}
              onChange={(e) => setForm({ ...form, title_en: e.target.value })}
              className="input-retro"
              placeholder="English title"
            />
          </div>
        </div>
      </Section>

      {/* ── TAVSIFLAR ── */}
      <Section title="TAVSIFLAR">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <FieldLabel>O'zbekcha tavsif</FieldLabel>
            <textarea
              value={form.description_uz}
              onChange={(e) => setForm({ ...form, description_uz: e.target.value })}
              className="input-retro resize-none"
              placeholder="O'zbekcha tavsif..."
              rows={4}
            />
          </div>
          <div>
            <FieldLabel>Ruscha tavsif</FieldLabel>
            <textarea
              value={form.description_ru}
              onChange={(e) => setForm({ ...form, description_ru: e.target.value })}
              className="input-retro resize-none"
              placeholder="Ruscha tavsif..."
              rows={4}
            />
          </div>
        </div>
      </Section>

      {/* ── META MA'LUMOT ── */}
      <Section title="META MA'LUMOT">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">

          {/* Turi */}
          <div>
            <FieldLabel required>Turi</FieldLabel>
            <select
              value={form.type}
              onChange={(e) => handleTypeChange(e.target.value)}
              className="input-retro"
            >
              <option value="film">Film</option>
              <option value="serial">Serial</option>
              <option value="cartoon">Multfilm</option>
            </select>
          </div>

          {/* Kategoriya — type ga qarab filtrlangan */}
          <div>
            <FieldLabel>Kategoriya</FieldLabel>
            <select
              value={form.category_id}
              onChange={(e) => setForm({ ...form, category_id: e.target.value })}
              className="input-retro"
            >
              <option value="">— Tanlang —</option>
              {filteredCategories.map((c) => (
                <option key={c.id} value={c.id}>{c.name_uz}</option>
              ))}
            </select>
          </div>

          {/* Yil */}
          <div>
            <FieldLabel>Yil</FieldLabel>
            <input
              type="number"
              value={form.year}
              min={1900}
              max={2030}
              onChange={(e) => setForm({ ...form, year: Number(e.target.value) })}
              className="input-retro"
            />
          </div>

          {/* Davomiyligi */}
          <div>
            <FieldLabel>Davomiyligi</FieldLabel>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={form.duration_hours}
                min={0} max={9}
                onChange={(e) => setForm({ ...form, duration_hours: e.target.value })}
                className="input-retro w-16 text-center"
                placeholder="0"
              />
              <span className="text-vhs text-[0.55rem]" style={{ color: "#764838" }}>S</span>
              <input
                type="number"
                value={form.duration_minutes}
                min={0} max={59}
                onChange={(e) => setForm({ ...form, duration_minutes: e.target.value })}
                className="input-retro w-16 text-center"
                placeholder="00"
              />
              <span className="text-vhs text-[0.55rem]" style={{ color: "#764838" }}>DAQ</span>
            </div>
          </div>

          {/* Mamlakat */}
          <div>
            <FieldLabel>Mamlakat</FieldLabel>
            <input
              type="text"
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
              className="input-retro"
              placeholder="O'zbekiston"
            />
          </div>

          {/* Rejissyor */}
          <div>
            <FieldLabel>Rejissyor</FieldLabel>
            <input
              type="text"
              value={form.director}
              onChange={(e) => setForm({ ...form, director: e.target.value })}
              className="input-retro"
              placeholder="Ismi"
            />
          </div>
        </div>

        {/* Aktyorlar */}
        <div className="mt-4">
          <FieldLabel>Aktyorlar (vergul bilan ajrating)</FieldLabel>
          <input
            type="text"
            value={form.actors_raw}
            onChange={(e) => setForm({ ...form, actors_raw: e.target.value })}
            className="input-retro"
            placeholder="Aktyor 1, Aktyor 2, Aktyor 3"
          />
        </div>

        {/* Sifat va til */}
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <FieldLabel>Video sifati</FieldLabel>
            <div className="flex flex-wrap gap-1.5">
              {QUALITIES.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => toggleArray("quality", q)}
                  className={`badge-retro cursor-pointer ${form.quality.includes(q) ? "active" : ""}`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
          <div>
            <FieldLabel>Tillar</FieldLabel>
            <div className="flex flex-wrap gap-1.5">
              {LANGUAGES.map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => toggleArray("language", l)}
                  className={`badge-retro cursor-pointer uppercase ${form.language.includes(l) ? "active" : ""}`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ── POSTER ── */}
      <Section title="POSTER">
        <div className="flex items-start gap-5">
          {/* File upload */}
          <label
            className="cursor-pointer flex flex-col items-center justify-center overflow-hidden transition-colors flex-shrink-0"
            style={{
              width: 120,
              aspectRatio: "2/3",
              border: "2px dashed rgba(0,0,0,0.18)",
              background: "#EAE0C6",
            }}
            onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.borderColor = "rgba(217,164,65,0.5)"}
            onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,0,0,0.18)"}
          >
            {posterPreview ? (
              <img src={posterPreview} alt="poster" className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-2 px-2 text-center">
                <Upload size={20} style={{ color: "#764838" }} />
                <span className="text-vhs text-[0.5rem] tracking-widest" style={{ color: "#764838" }}>
                  RASM YUKLASH
                </span>
              </div>
            )}
            <input type="file" accept="image/*" onChange={handlePosterChange} className="hidden" />
          </label>

          <div className="flex-1 space-y-3">
            <p className="text-[0.78rem]" style={{ color: "#764838" }}>
              JPG, PNG yoki WEBP. Tavsiya etilgan o&apos;lcham: <strong>400 × 600 px</strong>.
            </p>

            {/* Poster URL qo'lda kiritish */}
            <div>
              <FieldLabel>Yoki poster URL kiriting</FieldLabel>
              <input
                type="url"
                value={posterFile ? "" : posterPreview}
                onChange={(e) => {
                  setPosterFile(null);
                  setPosterPreview(e.target.value);
                }}
                className="input-retro text-[0.8rem]"
                placeholder="https://example.com/poster.jpg"
                disabled={!!posterFile}
              />
            </div>

            {posterPreview && (
              <button
                type="button"
                onClick={() => { setPosterPreview(""); setPosterFile(null); }}
                className="flex items-center gap-1.5 text-[0.65rem] transition-colors"
                style={{ color: "#764838" }}
                onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = "#E8341C"}
                onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = "#764838"}
              >
                <X size={12} /> Posterni olib tashlash
              </button>
            )}
          </div>
        </div>
      </Section>

      {/* ── VIDEO MANBA ── */}
      <Section title="VIDEO MANBA">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-1">
            <FieldLabel>Video URL</FieldLabel>
            <div className="relative">
              <input
                type="url"
                value={form.video_url}
                onChange={(e) => setForm({ ...form, video_url: e.target.value })}
                className="input-retro pr-8"
                placeholder="YouTube, VK yoki .m3u8 URL"
              />
              <LinkIcon
                size={13}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: "#764838", opacity: 0.4 }}
              />
            </div>
            {form.video_url && (
              <p className="text-[0.65rem] mt-1" style={{ color: "#764838", opacity: 0.6 }}>
                Tur: {
                  /youtube\.com|youtu\.be/.test(form.video_url)  ? "🎬 YouTube" :
                  /vk\.com|vkvideo\.ru/.test(form.video_url)     ? "📹 VK Video" :
                  form.video_url.includes(".m3u8")               ? "📡 HLS Stream" :
                  "🔗 To'g'ridan havola"
                }
              </p>
            )}
          </div>
          <div>
            <FieldLabel>Video sifati</FieldLabel>
            <select
              value={form.video_quality}
              onChange={(e) => setForm({ ...form, video_quality: e.target.value })}
              className="input-retro"
            >
              {QUALITIES.map((q) => <option key={q} value={q}>{q}</option>)}
            </select>
          </div>
          <div>
            <FieldLabel>Til</FieldLabel>
            <select
              value={form.video_language}
              onChange={(e) => setForm({ ...form, video_language: e.target.value })}
              className="input-retro"
            >
              {LANGUAGES.map((l) => (
                <option key={l} value={l}>{l.toUpperCase()}</option>
              ))}
            </select>
          </div>
        </div>
        <p className="text-[0.7rem] mt-3" style={{ color: "#764838", opacity: 0.5 }}>
          Qo&apos;llab-quvvatlanadi: YouTube havolasi · VK Video havolasi · HLS (.m3u8) · MP4
        </p>
      </Section>

      {/* ── SOZLAMALAR ── */}
      <Section title="SOZLAMALAR">
        <div className="flex flex-wrap gap-6">
          {[
            { key: "is_published",  label: "Nashr qilish",     desc: "Saytda ko'rinadi" },
            { key: "is_featured",   label: "Banner uchun",     desc: "Bosh sahifa banner" },
            { key: "is_daily_gem",  label: "Bugungi durdona",  desc: "Maxsus ko'rsatish" },
          ].map(({ key, label, desc }) => (
            <label key={key} className="flex items-start gap-3 cursor-pointer group">
              <div
                className="mt-0.5 w-4 h-4 flex items-center justify-center flex-shrink-0 transition-all"
                style={{
                  background: form[key as keyof typeof form] ? "#D9A441" : "transparent",
                  border: `1.5px solid ${form[key as keyof typeof form] ? "#D9A441" : "rgba(0,0,0,0.2)"}`,
                  borderRadius: 3,
                }}
                onClick={() => setForm({ ...form, [key]: !form[key as keyof typeof form] })}
              >
                {form[key as keyof typeof form] && <Check size={10} color="#F1E9D2" />}
              </div>
              <div>
                <p className="text-vhs text-[0.6rem] tracking-wider uppercase" style={{ color: "#764838" }}>
                  {label}
                </p>
                <p className="text-[0.65rem] mt-0.5" style={{ color: "#764838", opacity: 0.5 }}>
                  {desc}
                </p>
              </div>
            </label>
          ))}
        </div>
      </Section>

      {/* ── TUGMALAR ── */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={isSaving}
          className="btn-retro btn-retro-filled flex items-center gap-2 disabled:opacity-50"
        >
          {isSaving ? (
            <span
              className="inline-block rounded-full border-2 animate-spin"
              style={{ width: 14, height: 14, borderColor: "#F1E9D2", borderTopColor: "transparent" }}
            />
          ) : (
            <Check size={13} />
          )}
          {movieId ? "Saqlash" : "Film qo'shish"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/retrokino-admin/movies")}
          className="btn-retro"
        >
          Bekor qilish
        </button>
      </div>
    </form>
  );
}
