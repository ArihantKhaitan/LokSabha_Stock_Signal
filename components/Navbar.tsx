"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/",            label: "Overview"    },
  { href: "/explorer",    label: "Explorer"    },
  { href: "/correlation", label: "Correlation" },
  { href: "/deep-dive",   label: "Deep Dive"   },
  { href: "/methodology", label: "Methodology" },
];

export default function Navbar() {
  const path = usePathname();

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50"
      style={{ background: "#1A0800", borderBottom: "1px solid rgba(224,88,24,0.2)", height: 56 }}
    >
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <motion.div
            className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-sm"
            style={{ background: "linear-gradient(135deg, #E05818, #C04010)" }}
            whileHover={{ scale: 1.08, rotate: 3 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            🏛
          </motion.div>
          <span
            className="font-bold text-[15px] tracking-tight hidden sm:inline"
            style={{ color: "#F5EDD8" }}
          >
            LokSabha{" "}
            <span style={{ color: "#E05818" }}>Stock Signal</span>
          </span>
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-0.5">
          {NAV.map((item) => {
            const active = path === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <motion.span
                  className={cn(
                    "relative px-3 py-1.5 rounded-full text-[13px] font-medium transition-colors",
                    active ? "" : "hover:text-[#F5EDD8]"
                  )}
                  style={{ color: active ? "#F5EDD8" : "rgba(245,237,216,0.55)" }}
                  whileHover={{ scale: 1.04 }}
                >
                  {active && (
                    <motion.span
                      className="absolute inset-0 rounded-full"
                      style={{ background: "rgba(224,88,24,0.18)", border: "1px solid rgba(224,88,24,0.3)" }}
                      layoutId="nav-pill"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 hidden md:inline">{item.label}</span>
                </motion.span>
              </Link>
            );
          })}
        </nav>

        {/* Disclaimer badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full"
          style={{ background: "rgba(184,32,32,0.15)", border: "1px solid rgba(184,32,32,0.3)" }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#B82020" }} />
          <span className="text-[11px] font-semibold" style={{ color: "#E07070" }}>Not Financial Advice</span>
        </div>
      </div>
    </header>
  );
}
