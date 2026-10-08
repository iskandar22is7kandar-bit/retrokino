/**
 * movies.json → Supabase import skripti
 * Ishga tushirish: node scripts/import-movies.mjs
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// .env.local dan o'qish
const envPath = resolve(__dirname, "../.env.local");
const envContent = readFileSync(envPath, "utf-8");
const env = Object.fromEntries(
  envContent.split("\n")
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => {
      const [k, ...v] = l.split("=");
      return [k.trim(), v.join("=").trim()];
    })
);

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// movies.json
const moviesPath = resolve(__dirname, "../../movies.json");
const rawMovies = JSON.parse(readFileSync(moviesPath, "utf-8"));

// Genre → type aniqlash
function detectType(genre = "") {
  const g = genre.toLowerCase();
  if (g.includes("multfilm") || g.includes("cartoon") || g.includes("animation")) return "cartoon";
  if (g.includes("serial") || g.includes("series")) return "serial";
  return "film";
}

// Genre → O'zbek/Xorijiy aniqlash
function detectNational(genre = "", title = "") {
  const g = genre.toLowerCase();
  const t = title.toLowerCase();
  if (g.includes("o'zbek") || g.includes("uzbek") || t.includes("o'zbek")) return true;
  return false;
}

// Quality normalize
function normalizeQuality(q = "") {
  const qu = q.toUpperCase();
  if (qu.includes("1080") || qu.includes("FULLHD")) return ["FullHD"];
  if (qu.includes("720") || qu.includes("HD")) return ["HD"];
  if (qu.includes("4K")) return ["4K"];
  return ["HD"];
}

// Slug yaratish
function createSlug(text = "") {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
    .slice(0, 80) || `movie-${Date.now()}`;
}

// Yildan decade
function getDecade(year = 2000) {
  if (year >= 2010) return "2010s";
  if (year >= 2000) return "2000s";
  if (year >= 1990) return "1990s";
  if (year >= 1980) return "1980s";
  if (year >= 1970) return "1970s";
  return "1960s";
}

// Kategoriyalarni yuklash
const { data: categories } = await supabase.from("categories").select("*");
console.log(`✓ ${categories?.length || 0} ta kategoriya yuklandi`);

function getCategoryId(genre, title, type) {
  if (!categories) return null;
  const isNational = detectNational(genre, title);

  if (type === "cartoon") {
    const cat = categories.find((c) =>
      c.type === "cartoon" && (isNational ? c.slug === "multi-uz" : c.slug === "multi-eu")
    );
    return cat?.id || categories.find((c) => c.type === "cartoon")?.id || null;
  }
  if (type === "serial") {
    const cat = categories.find((c) =>
      c.type === "serial" && (isNational ? c.slug === "serial-nat" : c.slug === "serial-for")
    );
    return cat?.id || categories.find((c) => c.type === "serial")?.id || null;
  }
  // film
  const cat = categories.find((c) =>
    c.type === "film" && (isNational ? c.slug === "national" : c.slug === "foreign")
  );
  return cat?.id || categories.find((c) => c.type === "film")?.id || null;
}

// Mavjud sluglarni yuklash (duplicate oldini olish)
const { data: existingSlugs } = await supabase.from("movies").select("slug");
const slugSet = new Set((existingSlugs || []).map((m) => m.slug));

let imported = 0;
let skipped  = 0;
let errors   = 0;

for (const m of rawMovies) {
  const type       = detectType(m.genre);
  const isNational = detectNational(m.genre, m.title);
  const baseSlug   = createSlug(m.title);

  // Duplicate tekshirish
  let slug = baseSlug;
  let suffix = 1;
  while (slugSet.has(slug)) {
    slug = `${baseSlug}-${suffix++}`;
  }
  slugSet.add(slug);

  const categoryId = getCategoryId(m.genre, m.title, type);
  const year       = Number(m.year) || 2024;

  const movie = {
    slug,
    title_uz:        m.title || "",
    title_ru:        m.title || "",
    title_en:        m.title || "",
    description_uz:  m.description || "",
    description_ru:  m.description || "",
    description_en:  "",
    poster_url:      m.poster || m.posterImage || m.thumbnail || "",
    backdrop_url:    m.headerImage || m.heroPoster || null,
    trailer_url:     null,
    year,
    decade:          getDecade(year),
    duration:        null,
    country:         isNational ? "O'zbekiston" : "",
    director:        "",
    actors:          [],
    type,
    category_id:     categoryId,
    quality:         normalizeQuality(m.quality),
    language:        ["uz"],
    rating_avg:      Math.min(10, Number(m.rating) || 0),
    rating_count:    0,
    views:           m.likes || 0,
    is_featured:     m.heroFeatured || m.showInHeader || false,
    is_daily_gem:    false,
    is_published:    true,
  };

  const { data: saved, error } = await supabase
    .from("movies")
    .insert(movie)
    .select("id")
    .single();

  if (error) {
    console.error(`✗ Xato [${m.title}]: ${error.message}`);
    errors++;
    continue;
  }

  // Video manba qo'shish
  if (m.cdnUrl && saved) {
    await supabase.from("video_sources").insert({
      movie_id:    saved.id,
      quality:     normalizeQuality(m.quality)[0],
      language:    "uz",
      url:         m.cdnUrl,
      source_type: "external",
    });
  }

  imported++;
  if (imported % 10 === 0) {
    console.log(`  → ${imported}/${rawMovies.length} ta import qilindi...`);
  }
}

console.log("\n═══════════════════════════════════");
console.log(`✅ Import yakunlandi!`);
console.log(`   Qo'shildi:   ${imported} ta`);
console.log(`   O'tkazildi:  ${skipped}  ta`);
console.log(`   Xato:        ${errors}   ta`);
console.log("═══════════════════════════════════");
