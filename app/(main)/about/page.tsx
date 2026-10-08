import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Biz haqimizda",
  description:
    "RetroKino — 80–90-yillar klassik kinosini qayta kashf etish uchun VHS estetikasidagi arxiv.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-20">
      <div className="bg-[#1a1a1a] border-b border-[#764838] py-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <p className="text-vhs text-[0.55rem] text-[#764838] tracking-widest mb-2">
            ABOUT · REWIND
          </p>
          <h1 className="text-vhs text-[#764838] tracking-widest text-2xl">
            BIZ HAQIMIZDA
          </h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8 text-[0.9rem] text-[#764838] leading-relaxed">
        <p>
          RetroKino — unutilgan durdonalarni qayta kashf etish uchun yaratilgan katalog.
          Maqsadimiz oddiy: 60–2000-yillar oralig‘idagi milliy va xorijiy filmlar,
          seriallar va multfilmlarni bitta VHS ruhidagi arxivda jamlab, ularni qulay
          tomosha qilish.
        </p>

        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { title: "ARXIV", text: "Klassik posterlar, o‘n yilliklar va janrlar bo‘yicha tartib." },
            { title: "TOMOSHA", text: "Sifat tanlash, serial epizodlari va ko‘rish tarixi." },
            { title: "JAMOA", text: "Sevimlilar, reyting, izohlar va keyinroq ko‘raman ro‘yxati." },
          ].map((item) => (
            <div key={item.title} className="bg-[#252525] border border-[#764838] p-5">
              <h2 className="text-vhs text-[0.65rem] text-[#764838] tracking-widest mb-2">
                {item.title}
              </h2>
              <p className="text-[0.8rem] text-[#764838]">{item.text}</p>
            </div>
          ))}
        </div>

        <p>
          Sayt videoprokat davrining estetikasini saqlaydi: kulrang fon, qaymoq rang,
          scanline va kasseta dekorlari. Kontent esa hozirgi kun uchun: qidiruv, filtrlar
          va shaxsiy profil.
        </p>

        <div className="flex flex-wrap gap-3">
          <Link href="/films" className="btn-retro btn-retro-filled text-[0.65rem]">
            Katalogga o‘tish
          </Link>
          <Link href="/contact" className="btn-retro text-[0.65rem]">
            Aloqa
          </Link>
        </div>
      </div>
    </div>
  );
}
