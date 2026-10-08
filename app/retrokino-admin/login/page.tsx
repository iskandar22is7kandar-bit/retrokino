import { adminLogin } from "../actions";
import { Lock } from "lucide-react";

interface PageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function AdminLoginPage({ searchParams }: PageProps) {
  const { error } = await searchParams;

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "#F1E9D2" }}
    >
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
            style={{ background: "#EDE3CC", border: "1px solid rgba(0,0,0,0.12)" }}
          >
            <Lock size={26} style={{ color: "#764838" }} />
          </div>
          <h1 className="text-vhs text-xl tracking-widest" style={{ color: "#764838" }}>
            ADMIN PANEL
          </h1>
          <p className="text-[0.72rem] mt-1.5" style={{ color: "#764838", opacity: 0.55 }}>
            RetroKino boshqaruv tizimi
          </p>
        </div>

        {/* Xato */}
        {error && (
          <div
            className="flex items-center gap-2 px-4 py-3 rounded-lg mb-4 text-[0.8rem]"
            style={{
              background: "rgba(232,52,28,0.08)",
              border: "1px solid rgba(232,52,28,0.2)",
              color: "#E8341C",
            }}
          >
            <Lock size={13} />
            Noto&apos;g&apos;ri parol. Qayta urinib ko&apos;ring.
          </div>
        )}

        {/* Forma */}
        <form action={adminLogin}>
          <div
            className="p-6 space-y-5"
            style={{ background: "#EDE3CC", border: "1px solid rgba(0,0,0,0.1)" }}
          >
            <div>
              <label
                htmlFor="password"
                className="text-vhs text-[0.55rem] tracking-widest block mb-2 uppercase"
                style={{ color: "#764838" }}
              >
                Parol
              </label>
              <input
                id="password"
                name="password"
                type="password"
                className="input-retro"
                placeholder="••••••••••"
                required
                autoFocus
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="btn-retro btn-retro-filled w-full flex items-center justify-center gap-2"
            >
              <Lock size={13} />
              Kirish
            </button>
          </div>
        </form>

        <p className="text-center text-[0.65rem] mt-4" style={{ color: "#764838", opacity: 0.35 }}>
          Faqat administratorlar uchun
        </p>
      </div>
    </div>
  );
}
