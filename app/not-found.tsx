import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#F1E9D2" }}>
      <div className="max-w-md w-full text-center">
        <p className="text-vhs text-[0.55rem] text-[#764838] tracking-[0.3em] mb-4">
          SIGNAL LOST · TRACK 404
        </p>
        <h1 className="text-vhs text-[0.55rem] text-[#764838] text-5xl tracking-widest mb-3">
          404
        </h1>
        <p className="text-[0.9rem] text-[#764838] mb-8">
          Bu kasseta topilmadi. Lenta uzilgan yoki sahifa arxivdan olib tashlangan.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/" className="btn-retro btn-retro-filled text-[0.65rem]">
            Bosh sahifa
          </Link>
          <Link href="/films" className="btn-retro text-[0.65rem]">
            Filmlar katalogi
          </Link>
        </div>
      </div>
    </div>
  );
}
