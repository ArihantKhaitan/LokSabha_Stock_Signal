import { NextResponse } from "next/server";
import { PARLIAMENT_EVENTS } from "@/lib/parliament";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sector  = searchParams.get("sector");
  const session = searchParams.get("session");

  let events = PARLIAMENT_EVENTS;
  if (sector)  events = events.filter((e) => e.sector  === sector);
  if (session) events = events.filter((e) => e.session === session);

  return NextResponse.json({ events, total: events.length });
}
