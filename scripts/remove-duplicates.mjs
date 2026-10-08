/**
 * Duplicate kinolarni topib o'chirish
 * Mantiq: bir xil title_uz + year bo'lsa — eng eskisini qoldirib, qolganlarini o'chirish
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const env = Object.fromEntries(
  readFileSync(resolve(__dirname, "../.env.local"), "utf-8")
    .split("\n").filter(l => l.includes("=") && !l.startsWith("#"))
    .map(l => { const [k, ...v] = l.split("="); return [k.trim(), v.join("=").trim()]; })
);
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// Barcha filmlarni olish
const { data: allMovies, error } = await sb
  .from("movies")
  .select("id, title_uz, year, created_at, slug")
  .order("created_at", { ascending: true }); // eng eskisi birinchi

if (error) { console.error("Xato:", error.message); process.exit(1); }

console.log(`📋 Jami filmlar: ${allMovies.length}`);

// title_uz + year bo'yicha guruhlash
const groups = {};
for (const movie of allMovies) {
  const key = `${movie.title_uz?.toLowerCase().trim()}__${movie.year}`;
  if (!groups[key]) groups[key] = [];
  groups[key].push(movie);
}

// Duplicate topish
const duplicateGroups = Object.entries(groups).filter(([, movies]) => movies.length > 1);
console.log(`🔍 Duplicate guruhlar: ${duplicateGroups.length}`);

if (duplicateGroups.length === 0) {
  console.log("✅ Duplicate yo'q!");
  process.exit(0);
}

// Ko'rsatish
let totalDuplicates = 0;
const toDelete = [];

for (const [key, movies] of duplicateGroups) {
  const [keep, ...dupes] = movies; // birinchisi (engeski) qoladi
  console.log(`\n  📌 "${keep.title_uz}" (${keep.year}) — ${movies.length} ta:`);
  console.log(`     ✅ Qoladi:    ${keep.id} | ${keep.created_at}`);
  for (const d of dupes) {
    console.log(`     ❌ O'chadi:  ${d.id} | ${d.created_at}`);
    toDelete.push(d.id);
  }
  totalDuplicates += dupes.length;
}

console.log(`\n📊 Jami o'chiriladigan: ${totalDuplicates} ta`);

// O'chirish — 50 talik bo'laklarda
const CHUNK = 50;
let deleted = 0;
for (let i = 0; i < toDelete.length; i += CHUNK) {
  const chunk = toDelete.slice(i, i + CHUNK);
  const { error: delErr } = await sb.from("movies").delete().in("id", chunk);
  if (delErr) {
    console.error(`❌ O'chirishda xato: ${delErr.message}`);
  } else {
    deleted += chunk.length;
    console.log(`  🗑️  ${deleted}/${toDelete.length} ta o'chirildi`);
  }
}

console.log(`\n✅ Yakunlandi! ${deleted} ta duplicate o'chirildi.`);
console.log(`📋 Qolgan filmlar: ${allMovies.length - deleted}`);
