import { NextRequest, NextResponse } from "next/server";
import { searchBills } from "@/lib/congress";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q");
  if (!q || q.trim().length < 2) {
    return NextResponse.json({ results: [] });
  }
  try {
    const results = await searchBills(q.trim());
    return NextResponse.json({ results });
  } catch (err) {
    console.error("Congress search error:", err);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
