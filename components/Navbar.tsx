"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import TextShimmer from "@/components/ui/TextShimmer";
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
      className="fixed top-0 left-0 right-0 z-50 glass-strong"
      style={{ borderBottom: "1px solid rgba(255,107,53,0.2)", height: 56 }}
    >
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <motion.div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-black text-sm"
            style={{ background: "linear-gradient(135deg, #FF6B35, #ff9d6f)" }}
            whileHover={{ scale: 1.08, rotate: 3 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            🏛
          </motion.div>
          <TextShimmer className="font-bold text-[15px] tracking-tight hidden sm:inline">
            LokSabha Stock Signal
          </TextShimmer>
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-1">
          {NAV.map((item) => {
            const active = path === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <motion.span
                  className={cn(
                    "relative px-3 py-1.5 rounded-full text-[13px] font-medium transition-colors",
                    active ? "text-lss-text" : "text-lss-secondary hover:text-lss-text"
                  )}
                  whileHover={{ scale: 1.04 }}
                >
                  {active && (
                    <motion.span
                      className="absolute inset-0 rounded-full"
                      style={{ background: "rgba(255,107,53,0.12)", border: "1px solid rgba(255,107,53,0.25)" }}
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
          style={{ background: "rgba(248,81,73,0.1)", border: "1px solid rgba(248,81,73,0.25)" }}>
          <span className="w-1.5 h-1.5 rounded-full bg-lss-red animate-pulse-glow" />
          <span className="text-lss-red text-[11px] font-semibold">Not Financial Advice</span>
        </div>
      </div>
    </header>
  );
}
