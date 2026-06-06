/**
 * Seed script: inserts all real parliament events into Supabase.
 * Run once: npm run seed
 * Safe to re-run — uses upsert (no duplicates).
 */
import { createClient } from "@supabase/supabase-js";
import { PARLIAMENT_EVENTS } from "../lib/parliament";

const url  = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://krfhvhrloeytjjitwbrw.supabase.co";
const key  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtyZmh2aHJsb2V5dGpqaXR3YnJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3MTY0MzEsImV4cCI6MjA4OTI5MjQzMX0.fTIn3mwP_x6dQzT-vA6OfB9sSgrFAg8OxzmSyR-njWk";
const db   = createClient(url, key);

async function seed() {
  console.log(`\nSeeding ${PARLIAMENT_EVENTS.length} parliament events…`);

  const { error } = await db
    .from("parliament_events")
    .upsert(PARLIAMENT_EVENTS, { onConflict: "id" });

  if (error) {
    console.error("❌ Seed failed:", error.message);
    process.exit(1);
  }

  console.log(`✅ Seeded ${PARLIAMENT_EVENTS.length} events successfully.`);

  // Verify
  const { count } = await db
    .from("parliament_events")
    .select("*", { count: "exact", head: true });

  console.log(`   Table now has ${count} rows.`);
}

seed();
