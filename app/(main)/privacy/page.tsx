import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Maxfiylik siyosati",
  description: "RetroKino foydalanuvchi ma’lumotlari va cookie siyosati.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen pt-20">
      <div className="bg-[#1a1a1a] border-b border-[#764838] py-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <p className="text-vhs text-[0.55rem] text-[#764838] tracking-widest mb-2">
            LEGAL · TAPE LOG
          </p>
          <h1 className="text-vhs text-[#764838] tracking-widest text-2xl">
            MAXFIYLIK SIYOSATI
          </h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8 text-[0.88rem] text-[#764838] leading-relaxed">
        <section>
          <h2 className="text-vhs text-[0.7rem] text-[#764838] tracking-widest mb-3">
            QANDAY MA’LUMOTLAR
          </h2>
          <p>
            Hisob ochganda email, ixtiyoriy foydalanuvchi nomi va avatar saqlanadi.
            Sevimlilar, keyinroq ko‘raman ro‘yxati, ko‘rish tarixi, reyting va izohlar
            shaxsiy profilingizga bog‘lanadi.
          </p>
        </section>
        <section>
          <h2 className="text-vhs text-[0.7rem] text-[#764838] tracking-widest mb-3">
            NIMA UCHUN
          </h2>
          <p>
            Ma’lumotlar autentifikatsiya, tavsiyalar, izoh moderatsiyasi va sayt
            statistikasi uchun ishlatiladi. Reklama tarmoqlariga sotilmaydi.
          </p>
        </section>
        <section>
          <h2 className="text-vhs text-[0.7rem] text-[#764838] tracking-widest mb-3">
            COOKIE
          </h2>
          <p>
            Kirish sessiyasi Supabase cookie orqali saqlanadi. Qidiruv tarixi brauzer
            localStorage’da qoladi va istalgan vaqtda tozalashingiz mumkin.
          </p>
        </section>
        <section>
          <h2 className="text-vhs text-[0.7rem] text-[#764838] tracking-widest mb-3">
            HUQUQLAR
          </h2>
          <p>
            Profilingizdagi ismni o‘zgartirish mumkin. Hisobni o‘chirish yoki ma’lumot
            so‘rash uchun aloqa sahifasi orqali yozing.
          </p>
        </section>
      </div>
    </div>
  );
}
