import { NextRequest, NextResponse } from "next/server";
import { analyzeBill } from "@/lib/analyze";

export const maxDuration = 120;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { title, text } = body;

  if (!text || text.trim().length < 100) {
    return NextResponse.json({ error: "Bill text must be at least 100 characters" }, { status: 400 });
  }

  try {
    const analysis = await analyzeBill(title || "Custom Bill", text);
    return NextResponse.json(analysis);
  } catch (err) {
    console.error("Custom analysis error:", err);
    return NextResponse.json({ error: "Failed to analyze bill" }, { status: 500 });
  }
}
