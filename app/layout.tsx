import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import MeshBackground from "@/components/ui/MeshBackground";

export const metadata: Metadata = {
  title: "LokSabha Stock Signal | Research Tool",
  description:
    "Does Indian Parliamentary debate move sector stocks? Real NSE data × real Lok Sabha sessions. Academic research — not financial advice.",
  keywords: ["Lok Sabha", "NSE", "stocks", "parliament", "India", "research"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen antialiased">
        <MeshBackground />
        <Navbar />
        <main className="relative z-10 pt-14">{children}</main>
      </body>
    </html>
  );
}
