"use client";

import Link from "next/link";
import { Home } from "lucide-react";

export default function BackToHome() {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-2 group"
      style={{ color: "#764838" }}
      onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = "#D9A441"}
      onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = "#764838"}
    >
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200"
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        <Home size={14} />
      </div>
      <span className="text-[0.8rem] font-medium transition-colors duration-200">
        Bosh sahifa
      </span>
    </Link>
  );
}
