import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Pencil, Eye, EyeOff } from "lucide-react";
import MovieAdminActions from "@/components/admin/MovieAdminActions";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ q?: string; type?: string; cat?: string; page?: string }>;
}

const TYPE_LABELS: Record<string, string> = {
  film:    "Film",
  serial:  "Serial",
  cartoon: "Multfilm",
};

const CAT_LABELS: Record<string, string> = {
  national: "Milliy",
  foreign:  "Xorijiy",
};

export default async function AdminMoviesPage({ searchParams }: PageProps) {
  const { q, type, cat, page: pageStr } = await searchParams;

  const supabase = await createClient();
  const page  = Number(pageStr || 1);
  const limit = 25;
  const from  = (page - 1) * limit;

  // Kategoriya id ni cat slug dan topish
  let categoryId: string | null = null;
  if (cat) {
    const { data: catData } = await supabase
      .from("categories")
      .select("id")
      .ilike("slug", `%${cat}%`)
      .maybeSingle();
    categoryId = catData?.id ?? null;
  }

  let query = supabase
    .from("movies")
    .select(
      "id, slug, title_uz, title_ru, type, year, views, is_published, rating_avg, poster_url, category_id",
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(from, from + limit - 1);

  if (q)          query = query.ilike("title_uz", `%${q}%`);
  if (type)       query = query.eq("type", type);
  if (categoryId) query = query.eq("category_id", categoryId);

  const { data: movies, count } = await query;
  const totalPages = Math.ceil((count || 0) / limit);

  const title = [
    type    ? TYPE_LABELS[type]    : null,
    cat     ? CAT_LABELS[cat]      : null,
  ].filter(Boolean).join(" — ") || "Barcha kontent";

  return (
    <div>
      {/* Sarlavha */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-vhs text-xl tracking-widest" style={{ color: "#764838" }}>
            {title.toUpperCase()}
          </h1>
          <p className="text-[0.7rem] mt-1" style={{ color: "#764838", opacity: 0.6 }}>
            Jami: {count || 0} ta
          </p>
        </div>
      </div>

      {/* Qidiruv */}
      <div className="flex flex-wrap gap-2 mb-5">
        <form className="flex items-center gap-2" method="GET" action="/retrokino-admin/movies">
          {type && <input type="hidden" name="type" value={type} />}
          {cat  && <input type="hidden" name="cat"  value={cat}  />}
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Nom bo'yicha qidirish..."
            className="input-retro py-1.5 text-[0.8rem] w-48"
          />
        </form>
      </div>

      {/* Jadval */}
      <div
        className="overflow-x-auto"
        style={{ border: "1px solid rgba(0,0,0,0.1)" }}
      >
        <table className="w-full min-w-[700px]">
          <thead>
            <tr style={{ background: "#E0D6BC", borderBottom: "1px solid rgba(0,0,0,0.1)" }}>
              {["Poster", "Nomi", "Turi", "Yil", "Ko'rishlar", "Reyting", "Holati", ""].map((h) => (
                <th
                  key={h}
                  className="text-left px-4 py-3 text-vhs text-[0.52rem] tracking-widest uppercase"
                  style={{ color: "#764838" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(movies || []).length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-12">
                  <p className="text-vhs text-[0.6rem] tracking-widest" style={{ color: "#764838", opacity: 0.4 }}>
                    HECH NARSA TOPILMADI
                  </p>
                </td>
              </tr>
            ) : (
              (movies || []).map((movie, idx) => (
                <tr
                  key={movie.id}
                  style={{
                    background: idx % 2 === 0 ? "#EDE3CC" : "#EAE0C6",
                    borderBottom: "1px solid rgba(0,0,0,0.05)",
                  }}
                >
                  {/* Poster */}
                  <td className="px-4 py-2.5">
                    <div
                      className="w-8 h-12 overflow-hidden flex-shrink-0"
                      style={{ background: "#DDD0A5" }}
                    >
                      {(movie as any).poster_url ? (
                        <img
                          src={(movie as any).poster_url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-[0.5rem]" style={{ color: "#764838" }}>—</span>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Nomi */}
                  <td className="px-4 py-2.5 max-w-[220px]">
                    <p className="text-[0.78rem] font-medium truncate" style={{ color: "#764838" }}>
                      {(movie as any).title_uz || (movie as any).title_ru}
                    </p>
                    {(movie as any).title_ru && (
                      <p className="text-[0.65rem] truncate mt-0.5" style={{ color: "#764838", opacity: 0.5 }}>
                        {(movie as any).title_ru}
                      </p>
                    )}
                  </td>

                  {/* Turi */}
                  <td className="px-4 py-2.5">
                    <span className="badge-retro text-[0.5rem]">
                      {TYPE_LABELS[(movie as any).type] || (movie as any).type}
                    </span>
                  </td>

                  {/* Yil */}
                  <td className="px-4 py-2.5">
                    <span className="text-[0.72rem]" style={{ color: "#764838" }}>
                      {(movie as any).year}
                    </span>
                  </td>

                  {/* Ko'rishlar */}
                  <td className="px-4 py-2.5">
                    <span className="text-[0.72rem]" style={{ color: "#764838" }}>
                      {((movie as any).views || 0).toLocaleString()}
                    </span>
                  </td>

                  {/* Reyting */}
                  <td className="px-4 py-2.5">
                    <span className="text-[0.72rem]" style={{ color: "#D9A441" }}>
                      ★ {((movie as any).rating_avg || 0).toFixed(1)}
                    </span>
                  </td>

                  {/* Holat */}
                  <td className="px-4 py-2.5">
                    <span className={`badge-retro text-[0.5rem] ${(movie as any).is_published ? "active" : ""}`}>
                      {(movie as any).is_published ? "Aktiv" : "Yashirin"}
                    </span>
                  </td>

                  {/* Amallar */}
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/retrokino-admin/movies/${movie.id}/edit`}
                        className="p-1.5 rounded transition-colors"
                        style={{ color: "#764838" }}
                        title="Tahrirlash"
                      >
                        <Pencil size={13} />
                      </Link>
                      <MovieAdminActions
                        movieId={movie.id}
                        slug={(movie as any).slug}
                        isPublished={(movie as any).is_published}
                        baseUrl="/retrokino-admin"
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6 flex-wrap">
          {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/retrokino-admin/movies?page=${p}${type ? `&type=${type}` : ""}${cat ? `&cat=${cat}` : ""}`}
              className={`w-8 h-8 flex items-center justify-center text-vhs text-[0.6rem] transition-all`}
              style={{
                background: p === page ? "#764838" : "transparent",
                color:      p === page ? "#F1E9D2" : "#764838",
                border:     `1px solid ${p === page ? "#764838" : "rgba(0,0,0,0.12)"}`,
              }}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
