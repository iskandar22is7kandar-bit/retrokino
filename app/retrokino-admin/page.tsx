import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Film, Eye, MessageSquare, TrendingUp, Plus, Tv, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [moviesRes, commentsRes] = await Promise.all([
    supabase.from("movies").select("id, type, views, is_published", { count: "exact" }),
    supabase.from("comments").select("id, is_approved", { count: "exact" }),
  ]);

  const movies      = moviesRes.data || [];
  const totalViews  = movies.reduce((s, m) => s + (m.views || 0), 0);
  const films       = movies.filter((m) => m.type === "film").length;
  const serials     = movies.filter((m) => m.type === "serial").length;
  const cartoons    = movies.filter((m) => m.type === "cartoon").length;
  const published   = movies.filter((m) => m.is_published).length;
  const pending     = (commentsRes.data || []).filter((c) => !c.is_approved).length;

  const statCards = [
    { label: "Jami kontent",     value: moviesRes.count || 0,        icon: Film,          sub: `${published} ta nashr qilingan` },
    { label: "Ko'rishlar",       value: totalViews.toLocaleString(),  icon: Eye,           sub: "Jami barcha ko'rishlar" },
    { label: "Kutuvchi izohlar", value: pending,                      icon: MessageSquare, sub: "Moderatsiya kerak" },
    { label: "Kontent",          value: `${films}/${serials}/${cartoons}`, icon: TrendingUp, sub: "Film / Serial / Multfilm" },
  ];

  const quickAdd = [
    { href: "/retrokino-admin/movies/new?type=film&cat=national",    label: "Milliy film",       icon: Film     },
    { href: "/retrokino-admin/movies/new?type=film&cat=foreign",     label: "Xorijiy film",      icon: Film     },
    { href: "/retrokino-admin/movies/new?type=serial&cat=serial-nat",label: "Milliy serial",     icon: Tv       },
    { href: "/retrokino-admin/movies/new?type=serial&cat=serial-for",label: "Xorijiy serial",    icon: Tv       },
    { href: "/retrokino-admin/movies/new?type=cartoon&cat=multi-uz", label: "Milliy multfilm",   icon: Sparkles },
    { href: "/retrokino-admin/movies/new?type=cartoon&cat=multi-eu", label: "Xorijiy multfilm",  icon: Sparkles },
  ];

  const typeCards = [
    { type: "film",    label: "Filmlar",     count: films,   icon: Film,     color: "#D9A441" },
    { type: "serial",  label: "Seriallar",   count: serials, icon: Tv,       color: "#764838" },
    { type: "cartoon", label: "Multfilmlar", count: cartoons,icon: Sparkles, color: "#A07830" },
  ];

  return (
    <div>
      {/* Sarlavha */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <div>
          <h1 className="text-vhs text-xl tracking-widest" style={{ color: "#764838" }}>DASHBOARD</h1>
          <p className="text-[0.7rem] mt-1" style={{ color: "#764838", opacity: 0.6 }}>
            RetroKino boshqaruv paneli
          </p>
        </div>
        <Link
          href="/retrokino-admin/movies/new"
          className="btn-retro btn-retro-filled flex items-center gap-2 text-[0.65rem]"
        >
          <Plus size={12} /> Yangi film
        </Link>
      </div>

      {/* Statistika kartalar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(({ label, value, icon: Icon, sub }) => (
          <div
            key={label}
            className="p-5"
            style={{ background: "#EDE3CC", border: "1px solid rgba(0,0,0,0.1)" }}
          >
            <div className="flex items-start justify-between mb-3">
              <Icon size={18} style={{ color: "#764838" }} />
              <span className="text-vhs text-xl font-bold" style={{ color: "#764838" }}>{value}</span>
            </div>
            <p className="text-vhs text-[0.58rem] tracking-wider uppercase" style={{ color: "#764838" }}>{label}</p>
            <p className="text-[0.65rem] mt-0.5" style={{ color: "#764838", opacity: 0.6 }}>{sub}</p>
          </div>
        ))}
      </div>

      {/* Tezkor qo'shish */}
      <div className="mb-8">
        <p className="text-vhs text-[0.6rem] tracking-widest mb-4" style={{ color: "#764838" }}>
          TEZKOR QO&apos;SHISH
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {quickAdd.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-4 py-3.5 transition-colors"
              style={{
                background: "#EDE3CC",
                border: "1px solid rgba(0,0,0,0.1)",
              }}
            >
              <Plus size={13} style={{ color: "#D9A441", flexShrink: 0 }} />
              <Icon  size={13} style={{ color: "#764838", flexShrink: 0 }} />
              <span className="text-vhs text-[0.58rem] tracking-wider uppercase" style={{ color: "#764838" }}>
                {label}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Kontent turlari */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {typeCards.map(({ type, label, count, icon: Icon, color }) => (
          <Link
            key={type}
            href={`/retrokino-admin/movies?type=${type}`}
            className="flex items-center gap-4 p-4 transition-colors"
            style={{ background: "#EDE3CC", border: "1px solid rgba(0,0,0,0.1)" }}
          >
            <div
              className="w-10 h-10 rounded flex items-center justify-center flex-shrink-0"
              style={{ background: `${color}18` }}
            >
              <Icon size={18} style={{ color }} />
            </div>
            <div>
              <p className="text-vhs text-[0.58rem] tracking-wider uppercase" style={{ color: "#764838" }}>
                {label}
              </p>
              <p className="text-xl font-bold mt-0.5" style={{ color: "#764838" }}>{count}</p>
            </div>
            <span className="ml-auto text-[0.8rem]" style={{ color: "#764838", opacity: 0.4 }}>→</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
