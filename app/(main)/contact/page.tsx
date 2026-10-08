import type { Metadata } from "next";
import ContactForm from "@/components/contact/ContactForm";

export const metadata: Metadata = {
  title: "Aloqa",
  description: "RetroKino jamoasi bilan bog‘lanish — savol, taklif va arxiv yordami.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen pt-20">
      <div className="bg-[#1a1a1a] border-b border-[#764838] py-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <p className="text-vhs text-[0.55rem] text-[#764838] tracking-widest mb-2">
            CONTACT · TRANSMIT
          </p>
          <h1 className="text-vhs text-[#764838] tracking-widest text-2xl">ALOQA</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 grid md:grid-cols-[1fr_1.2fr] gap-10">
        <div className="text-[0.85rem] text-[#764838] space-y-4">
          <p>
            Katalogdagi xato, yangi kasseta taklifi yoki hamkorlik uchun yozing.
            Xabar pochta orqali ochiladi.
          </p>
          <div className="bg-[#252525] border border-[#764838] p-4 space-y-2">
            <p className="text-vhs text-[0.55rem] text-[#764838] tracking-widest">POCHTA</p>
            <p className="text-[#764838]">hello@retrokino.uz</p>
            <p className="text-vhs text-[0.55rem] text-[#764838] tracking-widest pt-2">VAQT</p>
            <p className="text-[#764838]">Dush–Juma · 10:00–18:00</p>
          </div>
        </div>
        <div className="bg-[#252525] border border-[#764838] p-6">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
