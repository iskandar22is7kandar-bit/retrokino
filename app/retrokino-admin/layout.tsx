"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Film, Tv, Sparkles, Tag,
  BarChart3, Menu, X, LogOut,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { adminLogout } from "./actions";

const NAV = [
  {
    href:  "/retrokino-admin",
    label: "Dashboard",
    icon:  LayoutDashboard,
    exact: true,
  },
  {
    label: "Filmlar",
    icon:  Film,
    children: [
      { href: "/retrokino-admin/movies?type=film&cat=national",  label: "Milliy filmlar"  },
      { href: "/retrokino-admin/movies?type=film&cat=foreign",   label: "Xorijiy filmlar" },
    ],
  },
  {
    label: "Seriallar",
    icon:  Tv,
    children: [
      { href: "/retrokino-admin/movies?type=serial&cat=serial-nat", label: "Milliy seriallar"  },
      { href: "/retrokino-admin/movies?type=serial&cat=serial-for", label: "Xorijiy seriallar" },
    ],
  },
  {
    label: "Multfilmlar",
    icon:  Sparkles,
    children: [
      { href: "/retrokino-admin/movies?type=cartoon&cat=multi-uz", label: "Milliy multfilmlar"  },
      { href: "/retrokino-admin/movies?type=cartoon&cat=multi-eu", label: "Xorijiy multfilmlar" },
    ],
  },
  {
    href:  "/retrokino-admin/categories",
    label: "Kategoriyalar",
    icon:  Tag,
  },
  {
    href:  "/retrokino-admin/stats",
    label: "Statistika",
    icon:  BarChart3,
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [openGroups,  setOpenGroups]  = useState<string[]>(["Filmlar"]);
  const pathname = usePathname();

  // Login sahifasida layout yo'q
  const isLoginPage = pathname === "/retrokino-admin/login";
  if (isLoginPage) return <>{children}</>;

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  return (
    <div className="min-h-screen flex" style={{ background: "#F1E9D2" }}>

      {/* ── SIDEBAR ── */}
      <motion.aside
        animate={{ width: sidebarOpen ? 240 : 56 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="flex-shrink-0 flex flex-col overflow-hidden"
        style={{ background: "#EAE0C6", borderRight: "1px solid rgba(0,0,0,0.1)" }}
      >
        {/* Sarlavha */}
        <div
          className="flex items-center h-14 px-4 gap-2 flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(0,0,0,0.08)" }}
        >
          <AnimatePresence>
            {sidebarOpen && (
              <motion.span
                className="text-vhs text-[0.75rem] tracking-widest flex-1 whitespace-nowrap"
                style={{ color: "#764838" }}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                RETRO<span style={{ color: "#D9A441" }}>ADMIN</span>
              </motion.span>
            )}
          </AnimatePresence>
          <motion.button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded flex-shrink-0"
            style={{ color: "#764838" }}
            whileHover={{ background: "rgba(0,0,0,0.06)" }}
            whileTap={{ scale: 0.9 }}
            aria-label="Menyu"
          >
            <motion.div
              animate={{ rotate: sidebarOpen ? 0 : 180 }}
              transition={{ duration: 0.3 }}
            >
              {sidebarOpen ? <X size={15} /> : <Menu size={15} />}
            </motion.div>
          </motion.button>
        </div>



        {/* Nav */}
        <nav className="flex-1 py-2 overflow-y-auto overflow-x-hidden">
          {NAV.map((item, navIdx) => {

            // Oddiy link
            if ("href" in item && item.href) {
              const isActive = (item as any).exact
                ? pathname === item.href
                : pathname.startsWith(item.href);

              return (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: navIdx * 0.05, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link href={item.href}>
                    <motion.div
                      className="flex items-center gap-3 px-4 py-2.5 cursor-pointer"
                      style={{
                        background: isActive ? "rgba(217,164,65,0.12)" : "transparent",
                        color:      isActive ? "#D9A441" : "#764838",
                        borderLeft: isActive ? "2px solid #D9A441" : "2px solid transparent",
                      }}
                      whileHover={{
                        background: isActive ? "rgba(217,164,65,0.15)" : "rgba(0,0,0,0.05)",
                        x: 2,
                      }}
                      transition={{ duration: 0.15 }}
                    >
                      <motion.div
                        animate={{ scale: isActive ? 1.15 : 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <item.icon size={15} className="flex-shrink-0" />
                      </motion.div>
                      <AnimatePresence>
                        {sidebarOpen && (
                          <motion.span
                            className="text-vhs text-[0.58rem] tracking-wider uppercase whitespace-nowrap"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                          >
                            {item.label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                      {isActive && (
                        <motion.div
                          className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ background: "#D9A441" }}
                          layoutId="activeNavDot"
                          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        />
                      )}
                    </motion.div>
                  </Link>
                </motion.div>
              );
            }

            // Guruh (dropdown)
            const isOpen = openGroups.includes(item.label);
            const isGroupActive = item.children?.some((c) =>
              pathname.startsWith(c.href.split("?")[0])
            );

            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: navIdx * 0.05, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Guruh header */}
                <motion.button
                  onClick={() => sidebarOpen && toggleGroup(item.label)}
                  className="flex items-center gap-3 px-4 py-2.5 w-full text-left"
                  style={{
                    background: isGroupActive ? "rgba(217,164,65,0.06)" : "transparent",
                    color:      isGroupActive ? "#D9A441" : "#764838",
                    borderLeft: isGroupActive ? "2px solid rgba(217,164,65,0.4)" : "2px solid transparent",
                  }}
                  whileHover={{
                    background: isGroupActive ? "rgba(217,164,65,0.1)" : "rgba(0,0,0,0.05)",
                    x: 2,
                  }}
                  transition={{ duration: 0.15 }}
                >
                  <motion.div
                    animate={{ scale: isGroupActive ? 1.15 : 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <item.icon size={15} className="flex-shrink-0" />
                  </motion.div>
                  <AnimatePresence>
                    {sidebarOpen && (
                      <motion.div
                        className="flex items-center flex-1 min-w-0"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        <span className="text-vhs text-[0.58rem] tracking-wider uppercase flex-1 whitespace-nowrap">
                          {item.label}
                        </span>
                        <motion.div
                          animate={{ rotate: isOpen ? 180 : 0 }}
                          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                        >
                          <ChevronDown size={12} />
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>

                {/* Alt-linklar */}
                <AnimatePresence>
                  {sidebarOpen && isOpen && item.children && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      style={{ overflow: "hidden", background: "rgba(0,0,0,0.03)" }}
                    >
                      {item.children.map((child, childIdx) => {
                        const childActive =
                          pathname === child.href ||
                          (pathname + (typeof window !== "undefined" ? window.location.search : "")) === child.href;

                        return (
                          <motion.div
                            key={child.href}
                            initial={{ opacity: 0, x: -12 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{
                              delay: childIdx * 0.06,
                              duration: 0.25,
                              ease: [0.16, 1, 0.3, 1],
                            }}
                          >
                            <Link href={child.href}>
                              <motion.div
                                className="flex items-center gap-2 pl-10 pr-4 py-2 text-[0.6rem]"
                                style={{
                                  color:      childActive ? "#D9A441" : "#764838",
                                  background: childActive ? "rgba(217,164,65,0.1)" : "transparent",
                                  fontFamily: "var(--font-mono)",
                                  letterSpacing: "0.04em",
                                }}
                                whileHover={{
                                  background: childActive
                                    ? "rgba(217,164,65,0.15)"
                                    : "rgba(0,0,0,0.05)",
                                  x: 3,
                                }}
                                transition={{ duration: 0.12 }}
                              >
                                <motion.span
                                  className="w-1 h-1 rounded-full flex-shrink-0"
                                  animate={{
                                    scale: childActive ? 1.8 : 1,
                                    background: childActive ? "#D9A441" : "#764838",
                                  }}
                                  style={{ opacity: 0.6 }}
                                  transition={{ duration: 0.2 }}
                                />
                                <span className="whitespace-nowrap">{child.label}</span>
                              </motion.div>
                            </Link>
                          </motion.div>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </nav>

        {/* Chiqish */}
        <div className="p-3 flex-shrink-0" style={{ borderTop: "1px solid rgba(0,0,0,0.08)" }}>
          <form action={adminLogout}>
            <motion.button
              type="submit"
              className="flex items-center gap-3 w-full px-2 py-2 rounded"
              style={{ color: "#764838" }}
              whileHover={{ color: "#E8341C", background: "rgba(232,52,28,0.06)" }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.15 }}
            >
              <LogOut size={15} className="flex-shrink-0" />
              <AnimatePresence>
                {sidebarOpen && (
                  <motion.span
                    className="text-vhs text-[0.6rem] tracking-wider uppercase whitespace-nowrap"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    Chiqish
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </form>
        </div>
      </motion.aside>

      {/* ── MAIN ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <motion.div
          className="h-14 flex items-center px-6 gap-3 flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(0,0,0,0.08)", background: "#EAE0C6" }}
          initial={{ y: -56, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="text-vhs text-[0.6rem] tracking-widest" style={{ color: "#764838" }}>
            RETROKINO
          </span>
          <span style={{ color: "#764838", opacity: 0.3 }}>/</span>
          <motion.span
            key={pathname}
            className="text-[0.75rem]"
            style={{ color: "#764838" }}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            {pathname.split("/").filter(Boolean).pop()?.replace(/-/g, " ").toUpperCase() || "DASHBOARD"}
          </motion.span>
          <div className="ml-auto">
            <Link
              href="/"
              target="_blank"
              className="text-[0.65rem] transition-opacity hover:opacity-100"
              style={{ color: "#764838", opacity: 0.45 }}
            >
              Saytni ko&apos;rish →
            </Link>
          </div>
        </motion.div>

        {/* Content */}
        <main className="flex-1 overflow-auto">
          <motion.div
            key={pathname}
            className="p-6"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
