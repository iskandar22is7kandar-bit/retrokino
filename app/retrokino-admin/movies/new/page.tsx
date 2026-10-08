import MovieForm from "../_components/MovieForm";

interface PageProps {
  searchParams: Promise<{ type?: string; cat?: string }>;
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

export default async function NewMoviePage({ searchParams }: PageProps) {
  const { type = "film", cat = "" } = await searchParams;

  const subTitle = [CAT_LABELS[cat], TYPE_LABELS[type]].filter(Boolean).join(" ");

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-vhs text-xl tracking-widest" style={{ color: "#764838" }}>
          YANGI {subTitle.toUpperCase()} QO&apos;SHISH
        </h1>
        <p className="text-[0.7rem] mt-1" style={{ color: "#764838", opacity: 0.6 }}>
          Barcha majburiy maydonlarni to&apos;ldiring
        </p>
      </div>

      <MovieForm defaultType={type} defaultCat={cat} />
    </div>
  );
}
