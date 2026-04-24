import { NextRequest, NextResponse } from "next/server";
import { getBillById as getLocalBill } from "@/data/bills";
import { analyzeBill } from "@/lib/analyze";
import { parseCgovId, getBillById as getCgovBill, getBillSummary } from "@/lib/congress";

export const maxDuration = 120;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let billTitle: string;
  let billText: string;

  if (id.startsWith("cgov_")) {
    const { congress, type, number } = parseCgovId(id);
    const [bill, summary] = await Promise.all([
      getCgovBill(congress, type, number),
      getBillSummary(congress, type, number),
    ]);
    if (!bill) return NextResponse.json({ error: "Bill not found" }, { status: 404 });
    if (!summary) return NextResponse.json({ error: "No summary available for this bill" }, { status: 400 });
    billTitle = bill.title;
    billText = `Bill: ${bill.billNumber} — ${bill.title}\nSponsor: ${bill.sponsor} (${bill.sponsorParty}-${bill.sponsorState})\nLatest Action: ${bill.latestAction}\n\nCongress.gov Official Summary:\n${summary}`;
  } else {
    const bill = getLocalBill(id);
    if (!bill || !bill.fullText) {
      return NextResponse.json({ error: "Bill not found" }, { status: 404 });
    }
    billTitle = bill.title;
    billText = bill.fullText;
  }

  try {
    const analysis = await analyzeBill(billTitle, billText);
    return NextResponse.json(analysis);
  } catch (err) {
    console.error("Analysis error:", err);
    return NextResponse.json({ error: "Failed to analyze bill" }, { status: 500 });
  }
}
