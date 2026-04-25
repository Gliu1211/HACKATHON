import { NextRequest, NextResponse } from "next/server";
import { getBillById as getLocalBill } from "@/data/bills";
import { parseCgovId, getBillById as getCgovBill, getBillSummary } from "@/lib/congress";
import { Mistral } from "@mistralai/mistralai";

export const maxDuration = 60;

const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY, timeoutMs: 60_000 });

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let billTitle: string;
  let billContext: string;

  if (id.startsWith("cgov_")) {
    const { congress, type, number } = parseCgovId(id);
    const [bill, summary] = await Promise.all([
      getCgovBill(congress, type, number),
      getBillSummary(congress, type, number),
    ]);
    if (!bill) return NextResponse.json({ error: "Bill not found" }, { status: 404 });
    billTitle = bill.title;
    billContext = summary?.slice(0, 2000) ?? bill.title;
  } else {
    const bill = getLocalBill(id);
    if (!bill) return NextResponse.json({ error: "Bill not found" }, { status: 404 });
    billTitle = bill.title;
    billContext = bill.summary;
  }

  const prompt = `Explain the following bill to a 12-year-old in 3-4 short sentences. Use simple words, a relatable analogy if helpful, and no jargon. Make it accurate but genuinely easy to understand.

Bill: ${billTitle}
Summary: ${billContext}

Return ONLY a JSON object: { "explanation": "your explanation here" }`;

  try {
    const response = await client.chat.complete({
      model: "mistral-large-latest",
      messages: [{ role: "user", content: prompt }],
    });

    const content = response.choices?.[0]?.message?.content;
    if (typeof content !== "string") throw new Error("No response");

    const json = content.trim().replace(/^```json\n?/, "").replace(/\n?```$/, "");
    const { explanation } = JSON.parse(json);
    return NextResponse.json({ explanation });
  } catch (err) {
    console.error("ELI5 error:", err);
    return NextResponse.json({ error: "Failed to generate explanation" }, { status: 500 });
  }
}
