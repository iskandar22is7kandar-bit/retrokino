import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const env = Object.fromEntries(
  readFileSync(resolve(__dirname, '../.env.local'), 'utf-8')
    .split('\n').filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => { const [k, ...v] = l.split('='); return [k.trim(), v.join('=').trim()]; })
);
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// FilmsPageClient dagi query ni aynan takrorlaymiz
const { data: cat } = await sb.from('categories').select('id').eq('slug', 'foreign').maybeSingle();
console.log('foreign cat id:', cat?.id);

const { data, count, error } = await sb.from('movies')
  .select('id, title_uz, type, is_published', { count: 'exact' })
  .eq('is_published', true)
  .eq('type', 'film')
  .eq('category_id', cat?.id)
  .order('views', { ascending: false })
  .range(0, 23);

console.log('Xato:', error?.message || 'yo\'q');
console.log('Topilgan:', count, 'ta');
console.log('Birinchi 5 ta:');
data?.slice(0, 5).forEach(m => console.log(' -', m.title_uz));
