import { NextResponse } from "next/server";
import { fetchTickerHistory } from "@/lib/stocks";
import { DATA_START, dataEnd } from "@/lib/sectors";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: { ticker: string } }
) {
  const { searchParams } = new URL(req.url);
  const from  = searchParams.get("from")  ?? DATA_START;
  const to    = searchParams.get("to")    ?? dataEnd();

  try {
    const data = await fetchTickerHistory(params.ticker, from, to);
    return NextResponse.json({ ticker: params.ticker, from, to, rows: data, count: data.length });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
