# RetroKino 🎬

**VHS estetikasidagi onlayn kino platformasi** — unutilgan klassik va retro filmlarni qayta kashf etish uchun.

## Texnologiyalar

- **Frontend:** Next.js 14 (App Router) + TypeScript
- **Stillar:** Tailwind CSS + maxsus VHS/retro CSS
- **Animatsiyalar:** Framer Motion
- **Backend/DB:** Supabase (PostgreSQL + Auth + Storage + Realtime)
- **Video:** HLS.js (adaptiv streaming)

## O'rnatish

### 1. Dependencylarni o'rnatish

```bash
npm install
```

### 2. Supabase sozlash

1. [supabase.com](https://supabase.com) da yangi loyiha yarating
2. `supabase/schema.sql` faylini Supabase SQL Editor'da ishga tushiring
3. Storage'da `media` nomli public bucket yarating
4. `.env.local` faylida o'z kalitlaringizni kiriting:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
```

### 3. Development server

```bash
npm run dev
```

`http://localhost:3000` da ochiladi.

## Loyiha tuzilmasi

```
retrokino/
├── app/
│   ├── (main)/           # Asosiy sahifalar (Header+Footer bilan)
│   │   ├── page.tsx      # Bosh sahifa
│   │   ├── films/        # Filmlar
│   │   ├── serials/      # Seriallar
│   │   ├── cartoons/     # Multfilmlar
│   │   ├── klassika/     # Klassika arxivi
│   │   ├── search/       # Qidiruv
│   │   └── profile/      # Foydalanuvchi profili
│   ├── (auth)/           # Login/Register
│   ├── admin/            # Admin panel
│   └── api/              # API routes
├── components/
│   ├── layout/           # Header, Footer
│   ├── home/             # Bosh sahifa komponentlari
│   ├── movie/            # Film komponentlari
│   ├── player/           # Video pleer
│   ├── admin/            # Admin komponentlari
│   └── effects/          # VHS effektlar
├── lib/
│   ├── supabase/         # Supabase client/server/middleware
│   ├── queries.ts        # DB so'rovlar
│   └── utils.ts          # Yordamchi funksiyalar
├── types/index.ts        # TypeScript type'lar
└── supabase/schema.sql   # DB schema
```

## Deploy

```bash
npm run build
npm start
```

Yoki Vercel'ga deploy:
```bash
npx vercel
```

## Dizayn haqida

Sayt **kulrang (#2b2b2b)** va **qaymoq (#e8dcc8)** rang sxemasida qurilgan:
- VHS scanlines effekti (butun sahifa)
- Statik shovqin teksturasi
- Retro font (VCR OSD Mono)
- TV yoqilish animatsiyasi
- Poster hover 3D tilt effekti
