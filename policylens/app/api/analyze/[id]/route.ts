import { NextRequest, NextResponse } from "next/server";
import { getBillById } from "@/data/bills";
import { analyzeBill } from "@/lib/analyze";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const bill = getBillById(id);

  if (!bill) {
    return NextResponse.json({ error: "Bill not found" }, { status: 404 });
  }

  if (!bill.fullText) {
    return NextResponse.json(
      { error: "No bill text available" },
      { status: 400 }
    );
  }

  try {
    const analysis = await analyzeBill(bill.title, bill.fullText);
    return NextResponse.json(analysis);
  } catch (err) {
    console.error("Analysis error:", err);
    return NextResponse.json(
      { error: "Failed to analyze bill" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const customText: string | undefined = body.text;

  let billTitle: string;
  let billText: string;

  if (id === "custom" && customText) {
    billTitle = body.title || "Custom Bill";
    billText = customText;
  } else {
    const bill = getBillById(id);
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
    return NextResponse.json(
      { error: "Failed to analyze bill" },
      { status: 500 }
    );
  }
}
