"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { Search, Menu, X, Clapperboard, Tv2, Wand2, Clock3 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const NAV_LINKS = [
  { href: "/films",    label: "Filmlar",     icon: Clapperboard },
  { href: "/serials",  label: "Seriallar",   icon: Tv2          },
  { href: "/cartoons", label: "Multfilmlar", icon: Wand2        },
  { href: "/klassika", label: "Klassika",    icon: Clock3       },
];

export default function Header() {
  const [scrolled,    setScrolled]    = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

  const router   = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50"
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      style={{
        background: scrolled ? "rgba(241,233,210,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(16px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(118,72,56,0.1)" : "none",
        boxShadow: scrolled ? "0 4px 24px rgba(118,72,56,0.08)" : "none",
        transition: "background 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease",
      }}
    >
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-[68px] gap-6">

          {/* ── LOGO ── */}
          <Link href="/" className="flex-shrink-0" aria-label="RetroKino — Bosh sahifa">
            <motion.div
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.2 }}
            >
              <div className="relative" style={{ width: "140px", height: "140px" }}>
                <Image
                  src="/logo-new.png"
                  alt="RetroKino"
                  fill
                  priority
                  className="object-contain"
                  sizes="120px"
                />
              </div>
            </motion.div>
          </Link>

          {/* ── DESKTOP NAV ── */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link, i) => {
              const isActive  = pathname === link.href || pathname.startsWith(link.href + "/");
              const isHovered = hoveredLink === link.href;

              return (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: -16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.07, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link
                    href={link.href}
                    className="relative flex items-center gap-1.5 px-4 py-2 text-[0.875rem] font-medium tracking-wide rounded-md"
                    style={{ color: isActive ? "#D9A441" : "#764838", transition: "color 0.2s ease" }}
                    onMouseEnter={() => setHoveredLink(link.href)}
                    onMouseLeave={() => setHoveredLink(null)}
                  >
                    <AnimatePresence>
                      {isHovered && !isActive && (
                        <motion.span
                          className="absolute inset-0 rounded-md"
                          style={{ background: "rgba(118,72,56,0.07)" }}
                          initial={{ opacity: 0, scale: 0.92 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.92 }}
                          transition={{ duration: 0.15 }}
                        />
                      )}
                    </AnimatePresence>

                    {isActive && (
                      <motion.span
                        className="absolute inset-0 rounded-md"
                        style={{ background: "rgba(217,164,65,0.1)" }}
                        layoutId="activeNavBg"
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      />
                    )}

                    <motion.span
                      className="relative leading-none"
                      animate={{ scale: isHovered || isActive ? 1.2 : 1, rotate: isHovered ? 8 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <link.icon size={15} />
                    </motion.span>

                    <span className="relative">{link.label}</span>

                    {isActive && (
                      <motion.span
                        className="absolute bottom-0.5 left-4 right-4 h-[2px] rounded-full"
                        style={{ background: "linear-gradient(90deg, #D9A441, #F0C56A)" }}
                        layoutId="activeNavLine"
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      />
                    )}

                    <AnimatePresence>
                      {isHovered && !isActive && (
                        <motion.span
                          className="absolute bottom-0.5 left-4 right-4 h-[1.5px] rounded-full"
                          style={{ background: "rgba(118,72,56,0.3)" }}
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          exit={{ scaleX: 0 }}
                          transition={{ duration: 0.2 }}
                        />
                      )}
                    </AnimatePresence>
                  </Link>
                </motion.div>
              );
            })}
          </nav>

          {/* ── O'NG TOMON — faqat qidiruv ── */}
          <div className="flex items-center gap-2">

            {/* Qidiruv — doim ko'rinib turadi */}
            <form
              onSubmit={handleSearch}
              className="hidden sm:flex items-center gap-2 flex-1 max-w-sm"
            >
              <div
                className="flex items-center px-3 py-2 rounded-lg w-full transition-all duration-200"
                style={{
                  background: "rgba(118,72,56,0.07)",
                  border: "1px solid rgba(118,72,56,0.15)",
                  gap: "10px",
                }}
                onFocus={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(217,164,65,0.5)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 0 0 3px rgba(217,164,65,0.1)";
                }}
                onBlur={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(118,72,56,0.15)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "none";
                }}
              >
                <Search size={15} style={{ color: "#764838", flexShrink: 0, opacity: 0.6 }} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Film nomi, janr yoki yil..."
                  className="bg-transparent outline-none text-[0.85rem] flex-1 min-w-0"
                  style={{ color: "#764838", fontFamily: "var(--font-body)" }}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="flex-shrink-0 transition-opacity duration-150 hover:opacity-100 opacity-50"
                    style={{ color: "#764838" }}
                    aria-label="Tozalash"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </form>

            {/* Mobil hamburger */}
            <motion.button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-md"
              style={{ color: "#764838" }}
              whileHover={{ backgroundColor: "rgba(118,72,56,0.08)" }}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.15 }}
              aria-label="Menyu"
            >
              <AnimatePresence mode="wait">
                {mobileOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <X size={20} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Menu size={20} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        {/* ── MOBIL MENYU ── */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              className="lg:hidden pb-4 pt-2 overflow-hidden"
              style={{ borderTop: "1px solid rgba(118,72,56,0.1)" }}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Mobil qidiruv */}
              <form onSubmit={handleSearch} className="mb-3 mt-2">
                <div
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg"
                  style={{ background: "rgba(118,72,56,0.06)", border: "1px solid rgba(118,72,56,0.12)" }}
                >
                  <Search size={14} style={{ color: "#764838", flexShrink: 0, opacity: 0.6 }} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Film nomi, janr yoki yil..."
                    className="bg-transparent outline-none text-[0.82rem] w-full pl-1"
                    style={{ color: "#764838", fontFamily: "var(--font-body)" }}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="flex-shrink-0 opacity-50 hover:opacity-100"
                      style={{ color: "#764838" }}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </form>

              {NAV_LINKS.map((link, i) => {
                const isActive = pathname.startsWith(link.href);
                return (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Link
                      href={link.href}
                      className="flex items-center justify-between px-3 py-3 rounded-md text-[0.9rem] font-medium transition-colors"
                      style={{
                        color: isActive ? "#D9A441" : "#764838",
                        background: isActive ? "rgba(217,164,65,0.08)" : "transparent",
                        borderLeft: isActive ? "2px solid #D9A441" : "2px solid transparent",
                      }}
                    >
                      <span className="flex items-center gap-2">
                        <link.icon size={15} />
                        {link.label}
                      </span>
                      {isActive && (
                        <motion.span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: "#D9A441" }}
                          layoutId="mobileActiveDot"
                        />
                      )}
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}
