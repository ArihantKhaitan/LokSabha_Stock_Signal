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
            whileHover={{ scale: 1.08 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 18 Q5 4 16 4 Q27 4 27 18" stroke="#E05818" strokeWidth="2.5" strokeLinecap="round" fill="rgba(224,88,24,0.1)"/>
              <rect x="6.5" y="18" width="3.5" height="8.5" rx="1" fill="#E05818" opacity="0.8"/>
              <rect x="14.25" y="15" width="3.5" height="11.5" rx="1" fill="#E05818"/>
              <rect x="22" y="18" width="3.5" height="8.5" rx="1" fill="#E05818" opacity="0.8"/>
              <rect x="3.5" y="26.5" width="25" height="2.5" rx="1.25" fill="#E05818"/>
              <circle cx="16" cy="4" r="1.8" fill="#E05818"/>
            </svg>
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

        {/* Spacer to balance flex layout */}
        <div className="w-[130px]" />
      </div>
    </header>
  );
}
