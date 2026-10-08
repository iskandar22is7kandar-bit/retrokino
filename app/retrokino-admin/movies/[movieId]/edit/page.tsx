import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import MovieForm from "../../_components/MovieForm";

interface PageProps {
  params: Promise<{ movieId: string }>;
}

export default async function EditMoviePage({ params }: PageProps) {
  const { movieId } = await params;

  const supabase = await createClient();
  const { data: movie } = await supabase
    .from("movies")
    .select("id, title_uz, title_ru")
    .eq("id", movieId)
    .single();

  if (!movie) notFound();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-vhs text-xl tracking-widest" style={{ color: "#764838" }}>
          TAHRIRLASH
        </h1>
        <p className="text-[0.75rem] mt-1" style={{ color: "#764838", opacity: 0.6 }}>
          {movie.title_uz || movie.title_ru}
        </p>
      </div>

      <MovieForm movieId={movieId} />
    </div>
  );
}
