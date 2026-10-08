-- ============================================================
-- RetroKino — Supabase PostgreSQL Schema
-- ============================================================

-- UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES (foydalanuvchilar profili)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  username    TEXT,
  avatar_url  TEXT,
  role        TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Profil avtomatik yaratish trigger
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, username)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- CATEGORIES (kategoriyalar)
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug        TEXT NOT NULL UNIQUE,
  name_uz     TEXT NOT NULL,
  name_ru     TEXT,
  name_en     TEXT,
  type        TEXT NOT NULL CHECK (type IN ('film', 'serial', 'cartoon')),
  parent_id   UUID REFERENCES categories(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Standart kategoriyalar
INSERT INTO categories (slug, name_uz, name_ru, type) VALUES
  ('national',   'Milliy kinolar',      'Национальное кино',      'film'),
  ('foreign',    'Xorijiy kinolar',     'Иностранное кино',       'film'),
  ('retro-uz',   'Milliy retro',        'Отечественная ретро',    'film'),
  ('retro-eu',   'Yevropa retro',       'Европейское ретро',      'film'),
  ('serial-nat', 'Milliy seriallar',    'Национальные сериалы',   'serial'),
  ('serial-for', 'Xorijiy seriallar',   'Иностранные сериалы',    'serial'),
  ('multi-uz',   'Milliy multik retro', 'Отечественные мультики', 'cartoon'),
  ('multi-eu',   'Yevromultik retro',   'Европейские мультики',   'cartoon')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- GENRES (janrlar)
-- ============================================================
CREATE TABLE IF NOT EXISTS genres (
  id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug      TEXT NOT NULL UNIQUE,
  name_uz   TEXT NOT NULL,
  name_ru   TEXT,
  name_en   TEXT
);

INSERT INTO genres (slug, name_uz, name_ru, name_en) VALUES
  ('action',    'Boevik',     'Боевик',    'Action'),
  ('drama',     'Drama',      'Драма',     'Drama'),
  ('comedy',    'Komediya',   'Комедия',   'Comedy'),
  ('sci-fi',    'Fantastika', 'Фантастика','Sci-Fi'),
  ('horror',    'Uzhastik',   'Ужасы',     'Horror'),
  ('cartoon',   'Multfilm',   'Мультфильм','Animation'),
  ('melodrama', 'Melodrama',  'Мелодрама', 'Romance'),
  ('history',   'Tarixiy',    'Исторический','Historical'),
  ('adventure', 'Sarguzasht', 'Приключения','Adventure'),
  ('thriller',  'Triller',    'Триллер',   'Thriller')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- MOVIES (filmlar, seriallar, multfilmlar)
-- ============================================================
CREATE TABLE IF NOT EXISTS movies (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug            TEXT NOT NULL UNIQUE,
  title_uz        TEXT NOT NULL,
  title_ru        TEXT,
  title_en        TEXT,
  description_uz  TEXT,
  description_ru  TEXT,
  description_en  TEXT,
  poster_url      TEXT,
  backdrop_url    TEXT,
  trailer_url     TEXT,
  year            INTEGER NOT NULL CHECK (year BETWEEN 1900 AND 2100),
  decade          TEXT NOT NULL DEFAULT '1980s',
  duration        INTEGER,                          -- daqiqalarda
  country         TEXT,
  director        TEXT,
  actors          TEXT[] DEFAULT '{}',
  type            TEXT NOT NULL CHECK (type IN ('film', 'serial', 'cartoon')),
  category_id     UUID REFERENCES categories(id),
  quality         TEXT[] DEFAULT '{"HD"}',
  language        TEXT[] DEFAULT '{"uz"}',
  rating_avg      NUMERIC(3,1) DEFAULT 0.0,
  rating_count    INTEGER DEFAULT 0,
  views           INTEGER DEFAULT 0,
  is_featured     BOOLEAN DEFAULT FALSE,
  is_daily_gem    BOOLEAN DEFAULT FALSE,
  is_published    BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indekslar
CREATE INDEX IF NOT EXISTS idx_movies_type       ON movies(type);
CREATE INDEX IF NOT EXISTS idx_movies_decade      ON movies(decade);
CREATE INDEX IF NOT EXISTS idx_movies_year        ON movies(year);
CREATE INDEX IF NOT EXISTS idx_movies_views       ON movies(views DESC);
CREATE INDEX IF NOT EXISTS idx_movies_rating      ON movies(rating_avg DESC);
CREATE INDEX IF NOT EXISTS idx_movies_published   ON movies(is_published);
CREATE INDEX IF NOT EXISTS idx_movies_daily_gem   ON movies(is_daily_gem);
CREATE INDEX IF NOT EXISTS idx_movies_slug        ON movies(slug);

-- Full-text search
CREATE INDEX IF NOT EXISTS idx_movies_fts ON movies
  USING gin(to_tsvector('russian', coalesce(title_uz,'') || ' ' || coalesce(title_ru,'') || ' ' || coalesce(director,'')));

-- ============================================================
-- MOVIE_GENRES (ko'p-ko'p)
-- ============================================================
CREATE TABLE IF NOT EXISTS movie_genres (
  movie_id UUID REFERENCES movies(id) ON DELETE CASCADE,
  genre_id UUID REFERENCES genres(id) ON DELETE CASCADE,
  PRIMARY KEY (movie_id, genre_id)
);

-- ============================================================
-- SEASONS (fasllar — seriallar uchun)
-- ============================================================
CREATE TABLE IF NOT EXISTS seasons (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  movie_id       UUID NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
  season_number  INTEGER NOT NULL,
  title_uz       TEXT,
  title_ru       TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- EPISODES (epizodlar)
-- ============================================================
CREATE TABLE IF NOT EXISTS episodes (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  season_id       UUID NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
  episode_number  INTEGER NOT NULL,
  title_uz        TEXT,
  title_ru        TEXT,
  duration        INTEGER,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- VIDEO_SOURCES (video manbalar)
-- ============================================================
CREATE TABLE IF NOT EXISTS video_sources (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  movie_id     UUID REFERENCES movies(id) ON DELETE CASCADE,
  episode_id   UUID REFERENCES episodes(id) ON DELETE CASCADE,
  quality      TEXT NOT NULL DEFAULT 'HD' CHECK (quality IN ('SD', 'HD', 'FullHD', '4K')),
  language     TEXT NOT NULL DEFAULT 'uz' CHECK (language IN ('uz', 'ru', 'en')),
  url          TEXT NOT NULL,
  source_type  TEXT NOT NULL DEFAULT 'external' CHECK (source_type IN ('supabase', 'external', 'hls')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- RATINGS (reytinglar)
-- ============================================================
CREATE TABLE IF NOT EXISTS ratings (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  movie_id   UUID NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
  score      INTEGER NOT NULL CHECK (score BETWEEN 1 AND 10),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, movie_id)
);

-- Reyting o'zgaranda avg yangilash
CREATE OR REPLACE FUNCTION update_movie_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE movies SET
    rating_avg   = (SELECT AVG(score) FROM ratings WHERE movie_id = COALESCE(NEW.movie_id, OLD.movie_id)),
    rating_count = (SELECT COUNT(*)   FROM ratings WHERE movie_id = COALESCE(NEW.movie_id, OLD.movie_id))
  WHERE id = COALESCE(NEW.movie_id, OLD.movie_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_rating_change ON ratings;
CREATE TRIGGER on_rating_change
  AFTER INSERT OR UPDATE OR DELETE ON ratings
  FOR EACH ROW EXECUTE FUNCTION update_movie_rating();

-- ============================================================
-- COMMENTS (izohlar)
-- ============================================================
CREATE TABLE IF NOT EXISTS comments (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  movie_id    UUID NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
  parent_id   UUID REFERENCES comments(id) ON DELETE CASCADE,
  content     TEXT NOT NULL CHECK (length(content) BETWEEN 1 AND 2000),
  is_approved BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comments_movie   ON comments(movie_id);
CREATE INDEX IF NOT EXISTS idx_comments_approved ON comments(is_approved);

-- ============================================================
-- FAVORITES (sevimlilar)
-- ============================================================
CREATE TABLE IF NOT EXISTS favorites (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  movie_id   UUID NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, movie_id)
);

-- ============================================================
-- WATCHLIST (keyinroq ko'raman)
-- ============================================================
CREATE TABLE IF NOT EXISTS watchlist (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  movie_id   UUID NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, movie_id)
);

-- ============================================================
-- WATCH_HISTORY (ko'rish tarixi)
-- ============================================================
CREATE TABLE IF NOT EXISTS watch_history (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  movie_id    UUID NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
  episode_id  UUID REFERENCES episodes(id) ON DELETE SET NULL,
  progress    INTEGER DEFAULT 0,   -- sekundlarda
  duration    INTEGER DEFAULT 0,   -- sekundlarda
  watched_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, movie_id, episode_id)
);

-- ============================================================
-- Ko'rishlar sonini oshirish (RPC funksiya)
-- ============================================================
CREATE OR REPLACE FUNCTION increment_views(movie_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE movies SET views = views + 1 WHERE id = movie_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profillarni ko'rish" ON profiles FOR SELECT USING (true);
CREATE POLICY "O'z profilini yangilash" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Movies (ochiq o'qish, faqat admin yozadi)
ALTER TABLE movies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Filmlarni ko'rish" ON movies FOR SELECT USING (is_published = true OR auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'moderator')));
CREATE POLICY "Admin yozishi" ON movies FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'moderator')));

-- Ratings
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reyting ko'rish" ON ratings FOR SELECT USING (true);
CREATE POLICY "Reyting berish" ON ratings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Reyting yangilash" ON ratings FOR UPDATE USING (auth.uid() = user_id);

-- Comments
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Izohlarni ko'rish" ON comments FOR SELECT USING (is_approved = true);
CREATE POLICY "Izoh yozish" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin moderatsiya" ON comments FOR UPDATE USING (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'moderator')));
CREATE POLICY "Izohni o'chirish" ON comments FOR DELETE USING (auth.uid() = user_id OR auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'moderator')));

-- Favorites
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "O'z sevimlilari" ON favorites FOR ALL USING (auth.uid() = user_id);

-- Watchlist
ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "O'z ro'yxati" ON watchlist FOR ALL USING (auth.uid() = user_id);

-- Watch history
ALTER TABLE watch_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "O'z tarixi" ON watch_history FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- Supabase Storage buckets
-- ============================================================
-- SQL orqali yaratish (yoki Supabase dashboard'dan qilish mumkin):
-- INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true) ON CONFLICT DO NOTHING;

-- Storage RLS
-- CREATE POLICY "Hamma ko'rishi" ON storage.objects FOR SELECT USING (bucket_id = 'media');
-- CREATE POLICY "Admin yuklashi" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'media' AND auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'moderator')));
