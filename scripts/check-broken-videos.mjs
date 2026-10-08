/**
 * Ishlamaydigan video URL larni topib, o'chirish skripti
 * node scripts/check-broken-videos.mjs
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const envContent = readFileSync(resolve(__dirname, "../.env.local"), "utf-8");
const env = Object.fromEntries(
  envContent.split("\n")
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => { const [k, ...v] = l.split("="); return [k.trim(), v.join("=").trim()]; })
);

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// Barcha video_sources + film ma'lumotlari
const { data: sources } = await supabase
  .from("video_sources")
  .select("id, movie_id, url, source_type");

console.log(`📋 Jami ${sources.length} ta video URL tekshiriladi...\n`);

const broken = [];
const ok = [];
let checked = 0;

// Parallel tekshirish (10 ta bir vaqtda)
const BATCH = 10;
const TIMEOUT = 8000;

async function checkUrl(vs) {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT);
    const resp = await fetch(vs.url, { method: "HEAD", signal: ctrl.signal });
    clearTimeout(timer);
    return { vs, status: resp.status, ok: resp.status === 200 || resp.status === 206 };
  } catch {
    return { vs, status: 0, ok: false };
  }
}

for (let i = 0; i < sources.length; i += BATCH) {
  const batch = sources.slice(i, i + BATCH);
  const results = await Promise.all(batch.map(checkUrl));

  for (const r of results) {
    checked++;
    if (r.ok) {
      ok.push(r.vs.movie_id);
    } else {
      broken.push({ movie_id: r.vs.movie_id, url: r.vs.url, status: r.status });
    }
  }

  if (checked % 50 === 0 || checked === sources.length) {
    console.log(`  ${checked}/${sources.length} tekshirildi | ✅ ${ok.length} | ❌ ${broken.length}`);
  }
}

console.log(`\n📊 Natija:`);
console.log(`  Ishlaydigan:    ${ok.length} ta`);
console.log(`  Ishlamaydigan:  ${broken.length} ta`);

if (broken.length === 0) {
  console.log("\n✅ Hamma video ishlayapti!");
  process.exit(0);
}

// Faqat VIDEO ham YO'Q bo'lgan filmlarni o'chirish
// (poster bo'lmasa ham, video ishlasa — qoldiramiz)
const brokenMovieIds = [...new Set(broken.map((b) => b.movie_id))];

// Har bir singan filmning boshqa ishlaydigan videosi bormi?
const okMovieIds = new Set(ok);
const toDelete = brokenMovieIds.filter((id) => !okMovieIds.has(id));

console.log(`\n🗑️  O'chiriladigan filmlar (hech qanday ishlaydigan videosi yo'q): ${toDelete.length} ta`);

if (toDelete.length === 0) {
  console.log("O'chiriladigan film yo'q.");
  process.exit(0);
}

// Film nomlarini ko'rsatish
const { data: moviesInfo } = await supabase
  .from("movies")
  .select("id, title_uz, poster_url")
  .in("id", toDelete.slice(0, 50));

console.log("\nO'chiriladigan filmlar ro'yxati:");
moviesInfo?.forEach((m, i) => {
  const hasPoster = m.poster_url && m.poster_url.length > 0;
  console.log(`  ${i+1}. ${m.title_uz} ${hasPoster ? "🖼️" : "📷❌"}`);
});
if (toDelete.length > 50) console.log(`  ... va yana ${toDelete.length - 50} ta`);

// O'chirish
console.log(`\n🗑️  O'chirish boshlandi...`);
let deleted = 0;
const CHUNK = 50;
for (let i = 0; i < toDelete.length; i += CHUNK) {
  const chunk = toDelete.slice(i, i + CHUNK);
  const { error } = await supabase.from("movies").delete().in("id", chunk);
  if (error) {
    console.error(`  ✗ Xato: ${error.message}`);
  } else {
    deleted += chunk.length;
    console.log(`  ✅ ${deleted}/${toDelete.length} ta o'chirildi`);
  }
}

console.log(`\n✅ Yakunlandi! ${deleted} ta ishlamaydigan film o'chirildi.`);
