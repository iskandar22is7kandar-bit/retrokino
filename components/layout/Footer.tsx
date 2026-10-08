"use client";

import Image from "next/image";
import Link from "next/link";
import { Film, Send, Instagram, Youtube } from "lucide-react";

const LINKS = {
  kontent: [
    { href: "/films",    label: "Filmlar"     },
    { href: "/serials",  label: "Seriallar"   },
    { href: "/cartoons", label: "Multfilmlar" },
    { href: "/klassika", label: "Klassika"    },
  ],
  kompaniya: [
    { href: "/about",   label: "Biz haqimizda" },
    { href: "/contact", label: "Aloqa"          },
    { href: "/privacy", label: "Maxfiylik"      },
  ],
};

const SOCIAL = [
  { href: "#", icon: <Send size={16}/>,       label: "Telegram"  },
  { href: "#", icon: <Instagram size={16}/>,  label: "Instagram" },
  { href: "#", icon: <Youtube size={16}/>,    label: "YouTube"   },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer style={{ background: "#F1E9D2", borderTop: "1px solid rgba(0,0,0,0.1)", marginTop: "4rem" }}>

      {/* Yuqori oltin chiziq */}
      <div
        className="h-px w-full"
        style={{ background: "linear-gradient(90deg, transparent, rgba(217,164,65,0.4) 40%, rgba(217,164,65,0.4) 60%, transparent)" }}
      />

      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-10">

          {/* Logo va tavsif */}
          <div className="md:col-span-2 lg:col-span-2">
            <Link href="/" className="flex items-center mb-4">
              <div className="relative shrink-0" style={{ height: "100px", width: "100px" }}>
                <Image
                  src="/logo-new.png"
                  alt="RetroKino logo"
                  fill
                  className="object-contain"
                  priority
                  sizes="100px"
                />
              </div>
            </Link>

            {/* Tagline */}
            <p
              className="text-[0.85rem] leading-relaxed mb-6"
              style={{ color: "#764838", fontStyle: "italic", fontFamily: "var(--font-serif)" }}
            >
              &ldquo;Kino — bu faqat tomosha emas, bu xotira.&rdquo;
            </p>

            {/* Ijtimoiy tarmoqlar */}
            <div className="flex items-center gap-2">
              {SOCIAL.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200"
                  style={{ background: "rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.1)", color: "#764838" }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.background = "rgba(217,164,65,0.1)";
                    el.style.borderColor = "rgba(217,164,65,0.3)";
                    el.style.color = "#D9A441";
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.background = "rgba(0,0,0,0.06)";
                    el.style.borderColor = "rgba(0,0,0,0.1)";
                    el.style.color = "#764838";
                  }}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Kontent */}
          <div>
            <h4 className="text-[0.72rem] font-semibold tracking-[0.12em] uppercase mb-4" style={{ color: "#D9A441" }}>
              Kontent
            </h4>
            <ul className="space-y-2.5">
              {LINKS.kontent.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-[0.85rem] transition-colors duration-150"
                    style={{ color: "#764838" }}
                    onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = "#764838"}
                    onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = "#764838"}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Kompaniya */}
          <div>
            <h4 className="text-[0.72rem] font-semibold tracking-[0.12em] uppercase mb-4" style={{ color: "#D9A441" }}>
              Kompaniya
            </h4>
            <ul className="space-y-2.5">
              {LINKS.kompaniya.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-[0.85rem] transition-colors duration-150"
                    style={{ color: "#764838" }}
                    onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = "#764838"}
                    onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = "#764838"}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* App CTA */}
          <div>
            <h4 className="text-[0.72rem] font-semibold tracking-[0.12em] uppercase mb-4" style={{ color: "#D9A441" }}>
              Tomosha boshlash
            </h4>
            <p className="text-[0.8rem] mb-4" style={{ color: "#764838" }}>
              Sevimli filmlaringizni istalgan qurilmada tomosha qiling.
            </p>
            <Link
              href="/films"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-[0.8rem] font-medium transition-all duration-200"
              style={{
                background: "rgba(217,164,65,0.1)",
                border: "1px solid rgba(217,164,65,0.25)",
                color: "#D9A441",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.background = "rgba(217,164,65,0.16)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.background = "rgba(217,164,65,0.1)";
              }}
            >
              <Film size={14}/> Boshlash
            </Link>
          </div>
        </div>

        {/* Ajratuvchi */}
        <div
          className="mt-12 mb-6"
          style={{ height: "1px", background: "rgba(0,0,0,0.08)" }}
        />

        {/* Quyi qism */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[0.75rem]" style={{ color: "#764838" }}>
            © {year} RetroKino. Barcha huquqlar himoyalangan.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-[0.72rem]" style={{ color: "#764838" }}>O&apos;zbekiston</span>
            <span
              className="text-[0.72rem] px-2 py-0.5 rounded"
              style={{ background: "rgba(0,0,0,0.06)", color: "#764838" }}
            >
              HD
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
